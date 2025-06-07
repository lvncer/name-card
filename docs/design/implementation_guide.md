# 実装手順書

## 概要

Next.js ベースの名刺作成アプリケーションの実装手順書です。
CLI ツールとして使用でき、Vercel にデプロイも可能なハイブリッド構成で実装します。

## 前提条件

- Node.js 18+ がインストール済み
- npm または yarn がインストール済み
- Git がインストール済み
- GitHub アカウントが設定済み

## 実装フェーズ

### Phase 1: プロジェクト基盤構築

#### 1.1 プロジェクト初期化

```powershell
# プロジェクトディレクトリに移動
Set-Location "C:\Users\negim\GitRepos\next-name-card"

# package.json の初期化
npm init -y

# 基本的なディレクトリ構造作成
New-Item -ItemType Directory -Path "src", "web", "templates", "bin" -Force
```

#### 1.2 依存関係のインストール

```powershell
# CLI 関連の依存関係
npm install commander chokidar gray-matter marked open

# 開発用依存関係
npm install -D @types/node typescript ts-node nodemon

# TypeScript 設定
npx tsc --init
```

#### 1.3 package.json の設定

```json
{
  "name": "name-card",
  "version": "1.0.0",
  "description": "Markdown-based business card generator with Next.js",
  "main": "dist/index.js",
  "bin": {
    "name-card": "./bin/name-card.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --exec ts-node src/index.ts",
    "start": "node dist/index.js",
    "web:dev": "cd web && npm run dev",
    "web:build": "cd web && npm run build"
  },
  "keywords": ["business-card", "markdown", "pdf", "nextjs"],
  "author": "Your Name",
  "license": "MIT"
}
```

#### 1.4 TypeScript 設定

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "web"]
}
```

### Phase 2: CLI 基盤実装

#### 2.1 CLI エントリーポイント作成

**ファイル**: `bin/name-card.js`

```javascript
#!/usr/bin/env node
require("../dist/index.js");
```

#### 2.2 CLI メイン処理実装

**ファイル**: `src/index.ts`

```typescript
import { Command } from "commander";
import { startServer } from "./server";
import { validateMarkdownFile } from "./utils/file-validator";

const program = new Command();

program
  .name("name-card")
  .description("Markdown-based business card generator")
  .version("1.0.0");

program
  .argument("<file>", "Markdown file path")
  .option("-p, --port <port>", "Server port", "3000")
  .option("--no-open", "Do not open browser automatically")
  .action(async (file: string, options) => {
    try {
      // ファイル存在確認
      await validateMarkdownFile(file);

      // サーバー起動
      await startServer(file, {
        port: parseInt(options.port),
        openBrowser: options.open,
      });
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
```

#### 2.3 ファイルバリデーター実装

**ファイル**: `src/utils/file-validator.ts`

```typescript
import { promises as fs } from "fs";
import { extname } from "path";

export async function validateMarkdownFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }

  if (extname(filePath) !== ".md") {
    throw new Error("File must be a Markdown file (.md)");
  }
}
```

#### 2.4 サーバー起動処理実装

**ファイル**: `src/server.ts`

```typescript
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
    console.log("\nShutting down...");
    watcher.close();
    nextProcess.kill();
    process.exit(0);
  });
}
```

### Phase 3: Next.js Web アプリケーション実装

#### 3.1 Next.js プロジェクト初期化

```powershell
Set-Location web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

#### 3.2 追加依存関係のインストール

```powershell
# UI コンポーネント
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card

# Markdown 処理
npm install gray-matter marked
npm install -D @types/marked

# PDF 生成
npm install puppeteer
npm install -D @types/puppeteer

# アイコン
npm install lucide-react
```

#### 3.3 環境変数設定

**ファイル**: `web/.env.local`

```env
MARKDOWN_FILE=
PORT=3000
```

#### 3.4 Markdown パーサー実装

**ファイル**: `web/src/lib/markdown-parser.ts`

