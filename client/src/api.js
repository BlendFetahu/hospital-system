// client/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ---- DOCTORS ----
// ---- Merr doktoret (Admini)
export async function getDoctors({ search = "" } = {}) {
  const { data } = await api.get("/doctors", { params: { search } });
  return data; // backend kthen array
}

// ---Krijo doktoret (Admini)
export async function createDoctor(payload) {
  const { data } = await api.post("/doctors", payload);
  return data;
}

// ---- PATIENTS ----
// Merr pacientët (ADMIN)
export async function getPatients({ search = "" } = {}) {
  const { data } = await api.get("/patients", { params: { search } });
  return data; // backend kthen array
}

// Fshij pacient (ADMIN)  -> kërkon endpoint në backend, shiko Hapin 2
export async function deletePatient(id) {
  const { data } = await api.delete(`/patients/${id}`);
  return data;
}

// ---- (opsionale) Stats ----
export async function getAdminStats() {
  const { data } = await api.get("/admin/stats");
  return data; // { doctors: n, patients: n, appointmentsToday: n }
}

