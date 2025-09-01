const express = require('express');
const router = express.Router();

const { pool } = require('../db'); // ✅ correct import
const { requireAuth, requireRole } = require('../middlewares/auth');

// Utility: build uniform API errors
function apiError(res, status, message, code = 'BAD_REQUEST') {
  return res.status(status).json({ message, code });
}

// Utility: simple validators
function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0; }
function isISODate(v) { if (!v) return false; const d = new Date(v); return !isNaN(d.getTime()); }
function isEmail(v) { if (!v) return false; return /.+@.+\..+/.test(v); }
function toNullable(v) { return v === undefined ? null : v; }

// Resolve doctor id for the logged-in user (if role == DOCTOR)
async function getDoctorIdByUserId(conn, userId) {
  const [rows] = await conn.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
}

// Access check helpers
async function canReadOrModifyPatient(conn, user, patientId) {
  if (user.role === 'ADMIN') return true; // ADMIN: full access

  if (user.role === 'PATIENT') { // PATIENT: only own record
    const [rows] = await conn.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
    if (!rows.length) return false;
    return rows[0].user_id === user.id;
  }

  if (user.role === 'DOCTOR') { // DOCTOR: patients they created (or unassigned)
    const doctorId = await getDoctorIdByUserId(conn, user.id);
    if (!doctorId) return false;
    const [rows] = await conn.query(
      'SELECT 1 FROM patients WHERE id = ? AND (created_by_doctor_id = ? OR created_by_doctor_id IS NULL)',
      [patientId, doctorId]
    );
    return !!rows.length;
  }
  return false;
}

/* =========================
   SELF ROUTES FOR PATIENTS
   ========================= */

// GET /patients/me – profile of current logged-in patient
router.get('/me', requireAuth, requireRole('PATIENT'), async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT p.id, p.user_id, p.first_name, p.last_name, p.name, p.email, p.phone, p.gender, p.dob
       FROM patients p
       WHERE p.user_id = ?
       LIMIT 1`,
      [req.user.id]
    );
    if (!row) return res.status(404).json({ message: 'patient record not found' });
    res.json(row);
  } catch (e) {
    console.error('GET /patients/me error', e);
    res.status(500).json({ message: 'get self failed' });
  }
});

// GET /patients/me/appointments – list my appointments
router.get('/me/appointments', requireAuth, requireRole('PATIENT'), async (req, res) => {
  try {
    const [[p]] = await pool.query('SELECT id FROM patients WHERE user_id=? LIMIT 1', [req.user.id]);
    if (!p) return res.status(404).json({ message: 'patient record not found' });

    const [rows] = await pool.query(
      `SELECT a.id, a.doctor_id, a.patient_id, a.scheduled_at, a.status, a.reason,
              d.name AS doctor_name, d.specialty, d.city
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.patient_id = ?
       ORDER BY a.scheduled_at DESC`,
      [p.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /patients/me/appointments error', e);
    res.status(500).json({ message: 'list appointments failed' });
  }
});

// POST /patients/me/appointments – create my appointment  { doctor_id, scheduled_at, reason? }
router.post('/me/appointments', requireAuth, requireRole('PATIENT'), async (req, res) => {
  const { doctor_id, scheduled_at, reason } = req.body || {};
  if (!doctor_id || !scheduled_at) {
    return res.status(400).json({ message: 'doctor_id and scheduled_at are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[p]] = await conn.query('SELECT id FROM patients WHERE user_id=? LIMIT 1', [req.user.id]);
    if (!p) {
      await conn.rollback();
      return res.status(404).json({ message: 'patient record not found' });
    }

    const [[d]] = await conn.query('SELECT id FROM doctors WHERE id=? LIMIT 1', [doctor_id]);
    if (!d) {
      await conn.rollback();
      return res.status(400).json({ message: 'doctor not found' });
    }

    const [rIns] = await conn.query(
      `INSERT INTO appointments (doctor_id, patient_id, scheduled_at, status, reason)
       VALUES (?, ?, ?, 'SCHEDULED', ?)`,
      [doctor_id, p.id, scheduled_at, reason || null]
    );

    await conn.commit();

    const [[created]] = await conn.query(
      `SELECT a.id, a.doctor_id, a.patient_id, a.scheduled_at, a.status, a.reason
       FROM appointments a WHERE a.id = ?`,
      [rIns.insertId]
    );
    res.status(201).json(created);
  } catch (e) {
    try { await conn.rollback(); } catch {}
    console.error('POST /patients/me/appointments error', e);
    res.status(500).json({ message: 'create appointment failed' });
  } finally {
    conn.release();
  }
});

/* =========================
   ADMIN/DOCTOR ROUTES
   ========================= */

// LIST (ADMIN) with pagination + search
router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100);
  const q = (req.query.q || '').trim().toLowerCase();
  const offset = (page - 1) * pageSize;

  try {
    const conn = await pool.getConnection();
    try {
      let where = '';
      const params = [];
      if (q) {
        where = 'WHERE LOWER(CONCAT_WS(" ", first_name, last_name, name, email, phone)) LIKE ?';
        params.push(`%${q}%`);
      }

      const [rows] = await conn.query(
        `SELECT id, user_id, first_name, last_name, name, email, phone, gender, dob, created_by_doctor_id
         FROM patients ${where}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [...params, pageSize, offset]
      );

      const [[{ total }]] = await conn.query('SELECT COUNT(*) AS total FROM patients'); // simpler than FOUND_ROWS()
      res.json({ page, pageSize, total, results: rows });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('GET /patients error', err);
    return apiError(res, 500, 'Failed to list patients', 'INTERNAL_ERROR');
  }
});

