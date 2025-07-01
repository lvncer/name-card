import { spawn } from "child_process";
import { watch } from "chokidar";
import open from "open";
import { resolve, dirname, basename, extname } from "path";
import { platform } from "os";
import { existsSync, readdirSync, copyFileSync, unlinkSync, mkdirSync } from "fs";

interface ServerOptions {
  port: number;
  openBrowser: boolean;
}

// 画像ファイルの拡張子
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'];

// 自動コピーした画像ファイルのリスト（クリーンアップ用）
let copiedImages: string[] = [];

// 画像ファイル自動検出・コピー機能
function setupImageFiles(markdownFilePath: string, webDir: string): void {
  const markdownDir = dirname(markdownFilePath);
  const publicDir = resolve(webDir, 'public', 'auto-images');
  
  // auto-imagesディレクトリを作成
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  try {
    // markdownファイルと同じディレクトリの画像ファイルを検出
    const files = readdirSync(markdownDir);
    const imageFiles = files.filter(file => 
      IMAGE_EXTENSIONS.includes(extname(file).toLowerCase())
    );

    console.log(`Found ${imageFiles.length} image files in ${markdownDir}`);

    // 画像ファイルをweb/public/auto-imagesにコピー
    imageFiles.forEach(imageFile => {
      const srcPath = resolve(markdownDir, imageFile);
      const destPath = resolve(publicDir, imageFile);
      
      try {
        copyFileSync(srcPath, destPath);
        copiedImages.push(destPath);
        console.log(`📸 Copied image: ${imageFile} -> /auto-images/${imageFile}`);
      } catch (error) {
        console.warn(`Failed to copy image ${imageFile}:`, error);
      }
    });

    if (imageFiles.length > 0) {
      console.log(`\n✨ 画像使用方法:`);
      console.log(`HTMLで以下のように参照してください:`);
      imageFiles.forEach(imageFile => {
        console.log(`  <img src="/auto-images/${imageFile}" alt="画像説明">`);
      });
      console.log('');
    }
  } catch (error) {
    console.warn('Failed to setup image files:', error);
  }
}

// 自動コピーした画像のクリーンアップ
function cleanupImages(): void {
  console.log("Cleaning up auto-copied images...");
  copiedImages.forEach(imagePath => {
    try {
      if (existsSync(imagePath)) {
        unlinkSync(imagePath);
      }
    } catch (error) {
      console.warn(`Failed to cleanup image ${imagePath}:`, error);
    }
  });
  copiedImages = [];
}

export async function startServer(
  markdownFile: string,
  options: ServerOptions
): Promise<void> {
  const webDir = resolve(__dirname, "../web");
  const absoluteMarkdownPath = resolve(markdownFile);
  const markdownDir = dirname(absoluteMarkdownPath);

  console.log(`Starting server for: ${markdownFile}`);
  console.log(`Web directory: ${webDir}`);

  // 画像ファイルの自動検出・コピー
  setupImageFiles(absoluteMarkdownPath, webDir);

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

  // 効率的なファイル監視（デバウンス付き）- Markdownファイルと画像ファイルを監視
  let reloadTimeout: NodeJS.Timeout | null = null;
  const watchPatterns = [
    absoluteMarkdownPath,
    ...IMAGE_EXTENSIONS.map(ext => `${markdownDir}/*${ext}`)
  ];
  
  const watcher = watch(watchPatterns, {
    ignored: /[\/\\]\./,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  });

  watcher.on("change", async (changedPath) => {
    const isImageFile = IMAGE_EXTENSIONS.some(ext => 
      changedPath.toLowerCase().endsWith(ext)
    );

    if (isImageFile) {
      console.log("Image file changed, updating auto-images...");
      // 画像ファイルが変更された場合、再度セットアップ
      cleanupImages();
      setupImageFiles(absoluteMarkdownPath, webDir);
    } else {
      console.log("Markdown file changed, preparing reload notification...");
    }

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

    // 自動コピーした画像のクリーンアップ
    cleanupImages();

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
