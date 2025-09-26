"use client";

import { Send, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import RuleModelModal from "@/components/survey-assistant/RuleModelModal";
import SurveyLibrary from "@/components/survey-assistant/SurveyLibrary";
import SurveyPreviewModal from "@/components/survey-assistant/SurveyPreviewModal";
import ComparisonPreviewModal from "@/components/survey-assistant/ComparisonPreviewModal";

interface Survey {
  id: string;
  title: string;
  client: string;
  purpose: string;
  implementationDate: string;
  tags: string[];
  description: string;
}

export default function SurveyAssistantPage() {
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedRuleModel, setSelectedRuleModel] = useState<string | null>(
    null,
  );
  const [referenceSurvey, setReferenceSurvey] = useState<Survey | null>(null);
  const [selectedRuleModelName, setSelectedRuleModelName] = useState<
    string | null
  >(null);
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Extract keywords from message for survey filtering
  const extractKeywordsFromMessage = (message: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      満足度: ["満足度", "NPS", "ブランド評価"],
      認知度: ["認知度", "定点", "ブランド"],
      購買: ["購買行動", "変化", "トレンド"],
      コンセプト: ["新商品", "コンセプト", "評価"],
      デジタル: ["デジタル", "UX", "満足度"],
      価格: ["価格", "感度", "分析"],
      SNS: ["SNS", "利用実態", "デジタル"],
      健康: ["健康", "意識", "ライフスタイル"],
      教育: ["教育", "オンライン", "学習"],
      テレワーク: ["テレワーク", "働き方", "生産性"],
      環境: ["サステナビリティ", "環境", "意識"],
      フード: ["フードデリバリー", "利用実態", "満足度"],
      決済: ["キャッシュレス", "決済", "フィンテック"],
      エンタメ: ["エンターテイメント", "消費", "メディア"],
      スマート: ["スマートホーム", "IoT", "導入実態"],
      副業: ["副業", "兼業", "働き方"],
      シェア: ["シェアリング", "エコノミー", "利用実態"],
      メンタル: ["メンタルヘルス", "健康", "ストレス"],
      Z世代: ["Z世代", "消費行動", "価値観"],
      医療: ["リモート医療", "テレヘルス", "満足度"],
    };

    const lowerMessage = message.toLowerCase();
    const foundKeywords: string[] = [];

    Object.entries(keywordMap).forEach(([key, keywords]) => {
      if (
        lowerMessage.includes(key.toLowerCase()) ||
        keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))
      ) {
        foundKeywords.push(...keywords);
      }
    });

    return [...new Set(foundKeywords)]; // Remove duplicates
  };

  // Extract keywords from file names
  const extractKeywordsFromFiles = (files: File[]): string[] => {
    const keywords: string[] = [];
    files.forEach((file) => {
      const fileName = file.name.toLowerCase();
      if (fileName.includes("満足度") || fileName.includes("satisfaction")) {
        keywords.push("満足度", "NPS", "ブランド評価");
      }
      if (fileName.includes("認知度") || fileName.includes("awareness")) {
        keywords.push("認知度", "定点", "ブランド");
      }
      if (fileName.includes("購買") || fileName.includes("purchase")) {
        keywords.push("購買行動", "変化", "トレンド");
      }
      // Add more file-based keyword extraction logic as needed
    });
    return [...new Set(keywords)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) return;

    // Handle message processing here
    console.log("Message:", inputMessage);
    console.log("Files:", attachedFiles);

    // Extract keywords from input message for survey filtering
    const keywords = extractKeywordsFromMessage(inputMessage);
    setSearchKeywords(keywords);

    setInputMessage("");
    setAttachedFiles([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(files)]);

      // Extract keywords from file names for survey filtering
      const fileKeywords = extractKeywordsFromFiles(Array.from(files));
      setSearchKeywords(fileKeywords);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSurveySelect = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowRuleModal(true);
  };

  const handleRuleModelSelect = (ruleModel: string) => {
    setShowRuleModal(false);
    setReferenceSurvey(selectedSurvey);
    setSelectedRuleModel(ruleModel);
    setSelectedRuleModelName(getRuleModelDisplayName(ruleModel));
  };

  const handleStartDesign = () => {
    // 調査設計画面への遷移
    console.log("調査設計を開始:", {
      referenceSurvey,
      selectedRuleModel,
      modelName: getRuleModelDisplayName(selectedRuleModel),
    });

    // 選択した参考調査票とルールモデルの情報をURLパラメータで渡す
    const params = new URLSearchParams();
    if (referenceSurvey) {
      params.set("referenceSurveyId", referenceSurvey.id);
      params.set("referenceSurveyTitle", referenceSurvey.title);
    }
    if (selectedRuleModel) {
      params.set("ruleModel", selectedRuleModel);
      params.set(
        "ruleModelName",
        getRuleModelDisplayName(selectedRuleModel) || "",
      );
    }

    const url = params.toString()
      ? `/surveys/new?${params.toString()}`
      : "/surveys/new";
    router.push(url);
  };

  const getRuleModelDisplayName = (modelId: string | null) => {
    if (!modelId) return null;
    switch (modelId) {
      case "a-company":
        return "A社ルール";
      case "b-company":
        return "B社ルール";
      case "c-company":
        return "C社ルール";
      default:
        return modelId;
    }
  };

  const handleClearSearch = () => {
    setSearchKeywords([]);
  };

  const handlePreviewSurvey = (survey: Survey) => {
    setPreviewSurvey(survey);
    setShowPreviewModal(true);
  };

  const handleCompareSurvey = (survey: Survey) => {
    setReferenceSurvey(survey);
    setShowComparisonModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Main Content */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Instruction Text */}
        <div className="text-center">
          <p className="text-[#9E9E9E] text-lg">
            参考にしたい調査票をアップロードするか、テキストで入力ください
          </p>
        </div>

        {/* Chat Box */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-[#202020]">
                添付ファイル:
              </p>
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-lg border border-gray-200"
                >
                  <span className="text-sm text-[#202020]">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="調査について質問や要件をお聞かせください..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#138FB5] focus:border-transparent resize-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="chat-file-upload"
                accept=".pdf,.doc,.docx,.xlsx,.pptx,.txt,.csv"
                multiple
              />
              <label
                htmlFor="chat-file-upload"
                className="p-3 bg-gray-200 text-[#202020] rounded-lg hover:bg-gray-300 cursor-pointer transition-colors"
              >
                <Upload className="h-5 w-5" />
              </label>

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() && attachedFiles.length === 0}
                className="p-3 bg-[#138FB5] text-white rounded-lg hover:bg-[#0f7a9e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Survey Library */}
        <SurveyLibrary
          onSelectSurvey={handleSurveySelect}
          searchKeywords={searchKeywords}
          onClearSearch={handleClearSearch}
          onPreviewSurvey={handlePreviewSurvey}
          onCompareSurvey={handleCompareSurvey}
          hasUploadedFiles={attachedFiles.length > 0}
        />

        {/* Settings Display */}
        {(referenceSurvey || selectedRuleModelName) && (
          <div className="bg-[#E8F4F8] border border-[#138FB5] rounded-lg p-4 mb-6">
            <div className="text-center space-y-2">
              {referenceSurvey && (
                <p className="text-sm text-[#0f7a9e]">
                  参考調査票:{" "}
                  <span className="font-semibold">{referenceSurvey.title}</span>
                </p>
              )}
              {selectedRuleModelName && (
                <p className="text-sm text-[#0f7a9e]">
                  適用ルールモデル:{" "}
                  <span className="font-semibold">{selectedRuleModelName}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Design Button - Always visible at bottom */}
        <div className="text-center">
          <button
            onClick={handleStartDesign}
            className="px-8 py-3 bg-[#138FB5] text-white rounded-lg hover:bg-[#0f7a9e] font-medium transition-colors shadow-sm"
          >
            新規調査設計へ進む
          </button>
        </div>
      </div>

      {showRuleModal && (
        <RuleModelModal
          isOpen={showRuleModal}
          survey={referenceSurvey || selectedSurvey}
          onClose={() => setShowRuleModal(false)}
          onSelect={handleRuleModelSelect}
          onCreateModel={(modelName, description) => {
            console.log("新しいルールモデルを作成:", modelName, description);
          }}
        />
      )}

      {showPreviewModal && (
        <SurveyPreviewModal
          isOpen={showPreviewModal}
          survey={previewSurvey}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewSurvey(null);
          }}
        />
      )}

      {showComparisonModal && (
        <ComparisonPreviewModal
          isOpen={showComparisonModal}
          uploadedFiles={attachedFiles}
          recommendedSurvey={referenceSurvey}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
}
