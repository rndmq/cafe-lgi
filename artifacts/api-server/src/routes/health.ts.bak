import { Router, Request, Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

// 1. Biarkan TypeScript menginfer tipe Router secara otomatis
const router = Router();

// 2. Beri tipe data eksplisit Request dan Response pada handler
router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
