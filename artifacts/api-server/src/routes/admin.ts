import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminLoginResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) {
    req.log.error("ADMIN_PASSWORD environment variable not set");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const isValid = parsed.data.password === adminPassword;

  if (!isValid) {
    res.status(401).json(AdminLoginResponse.parse({ success: false, message: "Password salah" }));
    return;
  }

  res.json(AdminLoginResponse.parse({ success: true, message: "Login berhasil" }));
});

export default router;