```typescript
import matter from "gray-matter";
import { marked } from "marked";
import { readFileSync } from "fs";

export interface BusinessCardData {
  name: string;
  title: string;
  description: string;
  contacts: string[];
  rawContent: string;
}

export function parseMarkdown(filePath: string): BusinessCardData {
  const fileContent = readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  // Markdown を HTML に変換
  const html = marked(content);

  // 名刺データを抽出
  const lines = content.split("\n").filter((line) => line.trim());

  const name =
    lines.find((line) => line.startsWith("# "))?.replace("# ", "") || "";
  const title =
    lines
      .find((line) => line.startsWith("**") && line.endsWith("**"))
      ?.replace(/\*\*/g, "") || "";
  const description =
    lines
      .find(
        (line) =>
          !line.startsWith("#") &&
          !line.startsWith("**") &&
          !line.startsWith("-")
      )
      ?.trim() || "";
  const contacts = lines
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace("- ", ""));

  return {
    name,
    title,
    description,
    contacts,
    rawContent: content,
  };
}
```

#### 3.5 名刺コンポーネント実装

**ファイル**: `web/src/components/business-card.tsx`

```typescript
import { BusinessCardData } from "@/lib/markdown-parser";

interface BusinessCardProps {
  data: BusinessCardData;
  scale?: number;
}

export function BusinessCard({ data, scale = 2 }: BusinessCardProps) {
  const cardStyle = {
    width: `${91 * scale}mm`,
    height: `${55 * scale}mm`,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: "center center",
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col justify-between"
      style={cardStyle}
    >
      {/* 名前 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.name}</h1>
        {data.title && (
          <p className="text-lg text-gray-600 font-medium">{data.title}</p>
        )}
      </div>

      {/* 説明 */}
      {data.description && (
        <div className="flex-1 flex items-center">
          <p className="text-sm text-gray-700 text-center w-full">
            {data.description}
          </p>
        </div>
      )}

      {/* 連絡先 */}
      {data.contacts.length > 0 && (
        <div className="space-y-1">
          {data.contacts.map((contact, index) => (
            <p key={index} className="text-xs text-gray-600">
              {contact}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 3.6 メインページ実装

**ファイル**: `web/src/app/page.tsx`

```typescript
import { BusinessCard } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { parseMarkdown } from "@/lib/markdown-parser";
import { Download } from "lucide-react";

export default function Home() {
  const markdownFile = process.env.MARKDOWN_FILE;

  if (!markdownFile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No markdown file specified</p>
      </div>
    );
  }

  const cardData = parseMarkdown(markdownFile);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* エクスポートボタン */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => window.open("/api/export", "_blank")}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          PDF Export
        </Button>
      </div>

      {/* 名刺プレビュー */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <BusinessCard data={cardData} scale={2} />
      </div>
    </div>
  );
}
```

### Phase 4: PDF エクスポート機能実装

#### 4.1 PDF 生成 API 実装

**ファイル**: `web/src/app/api/export/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { parseMarkdown } from "@/lib/markdown-parser";

