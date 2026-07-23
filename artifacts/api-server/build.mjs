import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm, mkdir, writeFile } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

// Shared esbuild options for both the local (dist/) and Vercel
// (.vercel/output/) builds so the two never drift apart.
const sharedEsbuildOptions = {
  platform: "node",
  bundle: true,
  format: "esm",
  outExtension: { ".js": ".mjs" },
  logLevel: "info",
  // Some packages may not be bundleable, so we externalize them, we can add more here as needed.
  // Some of the packages below may not be imported or installed, but we're adding them in case they are in the future.
  // Examples of unbundleable packages:
  // - uses native modules and loads them dynamically (e.g. sharp)
  // - use path traversal to read files (e.g. @google-cloud/secret-manager loads sibling .proto files)
  external: [
    "*.node",
    "sharp",
    "better-sqlite3",
    "sqlite3",
    "canvas",
    "bcrypt",
    "argon2",
    "fsevents",
    "re2",
    "farmhash",
    "xxhash-addon",
    "bufferutil",
    "utf-8-validate",
    "ssh2",
    "cpu-features",
    "dtrace-provider",
    "isolated-vm",
    "lightningcss",
    "pg-native",
    "oracledb",
    "mongodb-client-encryption",
    "nodemailer",
    "handlebars",
    "knex",
    "typeorm",
    "protobufjs",
    "onnxruntime-node",
    "@tensorflow/*",
    "@prisma/client",
    "@mikro-orm/*",
    "@grpc/*",
    "@swc/*",
    "@aws-sdk/*",
    "@azure/*",
    "@opentelemetry/*",
    "googleapis",
    "firebase-admin",
    "@parcel/watcher",
    "@sentry/profiling-node",
    "@tree-sitter/*",
    "aws-sdk",
    "classic-level",
    "dd-trace",
    "ffi-napi",
    "grpc",
    "hiredis",
    "kerberos",
    "leveldown",
    "miniflare",
    "mysql2",
    "newrelic",
    "odbc",
    "piscina",
    "realm",
    "ref-napi",
    "rocksdb",
    "sass-embedded",
    "sequelize",
    "serialport",
    "snappy",
    "tinypool",
    "usb",
    "workerd",
    "wrangler",
    "zeromq",
    "zeromq-prebuilt",
    "playwright",
    "puppeteer",
    "puppeteer-core",
    "electron",
  ],
  sourcemap: "linked",
  plugins: [
    // pino relies on workers to handle logging, instead of externalizing it we use a plugin to handle it
    esbuildPluginPino({ transports: ["pino-pretty"] }),
  ],
  // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
  banner: {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
  },
};

async function buildLocalDist() {
  // Local dist/ build: used by `pnpm start` (app.listen()) for local dev.
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    ...sharedEsbuildOptions,
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    outdir: distDir,
  });
}

async function buildVercelOutput() {
  // Vercel Build Output API (v3) build: produces .vercel/output directly,
  // bypassing Vercel's framework/entrypoint auto-detection entirely, since
  // our bundled output doesn't contain a literal `import express` that
  // Vercel's static scanner can find.
  // https://vercel.com/docs/build-output-api/primitives
  const outputDir = path.resolve(artifactDir, ".vercel/output");
  const functionDir = path.resolve(outputDir, "functions/index.func");

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(functionDir, { recursive: true });

  await esbuild({
    ...sharedEsbuildOptions,
    entryPoints: [path.resolve(artifactDir, "src/vercel-handler.ts")],
    outdir: functionDir,
  });

  await writeFile(
    path.resolve(functionDir, ".vc-config.json"),
    JSON.stringify(
      {
        runtime: "nodejs22.x",
        handler: "vercel-handler.mjs",
        launcherType: "Nodejs",
        shouldAddHelpers: true,
        shouldAddSourcemapSupport: true,
      },
      null,
      2,
    ),
  );

  await writeFile(
    path.resolve(outputDir, "config.json"),
    JSON.stringify(
      {
        version: 3,
        routes: [{ src: "/(.*)", dest: "/index" }],
      },
      null,
      2,
    ),
  );
}

async function buildAll() {
  await buildLocalDist();
  await buildVercelOutput();
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
