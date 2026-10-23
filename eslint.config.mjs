import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            "no-unreachable": "error",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
        },
    },
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "components/ui/**"]),
]);
