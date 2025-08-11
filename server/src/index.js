import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use((req, _res, next) => { console.log("REQ:", req.method, req.url); next(); });
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// GET test – duhet të kthejë {ok:true}
app.get("/auth/login-test", (_req, res) => res.json({ ok: true }));

// POST test – NUK duhet të jetë 404
app.post("/auth/login", (req, res) => {
  return res.json({ ok: true, where: "inline /auth/login", received: req.body || null });
});

app.get("/", (_req, res) => res.send("Server is running 🚀"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


