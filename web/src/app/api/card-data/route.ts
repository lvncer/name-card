import { parseMarkdown, BusinessCardData } from "../../../lib/markdown-parser";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<BusinessCardData | { error: string }>> {
  try {
    const markdownFile = process.env.MARKDOWN_FILE;
    
    if (!markdownFile) {
      return NextResponse.json(
        { error: "No markdown file specified" }, 
        { status: 400 }
      );
    }

    const cardData = await parseMarkdown(markdownFile);
    
    // レスポンスヘッダーでキャッシュ最適化
    return NextResponse.json(cardData, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
        'Content-Type': 'application/json',
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