// DETAIL (self / admin / creating doctor)
router.get('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) return apiError(res, 400, 'Invalid id');

  try {
    const conn = await pool.getConnection();
    try {
      const allowed = await canReadOrModifyPatient(conn, req.user, id);
      if (!allowed) return apiError(res, 403, 'Not allowed', 'FORBIDDEN');

      const [rows] = await conn.query(
        `SELECT p.*, d.name AS created_by_doctor_name
         FROM patients p
         LEFT JOIN doctors d ON d.id = p.created_by_doctor_id
         WHERE p.id = ?`,
        [id]
      );
      if (!rows.length) return apiError(res, 404, 'Patient not found', 'NOT_FOUND');
      return res.json(rows[0]);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('GET /patients/:id error', err);
    return apiError(res, 500, 'Failed to get patient', 'INTERNAL_ERROR');
  }
});

// CREATE (ADMIN or DOCTOR)
router.post('/', requireAuth, requireRole(['ADMIN', 'DOCTOR']), async (req, res) => {
  const { first_name, last_name, email, phone, gender, dob } = req.body || {};

  if (!isNonEmptyString(first_name)) return apiError(res, 400, 'first_name is required');
  if (!isNonEmptyString(last_name)) return apiError(res, 400, 'last_name is required');
  if (email && !isEmail(email)) return apiError(res, 400, 'email is invalid');
  if (dob && !isISODate(dob)) return apiError(res, 400, 'dob must be ISO date');
  if (gender && !['Male', 'Female'].includes(gender)) return apiError(res, 400, "gender must be 'Male' or 'Female'");

  const fullName = `${first_name} ${last_name}`.trim();

  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let createdByDoctorId = null;
      if (req.user.role === 'DOCTOR') {
        createdByDoctorId = await getDoctorIdByUserId(conn, req.user.id);
      }

      const [result] = await conn.query(
        `INSERT INTO patients (user_id, first_name, last_name, name, email, phone, gender, dob, created_by_doctor_id)
         VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, fullName, toNullable(email), toNullable(phone), toNullable(gender), toNullable(dob), createdByDoctorId]
      );

      await conn.commit();

      const [rows] = await conn.query('SELECT * FROM patients WHERE id = ?', [result.insertId]);
      return res.status(201).json(rows[0]);
    } catch (e) {
      try { await conn.rollback(); } catch {}
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('POST /patients error', err);
    return apiError(res, 500, 'Failed to create patient', 'INTERNAL_ERROR');
  }
});

// UPDATE (ADMIN / self / creating doctor)
router.put('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) return apiError(res, 400, 'Invalid id');

  const { first_name, last_name, email, phone, gender, dob } = req.body || {};
  if (email !== undefined && email !== null && !isEmail(email)) return apiError(res, 400, 'email is invalid');
  if (dob !== undefined && dob !== null && !isISODate(dob)) return apiError(res, 400, 'dob must be ISO date');
  if (gender !== undefined && gender !== null && !['Male', 'Female'].includes(gender)) return apiError(res, 400, "gender must be 'Male' or 'Female'");

  try {
    const conn = await pool.getConnection();
    try {
      const allowed = await canReadOrModifyPatient(conn, req.user, id);
      if (!allowed) return apiError(res, 403, 'Not allowed', 'FORBIDDEN');

      const [existingRows] = await conn.query('SELECT * FROM patients WHERE id = ?', [id]);
      if (!existingRows.length) return apiError(res, 404, 'Patient not found', 'NOT_FOUND');
      const existing = existingRows[0];

      const nextFirst = first_name !== undefined ? first_name : existing.first_name;
      const nextLast = last_name !== undefined ? last_name : existing.last_name;
      const nextName = `${nextFirst || ''} ${nextLast || ''}`.trim() || existing.name;

      await conn.query(
        `UPDATE patients
         SET first_name = ?, last_name = ?, name = ?, email = ?, phone = ?, gender = ?, dob = ?
         WHERE id = ?`,
        [
          toNullable(nextFirst),
          toNullable(nextLast),
          toNullable(nextName),
          toNullable(email !== undefined ? email : existing.email),
          toNullable(phone !== undefined ? phone : existing.phone),
          toNullable(gender !== undefined ? gender : existing.gender),
          toNullable(dob !== undefined ? dob : existing.dob),
          id,
        ]
      );

      const [rows] = await conn.query('SELECT * FROM patients WHERE id = ?', [id]);
      return res.json(rows[0]);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('PUT /patients/:id error', err);
    return apiError(res, 500, 'Failed to update patient', 'INTERNAL_ERROR');
  }
});

// DELETE (ADMIN / creating doctor)
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) return apiError(res, 400, 'Invalid id');

  try {
    const conn = await pool.getConnection();
    try {
      if (req.user.role === 'PATIENT') return apiError(res, 403, 'Not allowed', 'FORBIDDEN');

      let allowed = false;
      if (req.user.role === 'ADMIN') {
        allowed = true;
      } else if (req.user.role === 'DOCTOR') {
        const doctorId = await getDoctorIdByUserId(conn, req.user.id);
        if (doctorId) {
          const [rows] = await conn.query(
            'SELECT 1 FROM patients WHERE id = ? AND (created_by_doctor_id = ? OR created_by_doctor_id IS NULL)',
            [id, doctorId]
          );
          allowed = !!rows.length;
        }
      }
      if (!allowed) return apiError(res, 403, 'Not allowed', 'FORBIDDEN');

      await conn.beginTransaction();

      const [result] = await conn.query('DELETE FROM patients WHERE id = ?', [id]);
      await conn.commit();

      if (result.affectedRows === 0) return apiError(res, 404, 'Patient not found', 'NOT_FOUND');
      return res.json({ success: true });
    } catch (e) {
      try { await pool.query('ROLLBACK'); } catch {}
      throw e;
    }
  } catch (err) {
    console.error('DELETE /patients/:id error', err);
    return apiError(res, 500, 'Failed to delete patient', 'INTERNAL_ERROR');
  }
});
// CREATE or UPDATE my patient profile
router.put('/me', requireAuth, requireRole('PATIENT'), async (req, res) => {
  const { first_name, last_name, phone, gender, dob } = req.body || {};

  if (gender && !['Male','Female'].includes(gender)) {
    return res.status(400).json({ message: "gender must be 'Male' or 'Female'" });
  }
  if (dob && isNaN(new Date(dob).getTime())) {
    return res.status(400).json({ message: 'dob must be ISO date' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // the logged-in user (guaranteed by requireAuth)
    const [[user]] = await conn.query('SELECT id, email FROM users WHERE id=?', [req.user.id]);
    if (!user) {
      await conn.rollback();
      return res.status(404).json({ message: 'user not found' });
    }

    // do we already have a patient row?
    const [[existing]] = await conn.query('SELECT * FROM patients WHERE user_id=? LIMIT 1', [user.id]);

    if (!existing) {
      // create new patient linked to this user
      const name = [first_name || '', last_name || ''].join(' ').trim() || null;
      const [ins] = await conn.query(
        `INSERT INTO patients (user_id, first_name, last_name, name, email, phone, gender, dob, created_by_doctor_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        [user.id, first_name || null, last_name || null, name, user.email, phone || null, gender || null, dob || null]
      );
      const [[created]] = await conn.query('SELECT * FROM patients WHERE id=?', [ins.insertId]);
      await conn.commit();
      return res.status(201).json(created);
    } else {
      // update existing patient row
      const nextFirst = first_name !== undefined ? first_name : existing.first_name;
      const nextLast  = last_name  !== undefined ? last_name  : existing.last_name;
      const nextName  = (nextFirst || nextLast) ? `${nextFirst || ''} ${nextLast || ''}`.trim() : existing.name;

      await conn.query(
        `UPDATE patients
           SET first_name=?, last_name=?, name=?, phone=?, gender=?, dob=?
         WHERE id=?`,
        [
          nextFirst || null,
          nextLast || null,
          nextName || null,
          phone !== undefined ? (phone || null) : existing.phone,
          gender !== undefined ? (gender || null) : existing.gender,
          dob !== undefined ? (dob || null) : existing.dob,
          existing.id
        ]
      );
      const [[updated]] = await conn.query('SELECT * FROM patients WHERE id=?', [existing.id]);
      await conn.commit();
      return res.json(updated);
    }
  } catch (e) {
    try { await conn.rollback(); } catch {}
    console.error('PUT /patients/me error', e);
    return res.status(500).json({ message: 'save self failed' });
  } finally {
    conn.release();
  }
});
router.get('/__ping', (_req, res) => res.json({ ok: true, where: 'patients router' }));

module.exports = router;
