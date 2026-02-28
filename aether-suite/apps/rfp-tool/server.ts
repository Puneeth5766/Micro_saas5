import express from "express";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: "." });
const handle = app.getRequestHandler();

async function bootstrap() {
  await app.prepare();

  const server = express();

  server.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, () => {
    console.log(`RFP Tool listening on http://localhost:${port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
