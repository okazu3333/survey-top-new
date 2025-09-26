"use client";

import { FileText, X, Upload } from "lucide-react";
import React from "react";

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
  isRecommendedComparison?: boolean;
  onFileUpload?: (files: File[]) => void;
  onCreateFromUpload?: () => void;
  onCreateFromRecommended?: () => void;
  onProceedToDesign?: () => void;
}

export default function ComparisonPreviewModal({
  isOpen,
  uploadedFiles,
  recommendedSurvey,
  onClose,
  isRecommendedComparison = false,
  onFileUpload,
  onCreateFromUpload,
  onCreateFromRecommended,
  onProceedToDesign,
}: ComparisonPreviewModalProps) {
  if (!isOpen) return null;

  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onFileUpload) {
      onFileUpload(Array.from(files));
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files && onFileUpload) {
      onFileUpload(Array.from(files));
    }
  };

  // PDFファイルから調査票内容を生成（モック）
  const generateSurveyFromPDF = (fileName: string) => {
    return {
      title: "顧客満足度調査アンケート",
      questions: [
        {
          id: "pdf-q1",
          title: "お客様の年齢層を教えてください",
          type: "SA",
          source: "pdf",
          options: ["20代", "30代", "40代", "50代", "60代以上"],
        },
        {
          id: "pdf-q2",
          title: "サービスの満足度を教えてください",
          type: "NU",
          source: "pdf",
          range: { min: 1, max: 5 },
        },
        {
          id: "pdf-q3",
          title: "今後も継続してご利用いただけますか？",
          type: "SA",
          source: "pdf",
          options: ["はい", "いいえ", "わからない"],
        },
      ]
    };
  };

  // アップロードファイルから抽出された内容（モック）
  const extractedContent = uploadedFiles.map(file => {
    // ファイル名から内容タイプを推測
    const fileName = file.name.toLowerCase();
    const isPDFFile = fileName.endsWith('.pdf');
    const isSurveyFile = fileName.includes('survey') || fileName.includes('調査') || fileName.includes('questionnaire') || isPDFFile;
    
    if (isPDFFile) {
      // PDFファイルの場合は調査票として処理
      const pdfSurvey = generateSurveyFromPDF(file.name);
      return {
        fileName: file.name,
        type: 'survey' as const,
        title: pdfSurvey.title,
        questions: pdfSurvey.questions,
      };
    } else if (isSurveyFile) {
      // 調査票ファイルの場合
      return {
        fileName: file.name,
        type: 'survey' as const,
        questions: [
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
        ]
      };
    } else {
      // 課題整理や要件定義ファイルの場合
      return {
        fileName: file.name,
        type: 'requirements' as const,
        requirements: [
          {
            id: "req1",
            category: "課題・背景",
            text: "顧客満足度の低下が懸念されており、具体的な改善点を把握する必要がある",
          },
          {
            id: "req2",
            category: "調査目的",
            text: "サービス利用者の満足度と改善要望を定量・定性的に把握する",
          },
          {
            id: "req3",
            category: "対象者",
            text: "過去6ヶ月以内にサービスを利用した顧客（約1000名）",
          },
          {
            id: "req4",
            category: "調査項目",
            text: "総合満足度、各機能の評価、継続利用意向、改善要望",
          },
        ]
      };
    }
  });

  // 後方互換性のため、最初のファイルの質問を抽出
  const extractedQuestions = extractedContent.find(c => c.type === 'survey')?.questions || [];

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
              {isRecommendedComparison ? "AIレコメンド調査票との比較" : "調査票比較プレビュー"}
            </h2>
            <p className="text-sm text-[#9E9E9E] mt-1">
              {isRecommendedComparison 
                ? "AIが推奨する調査票との詳細比較" 
                : "アップロードファイルとレコメンド調査票の比較"
              }
            </p>
          </div>
          {onProceedToDesign && (
            <button
              onClick={onProceedToDesign}
              className="px-4 py-2 bg-[#138FB5] text-white rounded-lg hover:bg-[#0f7a9e] font-medium transition-colors"
            >
              このまま調査設計へ進む
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Side - File Upload & Analysis */}
            <div className={`border-2 border-dashed rounded-lg transition-colors ${
              isDragOver 
                ? 'border-[#FF5252] bg-[#FFF5F5]' 
                : 'border-[#FF6B6B]'
            }`}>
              {extractedContent.length > 0 ? (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-[#202020] flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FF6B6B] rounded-full"></div>
                      アップロードファイルから抽出
                    </h3>
                    {onCreateFromUpload && (
                      <button
                        onClick={onCreateFromUpload}
                        className="px-3 py-1 bg-[#FF6B6B] text-white text-sm rounded hover:bg-[#FF5252] transition-colors"
                      >
                        ベースで作成
                      </button>
                    )}
                  </div>
                  
                  {/* File List */}
                  <div className="mb-4 space-y-3">
                    {extractedContent.map((content, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-[#FF6B6B]" />
                          <span className="font-medium">{content.fileName}</span>
                          <span className="text-xs px-2 py-1 bg-[#FFF5F5] text-[#FF6B6B] rounded-full">
                            {content.fileName.toLowerCase().endsWith('.pdf') ? 'PDF調査票' : 
                             content.type === 'survey' ? '調査票' : '要件・課題'}
                          </span>
                        </div>
                        {content.title && (
                          <div className="ml-6 text-sm font-medium text-[#202020] bg-white px-3 py-2 rounded border-l-4 border-[#FF6B6B]">
                            📋 {content.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    {extractedQuestions.map((question, index) => (
                  <div key={question.id} className={`border rounded-lg p-4 ${
                    question.source === 'pdf' 
                      ? 'border-[#9C27B0] bg-[#F3E5F5]' 
                      : 'border-[#FF6B6B] bg-[#FFF5F5]'
                  }`}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`text-white text-xs px-2 py-1 rounded ${
                        question.source === 'pdf' ? 'bg-[#9C27B0]' : 'bg-[#FF6B6B]'
                      }`}>
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
              ) : (
                <div 
                  className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-16 w-16 text-[#FF6B6B] mb-4 opacity-50" />
                  <h3 className="font-medium text-[#202020] mb-2">
                    ファイルをドラッグ&ドロップ
                  </h3>
                  <p className="text-sm text-[#9E9E9E] mb-4">
                    調査票や要件ファイルをここにドロップしてください
                  </p>
                  <div className="text-xs text-[#9E9E9E] mb-4">
                    対応形式: .txt, .pdf, .doc, .docx, .xlsx, .xls, .csv
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#9E9E9E] text-sm mb-4">
                    <div className="flex-1 h-px bg-[#E5E5E5]"></div>
                    <span>または</span>
                    <div className="flex-1 h-px bg-[#E5E5E5]"></div>
                  </div>
                  
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload-modal"
                    accept=".txt,.pdf,.doc,.docx,.xlsx,.xls,.csv"
                  />
                  <label
                    htmlFor="file-upload-modal"
                    className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg cursor-pointer hover:bg-[#FF5252] transition-colors text-sm"
                  >
                    ファイルを選択
                  </label>
                </div>
              )}
            </div>

            {/* Recommended Survey Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[#202020] flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#138FB5] rounded-full"></div>
                  レコメンド調査票
                  {recommendedSurvey && (
                    <span className="text-sm text-[#9E9E9E]">({recommendedSurvey.title})</span>
                  )}
                </h3>
                {onCreateFromRecommended && (
                  <button
                    onClick={onCreateFromRecommended}
                    className="px-3 py-1 bg-[#138FB5] text-white text-sm rounded hover:bg-[#0f7a9e] transition-colors"
                  >
                    ベースで作成
                  </button>
                )}
              </div>
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
