import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menusRouter from "./menus";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menusRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(storageRouter);

export default router;
