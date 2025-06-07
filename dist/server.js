"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const child_process_1 = require("child_process");
const chokidar_1 = require("chokidar");
const open_1 = __importDefault(require("open"));
const path_1 = require("path");
async function startServer(markdownFile, options) {
    const webDir = (0, path_1.resolve)(__dirname, "../web");
    const absoluteMarkdownPath = (0, path_1.resolve)(markdownFile);
    console.log(`Starting server for: ${markdownFile}`);
    console.log(`Web directory: ${webDir}`);
    // Next.js サーバー起動
    const nextProcess = (0, child_process_1.spawn)("npm", ["run", "dev"], {
        cwd: webDir,
        stdio: "inherit",
        env: {
            ...process.env,
            MARKDOWN_FILE: absoluteMarkdownPath,
            PORT: options.port.toString(),
        },
    });
    // ファイル監視
    const watcher = (0, chokidar_1.watch)(absoluteMarkdownPath);
    watcher.on("change", () => {
        console.log("Markdown file changed, reloading...");
    });
    // ブラウザ自動起動
    if (options.openBrowser) {
        setTimeout(() => {
            (0, open_1.default)(`http://localhost:${options.port}`);
        }, 3000);
    }
    // プロセス終了処理
    process.on("SIGINT", () => {
        console.log("\nShutting down server...");
        watcher.close();
        nextProcess.kill();
        process.exit(0);
    });
    // Next.js プロセスエラーハンドリング
    nextProcess.on("error", (error) => {
        console.error("Failed to start Next.js server:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map