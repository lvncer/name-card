import { parseMarkdown } from "@/lib/markdown-parser";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const markdownFile = process.env.MARKDOWN_FILE;

    if (!markdownFile) {
      return NextResponse.json(
        { error: "No markdown file specified" },
        { status: 400 }
      );
    }

    const cardData = parseMarkdown(markdownFile);

    // キャッシュ無効化ヘッダーを追加
    return NextResponse.json(cardData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error parsing markdown:", error);
    return NextResponse.json(
      { error: "Failed to parse markdown file" },
      { status: 500 }
    );
  }
}
