import { readFileSync } from "fs";
import { marked } from "marked";
import matter from "gray-matter";

export interface BusinessCardData {
  name: string;
  title: string;
  description: string;
  contacts: string[];
  htmlContent: string | null;
  originalContent: string;
  frontmatter: any;
}

export async function parseMarkdown(filePath: string): Promise<BusinessCardData> {
  try {
    const fileContent = readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);

    // HTMLコンテンツが直接記述されているかチェック
    const trimmedContent = content.trim();
    
    // HTMLタグで始まっている場合はHTMLとして扱う
    if (trimmedContent.startsWith('<') && trimmedContent.includes('>')) {
      return {
        name: frontmatter.name || extractTitleFromHtml(trimmedContent),
        title: frontmatter.title || "",
        description: frontmatter.description || "",
        contacts: frontmatter.contacts || [],
        htmlContent: trimmedContent,
        originalContent: content,
        frontmatter,
      };
    }

    // 従来のMarkdown処理
    const lines = content.split("\n").filter(line => line.trim());
    
    // 最初の # で始まる行を名前として取得
    const nameMatch = lines.find(line => line.startsWith("# "));
    const name = nameMatch ? nameMatch.replace("# ", "").trim() : "名前未設定";
    
    // ** で囲まれた部分を役職として取得
    const titleMatch = content.match(/\*\*(.*?)\*\*/);
    const title = titleMatch ? titleMatch[1] : "";
    
    // - で始まる行を連絡先として取得
    const contacts = lines
      .filter(line => line.startsWith("- "))
      .map(line => line.replace("- ", "").trim());
    
    // 説明文を取得（名前、役職、連絡先以外の部分）
    const description = lines
      .filter(line => 
        !line.startsWith("# ") && 
        !line.startsWith("- ") && 
        !line.match(/^\*\*.*\*\*$/) &&
        line.trim() !== ""
      )
      .join(" ")
      .replace(/\*\*(.*?)\*\*/g, "$1") // **太字** を削除
      .trim();

    return {
      name,
      title,
      description,
      contacts,
      htmlContent: null,
      originalContent: content,
      frontmatter,
    };
  } catch (error) {
    console.error("Failed to parse markdown:", error);
    throw new Error(`Failed to parse markdown file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// HTMLからタイトルを抽出するヘルパー関数
function extractTitleFromHtml(htmlContent: string): string {
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    // HTMLタグを除去してテキストのみ抽出
    return h1Match[1].replace(/<[^>]*>/g, '').trim();
  }
  return "名前未設定";
} 