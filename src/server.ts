import { spawn } from "child_process";
import { watch } from "chokidar";
import open from "open";
import { resolve } from "path";

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
  const nextProcess = spawn("npm", ["run", "dev"], {
    cwd: webDir,
    stdio: "inherit",
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
    process.exit(1);
  });
}
