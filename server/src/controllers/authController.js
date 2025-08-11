import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "DOCTOR", "PATIENT"]).optional()
});

export async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, password: hashed, role: data.role ?? "PATIENT" },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    return res.status(201).json({ user });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ message: "Invalid data", issues: err.issues });
    return res.status(500).json({ message: "Server error" });
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true në prod me HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ message: "Logged in", user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ message: "Invalid data", issues: err.issues });
    return res.status(500).json({ message: "Server error" });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