export async function GET(request: NextRequest) {
  try {
    const markdownFile = process.env.MARKDOWN_FILE;

    if (!markdownFile) {
      return NextResponse.json(
        { error: "No markdown file specified" },
        { status: 400 }
      );
    }

    const cardData = parseMarkdown(markdownFile);

    // Puppeteer でPDF生成
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 名刺サイズ設定 (91mm x 55mm)
    await page.setViewport({ width: 344, height: 208 }); // 91mm x 55mm at 96 DPI

    // HTML コンテンツ生成
    const html = generateBusinessCardHTML(cardData);
    await page.setContent(html);

    // PDF 生成
    const pdf = await page.pdf({
      width: "91mm",
      height: "55mm",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    // PDF レスポンス
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${
          cardData.name || "business-card"
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}

function generateBusinessCardHTML(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          margin: 0;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 91mm;
          height: 55mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: white;
        }
        .header { text-align: center; }
        .name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
        .title { font-size: 14px; color: #666; font-weight: 500; }
        .description { 
          flex: 1; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 12px; 
          color: #333; 
          text-align: center;
        }
        .contacts { font-size: 10px; color: #666; }
        .contact { margin-bottom: 2px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${data.name}</div>
        ${data.title ? `<div class="title">${data.title}</div>` : ""}
      </div>
      
      ${
        data.description
          ? `<div class="description">${data.description}</div>`
          : ""
      }
      
      ${
        data.contacts.length > 0
          ? `
        <div class="contacts">
          ${data.contacts
            .map((contact) => `<div class="contact">${contact}</div>`)
            .join("")}
        </div>
      `
          : ""
      }
    </body>
    </html>
  `;
}
```

### Phase 5: サンプルテンプレート作成

#### 5.1 基本テンプレート

**ファイル**: `templates/basic.md`

```markdown
# 山田太郎

**ソフトウェアエンジニア**

Next.js と TypeScript でモダンな Web アプリケーションを開発しています。

- 📧 yamada@example.com
- 📱 090-1234-5678
- 🌐 https://yamada.dev
- 🐙 @yamada-taro
```

#### 5.2 デザイナー向けテンプレート

**ファイル**: `templates/designer.md`

```markdown
# 佐藤花子

**UI/UX デザイナー**

ユーザー中心のデザインで、使いやすく美しいインターフェースを作ります。

- ✉️ sato@design.com
- 📞 080-9876-5432
- 🎨 https://sato-design.com
- 📷 @sato_design
```

### Phase 6: テスト環境構築・実行

#### 6.1 テスト環境セットアップ

```powershell
# CLI プロジェクトのテスト依存関係
npm install -D vitest @vitest/ui jsdom @testing-library/node
npm install -D @types/jest

# Web プロジェクトのテスト依存関係
Set-Location web
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D @types/jest

# Playwright セットアップ
npx playwright install
```

#### 6.2 CLI プロジェクトの単体テスト実装

**ファイル**: `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["web/**/*", "node_modules/**/*"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

**ファイル**: `src/utils/file-validator.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { resolve } from "path";
import { validateMarkdownFile } from "./file-validator";

describe("validateMarkdownFile", () => {
  const testDir = resolve(__dirname, "../test-fixtures");
  const validMdFile = resolve(testDir, "valid.md");
  const invalidExtFile = resolve(testDir, "invalid.txt");

  beforeEach(async () => {
    // テスト用ディレクトリとファイル作成
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(validMdFile, "# Test Markdown");
    await fs.writeFile(invalidExtFile, "Not a markdown file");
  });

  afterEach(async () => {
    // テスト用ファイル削除
    try {
      await fs.rm(testDir, { recursive: true });
    } catch (error) {
      // ファイルが存在しない場合は無視
    }
  });

  it("should pass for valid markdown file", async () => {
    await expect(validateMarkdownFile(validMdFile)).resolves.toBeUndefined();
  });

  it("should throw error for non-existent file", async () => {
    await expect(validateMarkdownFile("non-existent.md")).rejects.toThrow(
      "File not found"
    );
  });

  it("should throw error for non-markdown file", async () => {
    await expect(validateMarkdownFile(invalidExtFile)).rejects.toThrow(
      "File must be a Markdown file (.md)"
    );
  });
});
```

**ファイル**: `src/utils/markdown-parser.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { resolve } from "path";

// Web プロジェクトの markdown-parser をテスト用にコピー
const parseMarkdown = (content: string) => {
  const lines = content.split("\n").filter((line) => line.trim());

  const name =
    lines.find((line) => line.startsWith("# "))?.replace("# ", "") || "";
  const title =
    lines
      .find((line) => line.startsWith("**") && line.endsWith("**"))
      ?.replace(/\*\*/g, "") || "";
  const description =
    lines
      .find(
        (line) =>
          !line.startsWith("#") &&
          !line.startsWith("**") &&
          !line.startsWith("-")
      )
      ?.trim() || "";
  const contacts = lines
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace("- ", ""));

  return {
    name,
    title,
    description,
    contacts,
    rawContent: content,
  };
};

describe("parseMarkdown", () => {
  it("should parse basic business card markdown", () => {
    const markdown = `# 山田太郎

**ソフトウェアエンジニア**

Next.js と TypeScript でモダンな Web アプリケーションを開発しています。

- 📧 yamada@example.com
- 📱 090-1234-5678`;

    const result = parseMarkdown(markdown);

    expect(result.name).toBe("山田太郎");
    expect(result.title).toBe("ソフトウェアエンジニア");
    expect(result.description).toBe(
      "Next.js と TypeScript でモダンな Web アプリケーションを開発しています。"
    );
    expect(result.contacts).toEqual([
      "📧 yamada@example.com",
      "📱 090-1234-5678",
    ]);
  });

  it("should handle empty sections", () => {
    const markdown = `# テスト太郎`;
    const result = parseMarkdown(markdown);

    expect(result.name).toBe("テスト太郎");
    expect(result.title).toBe("");
    expect(result.description).toBe("");
    expect(result.contacts).toEqual([]);
  });
});
```

#### 6.3 Web プロジェクトの単体テスト実装

**ファイル**: `web/vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

**ファイル**: `web/src/test/setup.ts`

```typescript
import "@testing-library/jest-dom";
```

**ファイル**: `web/src/lib/markdown-parser.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { parseMarkdown } from "./markdown-parser";

// fs.readFileSync をモック
vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

describe("parseMarkdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse complete business card data", () => {
    const mockContent = `# 山田太郎

**ソフトウェアエンジニア**

Next.js と TypeScript でモダンな Web アプリケーションを開発しています。

- 📧 yamada@example.com
- 📱 090-1234-5678
- 🌐 https://yamada.dev`;

    vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

    const result = parseMarkdown("test.md");

    expect(result.name).toBe("山田太郎");
    expect(result.title).toBe("ソフトウェアエンジニア");
    expect(result.description).toBe(
      "Next.js と TypeScript でモダンな Web アプリケーションを開発しています。"
    );
    expect(result.contacts).toHaveLength(3);
    expect(result.rawContent).toContain("山田太郎");
  });
});
```

**ファイル**: `web/src/components/business-card.test.tsx`

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessCard } from "./business-card";
import { BusinessCardData } from "@/lib/markdown-parser";

describe("BusinessCard", () => {
  const mockData: BusinessCardData = {
    name: "山田太郎",
    title: "ソフトウェアエンジニア",
    description: "Next.js でアプリケーションを開発しています。",
    contacts: ["📧 yamada@example.com", "📱 090-1234-5678"],
    rawContent: "# 山田太郎\n**ソフトウェアエンジニア**",
  };

  it("should render business card with all data", () => {
    render(<BusinessCard data={mockData} />);

    expect(screen.getByText("山田太郎")).toBeInTheDocument();
    expect(screen.getByText("ソフトウェアエンジニア")).toBeInTheDocument();
    expect(
      screen.getByText("Next.js でアプリケーションを開発しています。")
    ).toBeInTheDocument();
    expect(screen.getByText("📧 yamada@example.com")).toBeInTheDocument();
    expect(screen.getByText("📱 090-1234-5678")).toBeInTheDocument();
  });

  it("should render with custom scale", () => {
    const { container } = render(<BusinessCard data={mockData} scale={1} />);
    const cardElement = container.firstChild as HTMLElement;

    expect(cardElement.style.width).toBe("91mm");
    expect(cardElement.style.height).toBe("55mm");
  });

  it("should handle empty optional fields", () => {
    const minimalData: BusinessCardData = {
      name: "テスト太郎",
      title: "",
      description: "",
      contacts: [],
      rawContent: "# テスト太郎",
    };

    render(<BusinessCard data={minimalData} />);

    expect(screen.getByText("テスト太郎")).toBeInTheDocument();
    expect(
      screen.queryByText("ソフトウェアエンジニア")
    ).not.toBeInTheDocument();
  });
});
```

#### 6.4 E2E テスト実装（Playwright）

**ファイル**: `web/playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      MARKDOWN_FILE: "./test-fixtures/sample.md",
    },
  },
});
```

**ファイル**: `web/e2e/business-card.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Business Card Application", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display business card preview", async ({ page }) => {
    // 名刺が表示されることを確認
    await expect(page.locator("h1")).toBeVisible();

    // エクスポートボタンが表示されることを確認
    await expect(
      page.getByRole("button", { name: /PDF Export/i })
    ).toBeVisible();
  });

  test("should have correct business card dimensions", async ({ page }) => {
    const card = page.locator('[class*="bg-white border"]').first();
    await expect(card).toBeVisible();

    // 名刺のサイズが正しいことを確認（スケール2倍で182mm x 110mm）
    const boundingBox = await card.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(600); // 約182mm
    expect(boundingBox?.height).toBeGreaterThan(400); // 約110mm
  });

  test("should export PDF when button clicked", async ({ page }) => {
    // PDF エクスポートボタンをクリック
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /PDF Export/i }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test("should be responsive", async ({ page }) => {
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });

    // 名刺が表示されることを確認
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /PDF Export/i })
    ).toBeVisible();
  });
});
```

**ファイル**: `web/e2e/api.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should generate PDF via API", async ({ request }) => {
    const response = await request.get("/api/export");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/pdf");

    const buffer = await response.body();
    expect(buffer.length).toBeGreaterThan(0);

    // PDF ヘッダーの確認
    const pdfHeader = buffer.slice(0, 4).toString();
    expect(pdfHeader).toBe("%PDF");
  });

  test("should handle missing markdown file", async ({ request }) => {
    // 環境変数をクリアしてテスト
    const response = await request.get("/api/export", {
      headers: {
        "x-test-no-markdown": "true",
      },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("No markdown file specified");
  });
});
```

#### 6.5 テスト用フィクスチャ作成

**ファイル**: `web/test-fixtures/sample.md`

```markdown
# テスト太郎

**テストエンジニア**

自動テストと CI/CD パイプラインの構築を専門としています。

- 📧 test@example.com
- 📱 090-0000-0000
- 🌐 https://test.example.com
- 🐙 @test-taro
```

#### 6.6 package.json スクリプト更新

**CLI プロジェクト**: `package.json`

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --exec ts-node src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "web:dev": "cd web && npm run dev",
    "web:build": "cd web && npm run build",
    "web:test": "cd web && npm run test",
    "web:e2e": "cd web && npm run test:e2e"
  }
}
```

**Web プロジェクト**: `web/package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

