"use client";

import { Send, Upload, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import RuleModelModal from "@/components/survey-assistant/RuleModelModal";
import SurveyLibrary from "@/components/survey-assistant/SurveyLibrary";
import SurveyPreviewModal from "@/components/survey-assistant/SurveyPreviewModal";
import SurveyBuilderModal from "@/components/survey-assistant/SurveyBuilderModal";

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
  const [showSurveyBuilderModal, setShowSurveyBuilderModal] = useState(false);
  const [selectedPastSurvey, setSelectedPastSurvey] = useState<Survey | null>(null);
  const [recommendedSurveys, setRecommendedSurveys] = useState<Survey[]>([]);
  const [hasProcessedMessage, setHasProcessedMessage] = useState(false);

  // Extract keywords from message for survey filtering
  const extractKeywordsFromMessage = (message: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      満足度: ["満足度", "NPS", "ブランド評価", "顧客満足"],
      認知度: ["認知度", "定点", "ブランド"],
      購買: ["購買行動", "変化", "トレンド"],
      コンセプト: ["新商品", "コンセプト", "評価"],
      デジタル: ["デジタル", "UX", "満足度"],
      価格: ["価格", "感度", "分析", "料金", "コスト"],
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
      // 課題整理・要件定義関連のキーワードを追加
      課題: ["課題", "問題", "改善", "課題整理", "要件"],
      顧客: ["顧客", "カスタマー", "ユーザー", "利用者", "お客様"],
      サービス: ["サービス", "プロダクト", "商品", "製品"],
      評価: ["評価", "レビュー", "フィードバック", "意見"],
      継続: ["継続", "リピート", "再利用", "利用意向"],
      品質: ["品質", "クオリティ", "性能"],
      使いやすさ: ["使いやすさ", "UI", "UX", "操作性", "ユーザビリティ"],
      サポート: ["サポート", "対応", "ヘルプ", "カスタマーサービス"],
      要件: ["要件", "仕様", "ニーズ", "目的", "要件定義"],
      調査: ["調査", "アンケート", "リサーチ", "分析"],
    };

    const lowerMessage = message.toLowerCase();
    const foundKeywords: string[] = [];

    // メッセージからキーワード抽出
    Object.entries(keywordMap).forEach(([key, keywords]) => {
      if (
        lowerMessage.includes(key.toLowerCase()) ||
        keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))
      ) {
        foundKeywords.push(...keywords);
      }
    });

    // アップロードファイル名からもキーワード抽出
    attachedFiles.forEach(file => {
      const fileName = file.name.toLowerCase();
      Object.entries(keywordMap).forEach(([key, keywords]) => {
        if (
          fileName.includes(key.toLowerCase()) ||
          keywords.some((keyword) => fileName.includes(keyword.toLowerCase()))
        ) {
          foundKeywords.push(...keywords);
        }
      });
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

  // Generate recommended surveys based on message content and keywords
  const generateRecommendedSurveys = (message: string, keywords: string[]): Survey[] => {
    // Mock survey data for demonstration
    const allSurveys: Survey[] = [
      {
        id: "1",
        title: "消費者満足度調査 2024年版",
        client: "A社",
        purpose: "満足度調査",
        implementationDate: "2024年3月",
        tags: ["満足度", "NPS", "ブランド評価"],
        description: "顧客満足度とNPSを測定する包括的な調査",
      },
      {
        id: "2",
        title: "ブランド認知度定点調査",
        client: "B社",
        purpose: "定点調査",
        implementationDate: "2024年1月",
        tags: ["認知度", "定点", "ブランド"],
        description: "四半期ごとのブランド認知度追跡調査",
      },
      {
        id: "3",
        title: "購買行動変化調査",
        client: "C社",
        purpose: "行動調査",
        implementationDate: "2024年2月",
        tags: ["購買行動", "変化", "トレンド"],
        description: "コロナ後の消費者購買行動の変化を分析",
      },
    ];

    // Score surveys based on keyword matches and message content
    const scoredSurveys = allSurveys.map(survey => {
      let score = 0;
      const lowerMessage = message.toLowerCase();
      
      // Check title matches
      if (lowerMessage.includes(survey.title.toLowerCase())) score += 10;
      
      // Check tag matches
      survey.tags.forEach(tag => {
        if (keywords.includes(tag) || lowerMessage.includes(tag.toLowerCase())) {
          score += 5;
        }
      });
      
      // Check purpose matches
      if (keywords.some(keyword => survey.purpose.includes(keyword))) score += 3;
      
      return { ...survey, score };
    });

    // Return top 3 recommended surveys
    return scoredSurveys
      .filter(survey => survey.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) return;

    // Handle message processing here
    console.log("Message:", inputMessage);
    console.log("Files:", attachedFiles);

    // Extract keywords from input message for survey filtering
    const keywords = extractKeywordsFromMessage(inputMessage);
    setSearchKeywords(keywords);

    // Generate recommended surveys based on message content
    const recommended = generateRecommendedSurveys(inputMessage, keywords);
    setRecommendedSurveys(recommended);
    setHasProcessedMessage(true);

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
    // Read-only mode: Navigate to existing survey overview page first
    console.log("既存調査への遷移:", {
      referenceSurvey,
      selectedRuleModel,
      modelName: getRuleModelDisplayName(selectedRuleModel),
    });

    // Navigate to survey overview page (step 0: 概要の設定)
    // Use survey ID 79 (latest survey with sections)
    const surveyId = 79;
    router.push(`/surveys/${surveyId}`);
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
    console.log("ベース調査票を選択:", survey);
    // ベース調査票として選択されたものを設定
    // 参考調査票は固定で別の調査票を使用
    const pastSurvey = {
      id: "1",
      title: "消費者満足度調査 2024年版",
      client: "A社",
      purpose: "満足度調査",
      implementationDate: "2024年3月",
      tags: ["満足度", "NPS", "ブランド評価"],
      description: "顧客満足度とNPSを測定する包括的な調査",
    };
    setSelectedPastSurvey(pastSurvey);
    setReferenceSurvey(survey); // ベース調査票として使用
    setShowSurveyBuilderModal(true);
  };

  const handleCreateSurveyFromBuilder = (questions: any[]) => {
    console.log("新規調査票を作成:", questions);
    // TODO: 選択された設問で新しい調査票を作成
    // 読み取り専用モードでは実際の作成は行わず、既存調査に遷移
    const surveyId = 79;
    router.push(`/surveys/${surveyId}`);
  };

  const handleCompareWithTopRecommendation = () => {
    if (recommendedSurveys.length > 0) {
      setReferenceSurvey(recommendedSurveys[0]);
      setIsRecommendedComparison(true);
      setShowComparisonModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Main Content */}
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Instruction Text */}
        <div className="text-center">
          <p className="text-[#9E9E9E] text-lg">
            過去調査票をアップロードもしくは、調査要件をチャットボックスにご入力ください
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

        {/* AI Recommendation Results */}
        {hasProcessedMessage && recommendedSurveys.length > 0 && (
          <div className="bg-gradient-to-r from-[#E8F4F8] to-[#F0F8FF] border border-[#138FB5] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#138FB5] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#202020]">AIレコメンド結果</h3>
                  <p className="text-sm text-[#666666]">
                    入力内容に基づいて{recommendedSurveys.length}件の関連調査票を発見しました
                  </p>
                </div>
              </div>
              {attachedFiles.length > 0 && (
                <button
                  onClick={handleCompareWithTopRecommendation}
                  className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] font-medium transition-colors text-sm"
                >
                  トップレコメンドと比較
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedSurveys.map((survey, index) => (
                <div key={survey.id} className="bg-white rounded-lg p-4 border border-[#138FB5]/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#138FB5] text-white text-xs px-2 py-1 rounded-full">
                      #{index + 1} 推奨
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePreviewSurvey(survey)}
                        className="p-1 text-[#9E9E9E] hover:text-[#138FB5] rounded transition-colors"
                        title="プレビュー"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCompareSurvey(survey)}
                        className="px-2 py-1 bg-[#FF6B6B] text-white text-xs rounded hover:bg-[#FF5252] transition-colors"
                        title="比較"
                      >
                        比較
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-[#202020] text-sm mb-2 line-clamp-2">
                    {survey.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {survey.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-[#E8F4F8] text-[#138FB5] px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#666666] line-clamp-2">
                    {survey.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Survey Library */}
        <SurveyLibrary
          onSelectSurvey={handleSurveySelect}
          searchKeywords={searchKeywords}
          onClearSearch={handleClearSearch}
          onPreviewSurvey={handlePreviewSurvey}
          onCompareSurvey={handleCompareSurvey}
          hasUploadedFiles={attachedFiles.length > 0}
          recommendedSurveyIds={recommendedSurveys.map(s => s.id)}
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

      {showSurveyBuilderModal && (
        <SurveyBuilderModal
          isOpen={showSurveyBuilderModal}
          pastSurvey={selectedPastSurvey}
          baseSurvey={referenceSurvey}
          onClose={() => {
            setShowSurveyBuilderModal(false);
            setSelectedPastSurvey(null);
            setReferenceSurvey(null);
          }}
          onCreateSurvey={handleCreateSurveyFromBuilder}
        />
      )}
    </div>
  );
}
