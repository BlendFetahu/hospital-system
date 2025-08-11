import { Router } from "express";
const router = Router();

// TEST: register provizor – vetëm që të mos japë 404
router.post("/register", (req, res) => {
  console.log("REGISTER BODY:", req.body);
  return res.status(201).json({ ok: true, received: req.body });
});

// Mund të mbash edhe ping, s’prish punë
router.get("/ping", (_req, res) => res.json({ ok: true, from: "router" }));

export default router;