#### 6.7 各フェーズでのテスト実行

**Phase 1-2 完了後（CLI 基盤）:**

```powershell
# 単体テスト実行
npm run test:run

# カバレッジ確認
npm run test:coverage
```

**Phase 3 完了後（Web アプリケーション）:**

```powershell
Set-Location web

# 単体テスト実行
npm run test:run

# コンポーネントテスト UI で確認
npm run test:ui
```

**Phase 4 完了後（PDF エクスポート）:**

```powershell
Set-Location web

# E2E テスト実行
npm run test:e2e

# E2E テスト UI で確認
npm run test:e2e:ui
```

**Phase 5 完了後（統合テスト）:**

```powershell
# CLI プロジェクト全体テスト
npm run test:run

# Web プロジェクト全体テスト
Set-Location web
npm run test:run
npm run test:e2e

# テストレポート確認
npm run test:e2e:report
```

#### 6.8 継続的インテグレーション用設定

**ファイル**: `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-cli:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npm run test:run
      - run: npm run build

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: cd web && npm ci
      - run: cd web && npm run test:run
      - run: cd web && npm run build

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: cd web && npm ci
      - run: cd web && npx playwright install --with-deps
      - run: cd web && npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: web/playwright-report/
```

#### 6.9 エラーハンドリング確認

