import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { join } from "path";
import { validateMarkdownFile } from "../src/utils/file-validator";

describe("validateMarkdownFile", () => {
  const testDir = join(__dirname, "temp");
  const testMdFile = join(testDir, "test.md");
  const testTxtFile = join(testDir, "test.txt");

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testMdFile, "# Test\nTest content");
    await fs.writeFile(testTxtFile, "Test content");
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // ディレクトリが存在しない場合は無視
    }
  });

  it("should validate existing markdown file", async () => {
    await expect(validateMarkdownFile(testMdFile)).resolves.toBeUndefined();
  });

  it("should throw error for non-existent file", async () => {
    const nonExistentFile = join(testDir, "nonexistent.md");
    await expect(validateMarkdownFile(nonExistentFile)).rejects.toThrow(
      "File not found"
    );
  });

  it("should throw error for non-markdown file", async () => {
    await expect(validateMarkdownFile(testTxtFile)).rejects.toThrow(
      "File must be a Markdown file"
    );
  });
});
