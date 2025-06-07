import matter from "gray-matter";
import { marked } from "marked";
import { readFileSync } from "fs";

export interface BusinessCardData {
  name: string;
  title: string;
  description: string;
  contacts: string[];
  rawContent: string;
  htmlContent: string;
}

export function parseMarkdown(filePath: string): BusinessCardData {
  const fileContent = readFileSync(filePath, "utf-8");
  const { content } = matter(fileContent);

  // markedの設定でHTMLを有効化
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // HTMLコンテンツを生成
  const htmlContent = marked(content) as string;

  // 名刺データを抽出（従来の方法も維持）
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
    htmlContent,
  };
}