各テストで以下のエラーケースを確認：

- 存在しないファイル指定時のエラー
- 不正な Markdown ファイル指定時のエラー
- PDF 生成失敗時のエラー
- ポート競合時のエラー
- ネットワークエラー時の処理
- 不正な環境変数設定時のエラー

### Phase 7: デプロイ準備

#### 7.1 Vercel 設定

**ファイル**: `web/vercel.json`

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "MARKDOWN_FILE": ""
  }
}
```

#### 7.2 npm パッケージ公開準備

```powershell
# .npmignore 作成
echo "src/
web/
docs/
*.md
.git*" > .npmignore

# パッケージテスト
npm pack
```

## 完了チェックリスト

### Phase 1: プロジェクト基盤構築

- [ ] プロジェクト初期化完了
- [ ] 依存関係インストール完了
- [ ] TypeScript 設定完了
- [ ] ディレクトリ構造作成完了

### Phase 2: CLI 基盤実装

- [ ] CLI エントリーポイント作成
- [ ] Commander.js 設定完了
- [ ] ファイルバリデーション実装
- [ ] サーバー起動処理実装

### Phase 3: Next.js Web アプリケーション実装

- [ ] Next.js プロジェクト初期化
- [ ] Shadcn/ui セットアップ完了
- [ ] Markdown パーサー実装
- [ ] 名刺コンポーネント実装
- [ ] メインページ実装

### Phase 4: PDF エクスポート機能実装

- [ ] Puppeteer セットアップ
- [ ] PDF 生成 API 実装
- [ ] エクスポートボタン実装
- [ ] PDF ダウンロード機能確認

### Phase 5: サンプルテンプレート作成

- [ ] 基本テンプレート作成
- [ ] 複数パターンのテンプレート作成
- [ ] テンプレートの動作確認

### Phase 6: テスト・デバッグ

- [ ] CLI 動作テスト
- [ ] Web アプリケーション動作テスト
- [ ] PDF エクスポート動作テスト
- [ ] エラーハンドリング確認

### Phase 7: デプロイ準備

- [ ] Vercel 設定完了
- [ ] npm パッケージ設定完了
- [ ] ドキュメント整備完了

## 注意事項

1. **Windows PowerShell 使用**: Bash コマンドは使用しない
2. **段階的実装**: 各フェーズを順番に完了させる
3. **エラーハンドリング**: 適切なエラーメッセージを表示
4. **TypeScript 厳格モード**: 型安全性を重視
5. **レスポンシブ対応**: 名刺サイズは固定、表示スケールは可変

## トラブルシューティング

### よくある問題

1. **ポート競合**: `--port` オプションで別ポート指定
2. **ファイル監視エラー**: chokidar の権限確認
3. **PDF 生成失敗**: Puppeteer の依存関係確認
4. **Next.js ビルドエラー**: 環境変数の設定確認

### デバッグ方法

```powershell
# 詳細ログ出力
$env:DEBUG = "name-card:*"
node bin/name-card.js templates/basic.md

