import { CheckCircle, Plus, X } from "lucide-react";
import React, { useState } from "react";

interface Survey {
  id: string;
  title: string;
  client: string;
  purpose: string;
  implementationDate: string;
  tags: string[];
  description: string;
}

interface RuleModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: string) => void;
  onCreateModel: (modelName: string, description: string) => void;
  survey?: Survey | null;
}

const defaultRuleModels = [
  {
    id: "a-company",
    name: "A社ルール",
    description: "一般的な調査設計ルールを適用",
    features: ["基本的な質問構成", "標準的な回答選択肢", "一般的な調査フロー"],
    recommended: false,
  },
  {
    id: "b-company",
    name: "B社ルール",
    description: "詳細な分析と最適化を含む設計",
    features: ["高度な質問ロジック", "カスタム回答形式", "詳細な分岐設定"],
    recommended: true,
  },
  {
    id: "c-company",
    name: "C社ルール",
    description: "企業固有のルールを設定",
    features: [
      "企業独自のガイドライン",
      "ブランド固有の質問形式",
      "特殊な調査要件",
    ],
    recommended: false,
  },
];

function RuleModelModal({
  isOpen,
  onClose,
  onSelect,
  onCreateModel,
  survey,
}: RuleModelModalProps) {
  const [selectedModel, setSelectedModel] = useState<string>("b-company");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelDescription, setNewModelDescription] = useState("");

  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect(selectedModel);
  };

  const handleCreateModel = () => {
    if (newModelName.trim() && newModelDescription.trim()) {
      onCreateModel(newModelName, newModelDescription);
      setNewModelName("");
      setNewModelDescription("");
      setShowCreateForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              ルールモデルを選択
            </h2>
            {survey && (
              <p className="text-sm text-gray-600 mt-1">
                参考調査票: {survey.title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showCreateForm ? (
            <>
              <div className="space-y-4 mb-6">
                {defaultRuleModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedModel === model.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedModel === model.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedModel === model.id && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            {model.name}
                            {model.recommended && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                推奨
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {model.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-8">
                      <div className="flex flex-wrap gap-2">
                        {model.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  新しいルールモデルを作成
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                新しいルールモデルを作成
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  モデル名
                </label>
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="例: D社ルール"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  placeholder="このルールモデルの特徴や適用場面を説明してください"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateModel}
                  disabled={!newModelName.trim() || !newModelDescription.trim()}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  作成
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showCreateForm && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              選択したルールモデルが調査設計に適用されます
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                選択して続行
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RuleModelModal;
