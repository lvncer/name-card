import matter from "gray-matter";
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
  const { content } = matter(fileContent);

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