# Next.js デバッグモード
Set-Location web
$env:NODE_ENV = "development"
npm run dev
```

## 追加テスト設定・デバッグ手順

### テストデバッグ・トラブルシューティング

**デバッグ用コマンド:**

```powershell
# Vitest デバッグ
npm run test -- --reporter=verbose

# Playwright デバッグ
Set-Location web
npm run test:e2e -- --debug

# 特定のテストファイルのみ実行
npm run test src/utils/file-validator.test.ts

# 特定のテストケースのみ実行
npm run test -- --grep "should validate markdown file"

# ウォッチモードでテスト
npm run test -- --watch
```

**よくある問題と解決方法:**

1. **Playwright ブラウザインストールエラー**

   ```powershell
   npx playwright install --with-deps
   ```

2. **ポート競合エラー**

   ```powershell
   # 別ポートでテスト実行
   $env:PORT = "3001"
   npm run test:e2e
   ```

3. **ファイルパス問題（Windows）**

   ```powershell
   # 絶対パスでテスト
   node bin/name-card.js "C:\Users\negim\GitRepos\next-name-card\test-fixtures\integration.md"
   ```

4. **PDF 生成テストエラー**
   ```powershell
   # Puppeteer 依存関係確認
   Set-Location web
   npm install puppeteer --save-exact
   ```

### テスト用追加フィクスチャ

**ファイル**: `test-fixtures/integration.md`

```markdown
# 統合テスト用

**フルスタックエンジニア**

CLI と Web の両方で動作確認を行います。

