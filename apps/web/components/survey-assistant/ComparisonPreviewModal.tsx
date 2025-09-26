"use client";

import { FileText, X } from "lucide-react";
import type React from "react";

interface Survey {
  id: string;
  title: string;
  client: string;
  purpose: string;
  implementationDate: string;
  tags: string[];
  description: string;
}

interface ComparisonPreviewModalProps {
  isOpen: boolean;
  uploadedFiles: File[];
  recommendedSurvey: Survey | null;
  onClose: () => void;
}

export default function ComparisonPreviewModal({
  isOpen,
  uploadedFiles,
  recommendedSurvey,
  onClose,
}: ComparisonPreviewModalProps) {
  if (!isOpen) return null;

  // アップロードファイルから抽出された質問（モック）
  const extractedQuestions = [
    {
      id: "extracted-1",
      title: "お客様の年齢層を教えてください",
      type: "SA",
      source: "uploaded",
      options: ["20代", "30代", "40代", "50代", "60代以上"],
    },
    {
      id: "extracted-2",
      title: "弊社サービスの満足度を教えてください",
      type: "NU",
      source: "uploaded",
      range: { min: 1, max: 5 },
    },
    {
      id: "extracted-3",
      title: "今後も継続してご利用いただけますか？",
      type: "SA",
      source: "uploaded",
      options: ["はい", "いいえ", "わからない"],
    },
  ];

  // レコメンド調査票の質問（モック）
  const recommendedQuestions = [
    {
      id: "recommended-1",
      title: "あなたの年齢を教えてください",
      type: "SA",
      source: "recommended",
      options: ["20代", "30代", "40代", "50代", "60代以上"],
      similarity: "高い類似性",
    },
    {
      id: "recommended-2",
      title: "サービスを総合的に評価すると、10点満点で何点ですか？",
      type: "NU",
      source: "recommended",
      range: { min: 1, max: 10 },
      similarity: "類似（スケール違い）",
    },
    {
      id: "recommended-3",
      title: "今後の利用意向を教えてください",
      type: "SA",
      source: "recommended",
      options: ["ぜひ利用したい", "利用したい", "どちらでもない", "あまり利用したくない", "利用したくない"],
      similarity: "類似（選択肢拡張）",
    },
    {
      id: "recommended-4",
      title: "他の人にこのサービスを推奨しますか？（NPS）",
      type: "NU",
      source: "recommended",
      range: { min: 0, max: 10 },
      similarity: "追加推奨質問",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-[#202020]">
              調査票比較プレビュー
            </h2>
            <p className="text-sm text-[#9E9E9E] mt-1">
              アップロードファイルとレコメンド調査票の比較
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[#9E9E9E]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* File Info */}
          <div className="mb-6 p-4 bg-[#F9F9F9] rounded-lg">
            <h3 className="font-medium text-[#202020] mb-3">アップロードファイル</h3>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                  <FileText className="h-4 w-4 text-[#138FB5]" />
                  <span className="text-sm text-[#202020]">{file.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uploaded File Questions */}
            <div>
              <h3 className="font-medium text-[#202020] mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FF6B6B] rounded-full"></div>
                アップロードファイルから抽出
              </h3>
              <div className="space-y-4">
                {extractedQuestions.map((question, index) => (
                  <div key={question.id} className="border border-[#FF6B6B] rounded-lg p-4 bg-[#FFF5F5]">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="bg-[#FF6B6B] text-white text-xs px-2 py-1 rounded">
                        Q{index + 1}
                      </span>
                      <span className="bg-gray-100 text-[#666666] text-xs px-2 py-1 rounded">
                        {question.type}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-[#202020] mb-3">
                      {question.title}
                    </h4>

                    {(question.type === "SA" || question.type === "MA") && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type={question.type === "SA" ? "radio" : "checkbox"}
                              disabled
                              className="text-[#FF6B6B]"
                            />
                            <label className="text-sm text-[#666666]">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "NU" && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#666666]">
                          {question.range?.min}点
                        </span>
                        <input
                          type="range"
                          min={question.range?.min}
                          max={question.range?.max}
                          disabled
                          className="flex-1"
                        />
                        <span className="text-sm text-[#666666]">
                          {question.range?.max}点
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Survey Questions */}
            <div>
              <h3 className="font-medium text-[#202020] mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-[#138FB5] rounded-full"></div>
                レコメンド調査票
                {recommendedSurvey && (
                  <span className="text-sm text-[#9E9E9E]">({recommendedSurvey.title})</span>
                )}
              </h3>
              <div className="space-y-4">
                {recommendedQuestions.map((question, index) => (
                  <div key={question.id} className="border border-[#138FB5] rounded-lg p-4 bg-[#F0F8FF]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <span className="bg-[#138FB5] text-white text-xs px-2 py-1 rounded">
                          Q{index + 1}
                        </span>
                        <span className="bg-gray-100 text-[#666666] text-xs px-2 py-1 rounded">
                          {question.type}
                        </span>
                      </div>
                      <span className="text-xs bg-[#E8F4F8] text-[#138FB5] px-2 py-1 rounded-full">
                        {question.similarity}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-[#202020] mb-3">
                      {question.title}
                    </h4>

                    {(question.type === "SA" || question.type === "MA") && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type={question.type === "SA" ? "radio" : "checkbox"}
                              disabled
                              className="text-[#138FB5]"
                            />
                            <label className="text-sm text-[#666666]">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "NU" && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#666666]">
                          {question.range?.min}点
                        </span>
                        <input
                          type="range"
                          min={question.range?.min}
                          max={question.range?.max}
                          disabled
                          className="flex-1"
                        />
                        <span className="text-sm text-[#666666]">
                          {question.range?.max}点
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="mt-6 p-4 bg-[#F9F9F9] rounded-lg">
            <h3 className="font-medium text-[#202020] mb-3">比較分析結果</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-[#138FB5] mb-1">75%</div>
                <div className="text-sm text-[#666666]">質問の類似度</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-[#FF6B6B] mb-1">1</div>
                <div className="text-sm text-[#666666]">追加推奨質問</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-[#4CAF50] mb-1">高</div>
                <div className="text-sm text-[#666666]">適合度</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#666666] hover:text-[#202020] transition-colors"
          >
            閉じる
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                // アップロードファイルベースで作成
                onClose();
              }}
              className="px-6 py-2 border border-[#FF6B6B] text-[#FF6B6B] rounded-lg hover:bg-[#FFF5F5] transition-colors"
            >
              アップロードファイルベースで作成
            </button>
            <button
              onClick={() => {
                // レコメンド調査票ベースで作成
                onClose();
              }}
              className="px-6 py-2 bg-[#138FB5] text-white rounded-lg hover:bg-[#0f7a9e] transition-colors"
            >
              レコメンド調査票ベースで作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
