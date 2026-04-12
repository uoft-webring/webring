export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const signals = ["SIGSEGV", "SIGABRT", "SIGBUS", "SIGFPE", "SIGILL"] as const;

        for (const sig of signals) {
            process.on(sig, () => {
                console.error(`\n[CRASH] Process received ${sig} at ${new Date().toISOString()}`);
                console.error(`[CRASH] Memory: ${JSON.stringify(process.memoryUsage())}`);
                console.error(`[CRASH] Uptime: ${process.uptime()}s`);
                process.exit(1);
            });
        }

        process.on("exit", (code) => {
            if (code !== 0) {
                console.error(`[EXIT] Process exiting with code ${code} at ${new Date().toISOString()}`);
                console.error(`[EXIT] Memory: ${JSON.stringify(process.memoryUsage())}`);
            }
        });

        process.on("uncaughtException", (err) => {
            console.error(`[UNCAUGHT] ${err.stack || err.message}`);
        });

        process.on("unhandledRejection", (reason) => {
            console.error(`[UNHANDLED REJECTION] ${reason}`);
        });

        console.log("[instrumentation] Crash handlers registered");
    }
}
