import { spawn } from "child_process";
import { watch } from "chokidar";
import open from "open";
import { resolve } from "path";
import { platform } from "os";

interface ServerOptions {
  port: number;
  openBrowser: boolean;
}

export async function startServer(
  markdownFile: string,
  options: ServerOptions
): Promise<void> {
  const webDir = resolve(__dirname, "../web");
  const absoluteMarkdownPath = resolve(markdownFile);

  console.log(`Starting server for: ${markdownFile}`);
  console.log(`Web directory: ${webDir}`);

  // Next.js サーバー起動
  // Windows環境でのnpmコマンド解決
  const npmCommand = platform() === "win32" ? "npm.cmd" : "npm";

  const nextProcess = spawn(npmCommand, ["run", "dev"], {
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
  const watcher = watch(absoluteMarkdownPath);
  watcher.on("change", () => {
    console.log("Markdown file changed, reloading...");
  });

  // ブラウザ自動起動
  if (options.openBrowser) {
    setTimeout(() => {
      open(`http://localhost:${options.port}`);
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
      console.error(
        `Next.js server exited with code ${code} and signal ${signal}`
      );
      watcher.close();
      process.exit(1);
    }
  });
}
