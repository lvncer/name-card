"use client";

import { BusinessCard } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { BusinessCardData } from "@/lib/markdown-parser";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // サーバーサイドでMarkdownファイルを読み込む
    fetch("/api/card-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCardData(data);
        }
      })
      .catch(() => {
        setError("Failed to load card data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "business-card.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
    }
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* エクスポートボタン */}
      <div className="absolute top-4 right-4 z-10">
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download size={16} />
          Export PDF
        </Button>
      </div>

      {/* 名刺プレビュー */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <BusinessCard data={cardData} scale={1.5} />
      </div>
    </div>
  );
}
