const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const { pool } = require("./db");




(async ()=>{
  const pwd = bcrypt.hashSync("123456",10);

  async function ensureUser(email, role){
    const [rows] = await pool.query("SELECT id FROM users WHERE email=?",[email]);
    if(rows.length) return rows[0].id;
    const [res] = await pool.query("INSERT INTO users (email,password,role) VALUES (?,?,?)",[email,pwd,role]);
    return res.insertId;
  }

  const adminId = await ensureUser("admin@test.com","ADMIN");
  const docId   = await ensureUser("doc@test.com","DOCTOR");
  const patId   = await ensureUser("patient@test.com","PATIENT");

  const [d] = await pool.query("SELECT id FROM doctors WHERE user_id=?",[docId]);
  if(!d.length) await pool.query("INSERT INTO doctors (user_id,name,specialty,city) VALUES (?,?,?)",[docId,"Dr. Demo","General","Prishtine"]);

  const [p] = await pool.query("SELECT id FROM patients WHERE user_id=?",[patId]);
  if(!p.length) await pool.query("INSERT INTO patients (user_id,name) VALUES (?,?)",[patId,"Patient Demo"]);

  console.log("Seed done"); process.exit(0);
})().catch(e=>{ console.error(e); process.exit(1); });
