import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { join } from "path";
import { parseMarkdown } from "../lib/markdown-parser";

describe("parseMarkdown", () => {
  const testDir = join(__dirname, "temp");
  const testFile = join(testDir, "test.md");

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // ディレクトリが存在しない場合は無視
    }
  });

  it("should parse basic markdown correctly", async () => {
    const content = `# 田中太郎

**エンジニア**

テスト用の説明文です。

- test@example.com
- 090-1234-5678`;

    await fs.writeFile(testFile, content);

    const result = parseMarkdown(testFile);

    expect(result.name).toBe("田中太郎");
    expect(result.title).toBe("エンジニア");
    expect(result.description).toBe("テスト用の説明文です。");
    expect(result.contacts).toEqual(["test@example.com", "090-1234-5678"]);
    expect(result.rawContent).toBe(content);
  });

  it("should handle missing fields gracefully", async () => {
    const content = `# 山田花子`;

    await fs.writeFile(testFile, content);

    const result = parseMarkdown(testFile);

    expect(result.name).toBe("山田花子");
    expect(result.title).toBe("");
    expect(result.description).toBe("");
    expect(result.contacts).toEqual([]);
  });

  it("should parse complex markdown with multiple sections", async () => {
    const content = `# 佐藤一郎

**シニアデベロッパー**

フルスタック開発を専門としています。

- 📧 sato@company.com
- 📱 080-9999-1111
- 🌐 https://sato.dev`;

    await fs.writeFile(testFile, content);

    const result = parseMarkdown(testFile);

    expect(result.name).toBe("佐藤一郎");
    expect(result.title).toBe("シニアデベロッパー");
    expect(result.description).toBe("フルスタック開発を専門としています。");
    expect(result.contacts).toHaveLength(3);
    expect(result.contacts[0]).toBe("📧 sato@company.com");
  });
});
