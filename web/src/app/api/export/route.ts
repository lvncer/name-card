import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 名刺サイズ設定 (91mm x 55mm)
    await page.setViewport({
      width: 344, // 91mm in pixels (96 DPI)
      height: 208, // 55mm in pixels (96 DPI)
    });

    // PDF専用ページにアクセス
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`;

    await page.goto(`${baseUrl}/export`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // 名刺要素が読み込まれるまで待機
    await page.waitForSelector("#business-card", { timeout: 10000 });

    // PDF生成
    const pdf = await page.pdf({
      width: "91mm",
      height: "55mm",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="business-card.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
