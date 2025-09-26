"use client";

import { X } from "lucide-react";
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

interface SurveyPreviewModalProps {
  isOpen: boolean;
  survey: Survey | null;
  onClose: () => void;
}

export default function SurveyPreviewModal({
  isOpen,
  survey,
  onClose,
}: SurveyPreviewModalProps) {
  if (!isOpen || !survey) return null;

  // モックの質問データ
  const mockQuestions = [
    {
      id: "q1",
      type: "SA",
      title: "あなたの性別を教えてください",
      options: ["男性", "女性", "その他", "回答しない"],
    },
    {
      id: "q2",
      type: "SA",
      title: "あなたの年齢を教えてください",
      options: ["20代", "30代", "40代", "50代", "60代以上"],
    },
    {
      id: "q3",
      type: "MA",
      title: `${survey.client}のサービスについて、満足している点をすべてお選びください`,
      options: [
        "価格の安さ",
        "品質の良さ",
        "サービスの充実",
        "スタッフの対応",
        "利便性",
        "その他",
      ],
    },
    {
      id: "q4",
      type: "NU",
      title: `${survey.client}のサービスを総合的に評価すると、10点満点で何点ですか？`,
      range: { min: 1, max: 10 },
    },
    {
      id: "q5",
      type: "FA",
      title: `${survey.client}のサービスについて、改善してほしい点があれば自由にお書きください`,
      placeholder: "改善点をご記入ください...",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-[#202020]">
              {survey.title}
            </h2>
            <p className="text-sm text-[#9E9E9E] mt-1">
              {survey.client} • {survey.implementationDate}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Survey Info */}
          <div className="mb-6 p-4 bg-[#F9F9F9] rounded-lg">
            <h3 className="font-medium text-[#202020] mb-2">調査概要</h3>
            <p className="text-sm text-[#666666] mb-3">{survey.description}</p>
            <div className="flex flex-wrap gap-2">
              {survey.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-[#138FB5] text-white px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Questions Preview */}
          <div className="space-y-6">
            <h3 className="font-medium text-[#202020] mb-4">質問プレビュー</h3>
            
            {mockQuestions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="bg-[#138FB5] text-white text-xs px-2 py-1 rounded">
                    Q{index + 1}
                  </span>
                  <span className="bg-gray-100 text-[#666666] text-xs px-2 py-1 rounded">
                    {question.type}
                  </span>
                </div>
                
                <h4 className="font-medium text-[#202020] mb-3">
                  {question.title}
                </h4>

                {/* Question Type Specific Content */}
                {(question.type === "SA" || question.type === "MA") && (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type={question.type === "SA" ? "radio" : "checkbox"}
                          name={`question-${question.id}`}
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

                {question.type === "FA" && (
                  <textarea
                    placeholder={question.placeholder}
                    disabled
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-[#666666] resize-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#666666] hover:text-[#202020] transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={() => {
              // この調査票を参考にする処理
              onClose();
            }}
            className="px-6 py-2 bg-[#138FB5] text-white rounded-lg hover:bg-[#0f7a9e] transition-colors"
          >
            この調査票を参考にする
          </button>
        </div>
      </div>
    </div>
  );
}
