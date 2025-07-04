"use client";

import { BusinessCard } from "../components/business-card";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { BusinessCardData } from "../lib/markdown-parser";

export default function Home() {
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 最適化されたカードデータ読み込み関数（メモ化）
  const loadCardData = useCallback(async () => {
    try {
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

      const response = await fetch("/api/card-data", {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setCardData(null);
      } else {
        setCardData(data);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to load card data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load card data"
      );
      setCardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初回読み込み
    loadCardData();

    // 高性能 Server-Sent Events
    const eventSource = new EventSource("/api/reload");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "reload") {
          console.log("Markdown file changed, reloading data...");
          loadCardData();
        } else if (data.type === "connected") {
          console.log("SSE connection established");
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.warn("SSE connection error (will auto-reconnect):", error);
    };

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    // クリーンアップ
    return () => {
      eventSource.close();
    };
  }, [loadCardData]);

  // 最適化された印刷処理（メモ化）
  const handleExport = useCallback(() => {
    // 印刷前の最適化
    document.body.style.overflow = "hidden";

    // 印刷ダイアログを開く
    window.print();

    // 印刷後の復元
    setTimeout(() => {
      document.body.style.overflow = "";
    }, 100);
  }, []);

  // メモ化されたコンポーネント
  const LoadingComponent = useMemo(
    () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    ),
    []
  );

  const ErrorComponent = useMemo(
    () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadCardData} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    ),
    [error, loadCardData]
  );

  const NoDataComponent = useMemo(
    () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No card data available</p>
          <Button onClick={loadCardData} variant="outline">
            Reload
          </Button>
        </div>
      </div>
    ),
    [loadCardData]
  );

  if (loading) return LoadingComponent;
  if (error) return ErrorComponent;
  if (!cardData) return NoDataComponent;

  return (
    <>
      {/* 印刷専用スタイル */}
      <style jsx global>{`
        @media print {
          /* 印刷時に不要な要素を隠す */
          .no-print {
            display: none !important;
          }

          /* 印刷時のレイアウト調整 */
          .print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 91mm;
            height: 55mm;
            margin: 0;
            padding: 0;
            page-break-after: avoid;
            page-break-inside: avoid;
            display: block !important;
          }

          /* 印刷時のページ設定 */
          @page {
            size: 91mm 55mm;
            margin: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            print-color-adjust: exact;
          }

          /* 背景色を強制的に印刷 */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 印刷時のボディ設定 */
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* HTMLコンテンツのすべての要素で背景色を強制 */
          #business-card * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Tailwindクラスの背景色を強制 */
          [class*="bg-"] {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* グラデーションを強制 */
          [class*="gradient"], [class*="from-"], [class*="to-"], [class*="via-"] {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* style属性の背景色も強制 */
          [style*="background"] {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 印刷時でもHTMLコンテンツのflexレイアウトを維持 */
          .business-card-content .flex {
            display: flex !important;
          }
          
          .business-card-content .flex-col {
            display: flex !important;
            flex-direction: column !important;
          }
          
          .business-card-content .flex-row {
            display: flex !important;
            flex-direction: row !important;
          }
          
          .business-card-content .items-center {
            align-items: center !important;
          }
          
          .business-card-content .justify-between {
            justify-content: space-between !important;
          }
          
          .business-card-content .justify-center {
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="min-h-screen relative">
        {/* エクスポートボタン */}
        <div className="absolute top-4 right-4 z-10 no-print">
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download size={16} />
            印刷・PDF出力
          </Button>
        </div>

        {/* 名刺プレビュー */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="border-2 border-dashed border-gray-300 rounded-lg no-print">
            <BusinessCard data={cardData} scale={1} />
          </div>
          {/* 印刷専用の名刺 */}
          <div className="print-card hidden print:block">
            <BusinessCard data={cardData} scale={1} />
          </div>
        </div>
      </div>
    </>
  );
}