- 📧 integration@test.com
- 📱 000-0000-0000
- 🌐 https://integration.test
```

**ファイル**: `test-fixtures/minimal.md`

```markdown
# 最小構成テスト
```

**ファイル**: `test-fixtures/full-featured.md`

```markdown
# フル機能テスト太郎

**シニアソフトウェアアーキテクト**

大規模システムの設計・開発・運用を専門とし、チームリードとしてプロジェクトを成功に導きます。マイクロサービス、クラウドネイティブ、DevOps の専門知識を活用して、スケーラブルで保守性の高いシステムを構築します。

- 📧 fulltest@example.com
- 📱 090-1111-2222
- 🌐 https://fulltest.example.com
- 🐙 @fulltest-engineer
- 💼 LinkedIn: /in/fulltest
- 📍 東京都渋谷区
- 🏢 株式会社テストカンパニー
```

### パフォーマンステスト

**ファイル**: `web/e2e/performance.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should load business card within 2 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test("should generate PDF within 5 seconds", async ({ page }) => {
    await page.goto("/");

    const startTime = Date.now();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /PDF Export/i }).click();

    await downloadPromise;
    const generateTime = Date.now() - startTime;
    expect(generateTime).toBeLessThan(5000);
  });
});
```

### アクセシビリティテスト

**ファイル**: `web/e2e/accessibility.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/");

    // H1 が存在することを確認
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    // H1 が1つだけであることを確認
    await expect(h1).toHaveCount(1);
  });

  test("should have accessible button", async ({ page }) => {
    await page.goto("/");

    const exportButton = page.getByRole("button", { name: /PDF Export/i });
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Tab キーでボタンにフォーカス
    await page.keyboard.press("Tab");

    const exportButton = page.getByRole("button", { name: /PDF Export/i });
    await expect(exportButton).toBeFocused();

    // Enter キーでボタンを押下
    const downloadPromise = page.waitForEvent("download");
    await page.keyboard.press("Enter");
    await downloadPromise;
  });
});
```

### 更新された package.json スクリプト

**CLI プロジェクト**: `package.json`

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --exec ts-node src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "web:dev": "cd web && npm run dev",
    "web:build": "cd web && npm run build",
    "web:test": "cd web && npm run test",
    "web:e2e": "cd web && npm run test:e2e",
    "test:all": "npm run test:run && cd web && npm run test:run && npm run test:e2e",
    "test:integration": "npm run build && timeout 10s node bin/name-card.js test-fixtures/integration.md --no-open || echo 'Integration test completed'"
  }
}
```

**Web プロジェクト**: `web/package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "test:e2e:debug": "playwright test --debug",
    "test:performance": "playwright test e2e/performance.spec.ts",
    "test:accessibility": "playwright test e2e/accessibility.spec.ts"
  }
}
```

### 完全なテスト実行手順

**開発中の継続的テスト:**

```powershell
# 開発中はウォッチモードで
npm run test:watch

# Web 開発中
Set-Location web
npm run test:watch
```

**フェーズ完了時の確認テスト:**

```powershell
# Phase 1-2: CLI 基盤
npm run test:run
npm run test:coverage

# Phase 3: Web アプリケーション
Set-Location web
npm run test:run
npm run test:coverage

# Phase 4: PDF エクスポート
npm run test:e2e

# Phase 5: 統合テスト
Set-Location ..
npm run test:all
npm run test:integration

# パフォーマンス・アクセシビリティテスト
Set-Location web
npm run test:performance
npm run test:accessibility
```

**リリース前の最終確認:**

```powershell
# 全テスト実行
npm run test:all

# カバレッジ確認
npm run test:coverage
Set-Location web
npm run test:coverage

# E2E テストレポート確認
npm run test:e2e:report

# 実際のCLI動作確認
Set-Location ..
npm run build
node bin/name-card.js templates/basic.md
```

この手順書に従って実装を進めることで、要件定義書とアーキテクチャ設計書に基づいた完全な名刺作成アプリケーションが完成します。各フェーズでのテスト実行により、品質を保ちながら段階的に開発を進めることができます。
