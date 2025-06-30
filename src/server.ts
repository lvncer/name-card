import { spawn } from "child_process";
import { watch } from "chokidar";
import open from "open";
import { resolve } from "path";
import { platform } from "os";
import { existsSync } from "fs";

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

  // webディレクトリの依存関係確認
  const nodeModulesPath = resolve(webDir, "node_modules");
  if (!existsSync(nodeModulesPath)) {
    console.log("Installing web dependencies...");
    const npmCommand = platform() === "win32" ? "npm.cmd" : "npm";

    const installProcess = spawn(npmCommand, ["install"], {
      cwd: webDir,
      stdio: "inherit",
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      installProcess.on("close", (code) => {
        if (code === 0) {
          console.log("Dependencies installed successfully");
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });

      installProcess.on("error", (error) => {
        reject(error);
      });
    });
  }

  // Windows環境でのnpmコマンド解決
  const npmCommand = platform() === "win32" ? "npm.cmd" : "npm";

  // プリビルド済みNext.js サーバー起動関数
  const startPrebuiltServer = async (): Promise<any> => {
    console.log("Starting prebuilt Next.js server...");
    
    // プリビルド済みサーバー起動
    const nextProcess = spawn(npmCommand, ["run", "start"], {
      cwd: webDir,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        MARKDOWN_FILE: absoluteMarkdownPath,
        PORT: options.port.toString(),
      },
    });

    // エラーハンドリング設定
    nextProcess.on("error", (error) => {
      console.error("Failed to start Next.js server:", error);
      console.error("Please ensure npm is installed and available in PATH");
      console.error(`Attempted to run: ${npmCommand} run start`);
      console.error(`Working directory: ${webDir}`);
    });

    nextProcess.on("exit", (code, signal) => {
      if (code !== 0) {
        console.error(
          `Next.js server exited with code ${code} and signal ${signal}`
        );
      }
    });

    return nextProcess;
  };

  // 初回サーバー起動
  let nextProcess = await startPrebuiltServer();

  // ファイル監視（リロード通知のみ）
  const watcher = watch(absoluteMarkdownPath);
  watcher.on("change", async () => {
    console.log("Markdown file changed, sending reload notification...");

    try {
      // リロード通知を送信（サーバーは再起動不要）
      const response = await fetch(`http://localhost:${options.port}/api/reload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reload' })
      });
      
      if (response.ok) {
        console.log("Reload notification sent successfully");
      }
    } catch (error) {
      console.log("Note: Reload notification failed, but server continues running");
    }
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

  // プロセス終了時のクリーンアップは buildAndStart 内で処理
}
