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

  // Next.js ビルド＆起動関数
  const buildAndStart = async (): Promise<any> => {
    console.log("Building Next.js application...");
    
    // ビルド実行
    const buildProcess = spawn(npmCommand, ["run", "build"], {
      cwd: webDir,
      stdio: "inherit",
      shell: true,
    });

    await new Promise<void>((resolve, reject) => {
      buildProcess.on("close", (code) => {
        if (code === 0) {
          console.log("Build completed successfully");
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
      buildProcess.on("error", reject);
    });

    console.log("Starting production server...");
    
    // 本番サーバー起動
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

  // 初回ビルド＆起動
  let nextProcess = await buildAndStart();

  // ファイル監視
  const watcher = watch(absoluteMarkdownPath);
  watcher.on("change", async () => {
    console.log("Markdown file changed, rebuilding...");

    try {
      // 現在のサーバーを停止
      nextProcess.kill();
      
      // 再ビルド＆再起動
      nextProcess = await buildAndStart();
      
      console.log("Server restarted successfully");
    } catch (error) {
      console.error("Failed to restart server:", error);
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
