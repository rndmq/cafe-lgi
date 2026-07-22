import { Router, Request, Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

// 🔴 Cukup gunakan Router() tanpa ': IRouter' agar kompatibel dengan Express 5
const router = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
