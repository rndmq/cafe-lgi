import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app";

// Vercel Node.js runtime entrypoint (Build Output API).
// Vercel invokes this exported function per-request with raw Node
// req/res objects; Express's own `app` is itself a valid
// `(req, res) => void` request handler, so we just forward to it.
export default function handler(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  app(req, res);
}
