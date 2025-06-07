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
const os_1 = require("os");
const fs_1 = require("fs");
async function startServer(markdownFile, options) {
    const webDir = (0, path_1.resolve)(__dirname, "../web");
    const absoluteMarkdownPath = (0, path_1.resolve)(markdownFile);
    console.log(`Starting server for: ${markdownFile}`);
    console.log(`Web directory: ${webDir}`);
    // webディレクトリの依存関係確認
    const nodeModulesPath = (0, path_1.resolve)(webDir, "node_modules");
    if (!(0, fs_1.existsSync)(nodeModulesPath)) {
        console.log("Installing web dependencies...");
        const npmCommand = (0, os_1.platform)() === "win32" ? "npm.cmd" : "npm";
        const installProcess = (0, child_process_1.spawn)(npmCommand, ["install"], {
            cwd: webDir,
            stdio: "inherit",
            shell: true,
        });
        await new Promise((resolve, reject) => {
            installProcess.on("close", (code) => {
                if (code === 0) {
                    console.log("Dependencies installed successfully");
                    resolve();
                }
                else {
                    reject(new Error(`npm install failed with code ${code}`));
                }
            });
            installProcess.on("error", (error) => {
                reject(error);
            });
        });
    }
    // Next.js サーバー起動
    // Windows環境でのnpmコマンド解決
    const npmCommand = (0, os_1.platform)() === "win32" ? "npm.cmd" : "npm";
    const nextProcess = (0, child_process_1.spawn)(npmCommand, ["run", "dev"], {
        cwd: webDir,
        stdio: "inherit",
        shell: true, // Windows環境でのコマンド実行を確実にする
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
        console.error("Please ensure npm is installed and available in PATH");
        console.error(`Attempted to run: ${npmCommand} run dev`);
        console.error(`Working directory: ${webDir}`);
        watcher.close();
        process.exit(1);
    });
    nextProcess.on("exit", (code, signal) => {
        if (code !== 0) {
            console.error(`Next.js server exited with code ${code} and signal ${signal}`);
            watcher.close();
            process.exit(1);
        }
    });
}
//# sourceMappingURL=server.js.map