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
