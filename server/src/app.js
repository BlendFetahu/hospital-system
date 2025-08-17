// server/src/app.js
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const { requireAuth, requireRole } = require("./middlewares/auth");
const doctors = require("./routes/doctors");
const patients = require("./routes/patients");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",   // ⬅️ URL e klientit tënd (Vite)
  credentials: false,                // përdorim Authorization header, jo cookies
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.get("/health", (_req,res)=>res.json({ok:true}));
app.use("/auth", auth);
app.use("/doctors", doctors);
app.use("/patients", patients);

app.get("/me", requireAuth, (req,res)=>res.json({user:req.user}));
app.get("/admin/ping",  requireAuth, requireRole("ADMIN"),  (_req,res)=>res.json({ok:true}));
app.get("/doctor/ping", requireAuth, requireRole("DOCTOR"), (_req,res)=>res.json({ok:true}));
app.get("/patient/ping",requireAuth, requireRole("PATIENT"),(_req,res)=>res.json({ok:true}));

module.exports = app;
