import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import queuesRouter from "./queues";
import tokensRouter from "./tokens";
import analyticsRouter from "./analytics";
import displayRouter from "./display";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/queues", queuesRouter);
router.use(tokensRouter);
router.use("/analytics", analyticsRouter);
router.use("/display", displayRouter);

export default router;
