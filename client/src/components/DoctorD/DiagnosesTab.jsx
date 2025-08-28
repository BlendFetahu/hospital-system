import { useMemo, useState } from "react";
import Card from "./Card";

export default function DiagnosesTab({ patients, diagnoses, setDiagnoses, fullName, fmt }) {
  const [form, setForm] = useState({ patientId: "", title: "", description: "" });
  const [diagFilter, setDiagFilter] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const visibleDiagnoses = useMemo(() => {
    const q = (diagFilter || "").toLowerCase();
    if (!q) return diagnoses;
    return diagnoses.filter(d => (d.patientName || "").toLowerCase().includes(q));
  }, [diagnoses, diagFilter]);

  const resetDiagForm = () => {
    setForm({ patientId: "", title: "", description: "" });
    setDiagFilter("");
  };

  function submitDiagnosis(e) {
    e.preventDefault();
    if (!form.patientId || !form.title) { alert("Select patient and enter title."); return; }
    const p = patients.find(x => String(x.id) === String(form.patientId));
    const item = {
      id: Date.now(),
      patientId: Number(form.patientId),
      patientName: p ? fullName(p) : "Unknown",
      title: form.title,
      description: form.description,
      created_at: new Date().toISOString(),
    };
    setDiagnoses(prev => [item, ...prev]);
    resetDiagForm();
    alert("Saved (demo)");
  }

  function startEdit(d) {
    setEditId(d.id);
    setEditForm({ title: d.title, description: d.description || "" });
  }

  function saveEdit(e) {
    e.preventDefault();
    setDiagnoses(prev => prev.map(d => (d.id === editId ? { ...d, ...editForm } : d)));
    setEditId(null);
  }

  function deleteDiagnosis(id) {
    if (!confirm("Delete this diagnosis?")) return;
    setDiagnoses(prev => prev.filter(d => d.id !== id));
  }

  return (
    <Card title="Diagnoses">
      {/* ====== FORM (layout only changed) ====== */}
      <form
        onSubmit={submitDiagnosis}
        className="grid gap-3 grid-cols-1 md:grid-cols-12 items-start mb-4"
      >
        {/* Search + picker */}
        <div className="relative md:col-span-4">
          <input
            className="border p-2.5 rounded w-full"
            placeholder="Search patient…"
            value={diagFilter}
            onChange={e => { setDiagFilter(e.target.value); setShowPicker(true); }}
            onFocus={() => setShowPicker(true)}
            onBlur={() => setTimeout(() => setShowPicker(false), 150)}
          />
          {showPicker && diagFilter && (
            <ul className="absolute z-10 bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto w-full">
              {patients
                .filter(p => fullName(p).toLowerCase().includes(diagFilter.toLowerCase()))
                .map(p => (
                  <li
                    key={p.id}
                    onClick={() => {
                      setForm(prev => ({ ...prev, patientId: p.id.toString() }));
                      setDiagFilter(fullName(p));
                      setShowPicker(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-emerald-50"
                  >
                    {fullName(p)}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Title */}
        <div className="md:col-span-6">
          <input
            className="border p-2.5 rounded w-full"
            placeholder="Diagnosis title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Save button (top row, right-aligned on desktop) */}
        <div className="md:col-span-2 md:justify-self-end md:self-stretch">
          <button
            type="submit"
            className="w-full h-full md:h-auto px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white"
          >
            Save
          </button>
        </div>

        {/* Notes / description (full width, below) */}
        <div className="md:col-span-12">
          <textarea
            className="border p-2.5 rounded w-full min-h-[120px]"
            placeholder="Report / notes (long text)…"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </form>

      {visibleDiagnoses.length === 0 && (
        <div className="text-sm text-gray-500">No diagnoses match.</div>
      )}

      <ul className="space-y-2">
        {visibleDiagnoses.map(d => (
          <li key={d.id} className="rounded border p-3">
            {editId !== d.id ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{d.title} — {d.patientName}</div>
                  <div className="text-xs text-gray-600">{fmt(d.created_at)}</div>
                </div>
                {d.description && (
                  <div className="text-sm mt-1 whitespace-pre-wrap">{d.description}</div>
                )}
                <div className="mt-2 flex gap-2">
                  <button className="text-xs px-3 py-1 rounded bg-sky-600 text-white" onClick={() => startEdit(d)}>Edit</button>
                  <button className="text-xs px-3 py-1 rounded bg-rose-600 text-white" onClick={() => deleteDiagnosis(d.id)}>Delete</button>
                </div>
              </>
            ) : (
              <form onSubmit={saveEdit} className="flex gap-2 flex-wrap">
                <input
                  className="border p-2 rounded flex-1 min-w-[220px] w-full sm:w-auto"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
                <textarea
                  className="border p-2 rounded flex-[2] min-h-[100px] w-full"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
                <button className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto sm:flex-1" type="submit">Save</button>
                <button className="text-xs px-3 py-1 rounded bg-gray-200" type="button" onClick={() => setEditId(null)}>Cancel</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
