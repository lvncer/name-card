"use client";

import { BusinessCard } from "@/components/business-card";
import { BusinessCardData } from "@/lib/markdown-parser";
import { useEffect, useState } from "react";

export default function ExportPage() {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">No card data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* PDF専用: UI要素なし、名刺コンテンツのみ */}
      <div className="flex items-center justify-center min-h-screen">
        <BusinessCard data={cardData} scale={1} />
      </div>
    </div>
  );
}
