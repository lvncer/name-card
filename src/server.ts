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

  // 効率的なファイル監視（デバウンス付き）
  let reloadTimeout: NodeJS.Timeout | null = null;
  const watcher = watch(absoluteMarkdownPath, {
    ignored: /[\/\\]\./,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  });

  watcher.on("change", async () => {
    console.log("Markdown file changed, preparing reload notification...");

    // デバウンス（短時間での複数変更を防ぐ）
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }

    reloadTimeout = setTimeout(async () => {
      try {
        // HTTP通信ではなく、直接APIを呼び出し（パフォーマンス向上）
        const response = await fetch(`http://localhost:${options.port}/api/reload`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'name-card-internal'
          },
          body: JSON.stringify({ type: 'reload', source: 'file-watcher' }),
          signal: AbortSignal.timeout(5000) // 5秒タイムアウト
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`Reload notification sent to ${result.clientCount} clients`);
        }
      } catch (error) {
        // サイレントフェイル（サーバーは継続）
        console.log("Note: Reload notification failed, but server continues running");
      }
    }, 150); // 150ms デバウンス
  });

  // ブラウザ自動起動
  if (options.openBrowser) {
    setTimeout(() => {
      open(`http://localhost:${options.port}`);
    }, 3000);
  }

  // 最適化されたプロセス終了処理
  const gracefulShutdown = () => {
    console.log("\nGracefully shutting down server...");
    
    // ファイル監視停止
    watcher.close();
    
    // タイムアウトクリア
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }
    
    // Next.jsプロセス終了
    nextProcess.kill('SIGTERM');
    
    // 強制終了のフォールバック
    setTimeout(() => {
      console.log("Force killing process...");
      nextProcess.kill('SIGKILL');
      process.exit(1);
    }, 5000);
    
    nextProcess.on('exit', () => {
      console.log("Server shut down successfully");
      process.exit(0);
    });
  };

  // 複数のシグナルを監視
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);

  // プロセス終了時のクリーンアップは buildAndStart 内で処理
}
