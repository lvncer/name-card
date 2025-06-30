"use client";

import { BusinessCard } from "../components/business-card";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { BusinessCardData } from "../lib/markdown-parser";

export default function Home() {
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カードデータを読み込む関数
  const loadCardData = () => {
    fetch("/api/card-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCardData(data);
          setError(null);
        }
      })
      .catch(() => {
        setError("Failed to load card data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // 初回読み込み
    loadCardData();

    // Server-Sent Events でリアルタイム更新
    const eventSource = new EventSource("/api/reload");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "reload") {
        console.log("Markdown file changed, reloading...");
        loadCardData();
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    // クリーンアップ
    return () => {
      eventSource.close();
    };
  }, []);

  const handleExport = () => {
    // 印刷ダイアログを直接開く
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No card data available</p>
      </div>
    );
  }

  return (
    <>
      {/* 印刷専用スタイル */}
      <style jsx global>{`
        @media print {
          * {
            visibility: hidden;
          }
          
          .print-only, .print-only * {
            visibility: visible;
          }
          
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 91mm;
            height: 55mm;
            margin: 0;
            padding: 0;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          @page {
            size: 91mm 55mm;
            margin: 0;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 relative">
        {/* エクスポートボタン */}
        <div className="absolute top-4 right-4 z-10">
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download size={16} />
            印刷・PDF出力
          </Button>
        </div>

        {/* 名刺プレビュー */}
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg bg-white">
            <p className="text-xs text-gray-500 mb-4 text-center">実際のサイズ (91mm × 55mm)</p>
            {/* 印刷専用の名刺（画面では非表示） */}
            <div className="print-only hidden print:block">
              <BusinessCard data={cardData} scale={1} />
            </div>
            {/* 画面表示用の名刺（印刷時は非表示） */}
            <div className="print:hidden">
              <BusinessCard data={cardData} scale={1} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 