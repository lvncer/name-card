import React, { memo, useMemo } from "react";
import { BusinessCardData } from "../lib/markdown-parser";

interface BusinessCardProps {
  data: BusinessCardData;
  scale?: number;
}

export const BusinessCard = memo<BusinessCardProps>(({ data, scale = 2 }) => {
  // メモ化されたスタイル計算
  const cardStyle = useMemo(() => ({
    width: `${91 * scale}mm`,
    height: `${55 * scale}mm`,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: "center center",
  }), [scale]);

  // HTMLコンテンツレンダリング（メモ化）
  const htmlCard = useMemo(() => {
    if (!data.htmlContent?.trim()) return null;
    
    return (
      <div
        className="border border-gray-200 rounded-lg shadow-lg p-6"
        style={cardStyle}
        id="business-card"
        dangerouslySetInnerHTML={{ __html: data.htmlContent }}
      />
    );
  }, [data.htmlContent, cardStyle]);

  if (htmlCard) return htmlCard;

  // 従来の方法（フォールバック）
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col justify-between"
      style={cardStyle}
      id="business-card"
    >
      {/* 名前 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.name}</h1>
        {data.title && (
          <p className="text-lg text-gray-600 font-medium">{data.title}</p>
        )}
      </div>

      {/* 説明 */}
      {data.description && (
        <div className="flex-1 flex items-center">
          <p className="text-sm text-gray-700 text-center w-full">
            {data.description}
          </p>
        </div>
      )}

      {/* 連絡先 */}
      {data.contacts.length > 0 && (
        <div className="space-y-1">
          {data.contacts.map((contact, index) => (
            <p key={`contact-${index}`} className="text-xs text-gray-600">
              {contact}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

// displayNameを設定（デバッグ用）
BusinessCard.displayName = "BusinessCard"; 