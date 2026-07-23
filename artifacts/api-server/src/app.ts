import express, { type Express } from "express";
import cors from "cors";
import { pinoHttp } from 'pino-http';
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global error handler — must be registered last, and must have 4 args
// for Express to recognize it as an error handler (not a regular
// middleware). Express 5 automatically forwards rejected promises from
// async route handlers here.
//
// Drizzle wraps the underlying Postgres error in `error.cause`, and the
// default Node.js/Vercel crash printer only prints `error.stack` — which
// hides the real Postgres error message. We log `cause` explicitly here
// so it shows up in Vercel's runtime logs.
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ) => {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(
      {
        err: {
          message: error.message,
          stack: error.stack,
          cause:
            error.cause instanceof Error
              ? { message: error.cause.message, stack: error.cause.stack }
              : error.cause,
        },
        req: { method: req.method, url: req.originalUrl },
      },
      "Unhandled error",
    );

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default app;
