import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        globals: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(root, "."),
            "server-only": path.resolve(root, "__tests__/stubs/server-only.ts"),
        },
    },
});
