import { CheckCircle, Plus, X, Eye, FileText, Palette, GitBranch, Shield, Play } from "lucide-react";
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

interface RuleModel {
  id: string;
  name: string;
  description: string;
  features: string[];
  recommended: boolean;
  companyId?: string;
  departmentId?: string;
  level: 'global' | 'company' | 'department';
  parentId?: string;
  inheritedRules?: string[];
  // 詳細ルール内容
  detailedRules: {
    questionRules: QuestionRule[];
    designRules: DesignRule[];
    flowRules: FlowRule[];
    validationRules: ValidationRule[];
  };
  // プレビュー用サンプル
  sampleQuestions?: SampleQuestion[];
}

interface QuestionRule {
  id: string;
  category: 'structure' | 'wording' | 'options' | 'logic';
  title: string;
  description: string;
  examples: string[];
  doAndDont: {
    do: string[];
    dont: string[];
  };
}

interface DesignRule {
  id: string;
  category: 'layout' | 'colors' | 'typography' | 'branding';
  title: string;
  description: string;
  specifications: {
    property: string;
    value: string;
    description?: string;
  }[];
  preview?: string; // CSS or style description
}

interface FlowRule {
  id: string;
  category: 'navigation' | 'branching' | 'validation' | 'completion';
  title: string;
  description: string;
  conditions: string[];
}

interface ValidationRule {
  id: string;
  category: 'required' | 'format' | 'range' | 'logic';
  title: string;
  description: string;
  errorMessages: string[];
}

interface SampleQuestion {
  id: string;
  type: 'SA' | 'MA' | 'FA' | 'NUM';
  title: string;
  options?: string[];
  designApplied: string[]; // どのデザインルールが適用されているか
}

interface Company {
  id: string;
  name: string;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  companyId: string;
}

interface RuleModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: string) => void;
  onCreateModel: (modelName: string, description: string, companyId?: string, departmentId?: string) => void;
  survey?: Survey | null;
  currentUser?: {
    companyId?: string;
    departmentId?: string;
    role?: 'admin' | 'manager' | 'user';
  };
}

// サンプル会社・部署データ
const sampleCompanies: Company[] = [
  {
    id: "company-a",
    name: "A株式会社",
    departments: [
      { id: "dept-a1", name: "マーケティング部", companyId: "company-a" },
      { id: "dept-a2", name: "営業部", companyId: "company-a" },
      { id: "dept-a3", name: "人事部", companyId: "company-a" },
    ],
  },
  {
    id: "company-b", 
    name: "B株式会社",
    departments: [
      { id: "dept-b1", name: "商品企画部", companyId: "company-b" },
      { id: "dept-b2", name: "カスタマーサクセス部", companyId: "company-b" },
    ],
  },
];

const hierarchicalRuleModels: RuleModel[] = [
  // グローバルルール
  {
    id: "global-standard",
    name: "標準ルール",
    description: "全社共通の基本的な調査設計ルール",
    features: ["基本的な質問構成", "標準的な回答選択肢", "一般的な調査フロー"],
    recommended: false,
    level: 'global',
    detailedRules: {
      questionRules: [
        {
          id: "q1",
          category: "structure",
          title: "質問文の構造",
          description: "明確で理解しやすい質問文を作成する",
          examples: ["あなたの年齢を教えてください", "この商品についてどう思いますか？"],
          doAndDont: {
            do: ["簡潔で明確な表現を使う", "一つの質問で一つの内容を聞く"],
            dont: ["曖昧な表現を避ける", "複数の内容を一つの質問で聞かない"]
          }
        },
        {
          id: "q2", 
          category: "options",
          title: "選択肢の設計",
          description: "バランスの取れた選択肢を提供する",
          examples: ["非常に満足/満足/普通/不満/非常に不満", "はい/いいえ/わからない"],
          doAndDont: {
            do: ["選択肢は相互排他的にする", "「その他」選択肢を適切に配置"],
            dont: ["選択肢に重複を作らない", "極端に偏った選択肢を避ける"]
          }
        }
      ],
      designRules: [
        {
          id: "d1",
          category: "layout",
          title: "基本レイアウト",
          description: "読みやすく操作しやすいレイアウト",
          specifications: [
            { property: "質問間の余白", value: "24px", description: "質問同士の視覚的分離" },
            { property: "選択肢の間隔", value: "12px", description: "選択肢の見やすさ確保" },
            { property: "最大幅", value: "800px", description: "読みやすい行長の維持" }
          ],
          preview: "シンプルで清潔なレイアウト"
        },
        {
          id: "d2",
          category: "colors",
          title: "基本カラーパレット",
          description: "アクセシビリティを考慮した色使い",
          specifications: [
            { property: "プライマリ", value: "#2563eb", description: "メインアクション色" },
            { property: "テキスト", value: "#374151", description: "本文テキスト色" },
            { property: "背景", value: "#ffffff", description: "背景色" },
            { property: "ボーダー", value: "#d1d5db", description: "境界線色" }
          ]
        }
      ],
      flowRules: [
        {
          id: "f1",
          category: "navigation",
          title: "基本ナビゲーション",
          description: "直感的な画面遷移",
          conditions: ["進む/戻るボタンを常に表示", "進捗表示を含める", "途中保存機能を提供"]
        }
      ],
      validationRules: [
        {
          id: "v1",
          category: "required",
          title: "必須項目の検証",
          description: "必須項目の適切な検証",
          errorMessages: ["この項目は必須です", "選択してください"]
        }
      ]
    },
    sampleQuestions: [
      {
        id: "sample1",
        type: "SA",
        title: "あなたの年齢を教えてください",
        options: ["18-24歳", "25-34歳", "35-44歳", "45-54歳", "55歳以上"],
        designApplied: ["基本レイアウト", "基本カラーパレット"]
      }
    ]
  },
  
  // A社のルール
  {
    id: "company-a-rule",
    name: "A株式会社ルール",
    description: "A社の企業方針に基づく調査設計ルール",
    features: ["A社ブランドガイドライン", "顧客満足度重視", "シンプルな設問構成"],
    recommended: false,
    level: 'company',
    companyId: "company-a",
    parentId: "global-standard",
    inheritedRules: ["基本的な質問構成", "標準的な回答選択肢"],
    detailedRules: {
      questionRules: [
        {
          id: "aq1",
          category: "wording",
          title: "A社らしい質問表現",
          description: "親しみやすく、分かりやすい表現を心がける",
          examples: ["お客様にとって", "いかがでしたか", "お聞かせください"],
          doAndDont: {
            do: ["敬語を適切に使用", "親しみやすい表現", "分かりやすい言葉選び"],
            dont: ["専門用語の多用", "堅い表現", "曖昧な表現"]
          }
        }
      ],
      designRules: [
        {
          id: "ad1",
          category: "branding",
          title: "A社コーポレートカラー",
          description: "A社のブランドアイデンティティを反映したカラー設計",
          specifications: [
            { property: "メインカラー", value: "#003366", description: "A社ネイビー" },
            { property: "アクセントカラー", value: "#FF6B35", description: "A社オレンジ" },
            { property: "背景色", value: "#F8F9FA", description: "ライトグレー" }
          ],
          preview: "A社らしい落ち着いた色調の調査デザイン"
        }
      ],
      flowRules: [],
      validationRules: []
    }
  },
  
  // A社マーケティング部のルール
  {
    id: "dept-a1-rule",
    name: "A社マーケティング部ルール", 
    description: "マーケティング調査に特化したルール",
    features: ["ブランド認知度測定", "購買意向調査", "競合比較分析", "NPS測定"],
    recommended: true,
    level: 'department',
    companyId: "company-a",
    departmentId: "dept-a1",
    parentId: "company-a-rule",
    inheritedRules: ["A社ブランドガイドライン", "顧客満足度重視"],
    detailedRules: {
      questionRules: [
        {
          id: "mq1",
          category: "structure",
          title: "ブランド認知度測定の質問構造",
          description: "ブランド認知から態度変容まで段階的に測定",
          examples: [
            "以下のブランドをご存知ですか？（純粋想起）",
            "以下のブランドの中で利用したことがあるものは？（利用経験）",
            "最も好きなブランドはどれですか？（ブランド選好）"
          ],
          doAndDont: {
            do: ["認知→利用→選好の順序で質問", "競合ブランドを含めて測定"],
            dont: ["誘導的な質問を避ける", "ブランド名を最初から提示しない"]
          }
        },
        {
          id: "mq2",
          category: "logic",
          title: "NPS測定ロジック",
          description: "Net Promoter Scoreの標準的な測定方法",
          examples: [
            "この商品を友人や同僚に勧める可能性は？（0-10点）",
            "その理由を教えてください（自由回答）"
          ],
          doAndDont: {
            do: ["0-10の11段階評価を使用", "理由を必ず聞く"],
            dont: ["評価尺度を変更しない", "誘導的な理由選択肢を提示しない"]
          }
        }
      ],
      designRules: [
        {
          id: "md1",
          category: "branding",
          title: "A社ブランドカラー適用",
          description: "A社のブランドアイデンティティを反映",
          specifications: [
            { property: "プライマリカラー", value: "#1e40af", description: "A社ブルー" },
            { property: "セカンダリカラー", value: "#f59e0b", description: "A社オレンジ" },
            { property: "ロゴ配置", value: "ヘッダー右上", description: "ブランド認知向上" }
          ],
          preview: "A社ブランドカラーを基調とした調査デザイン"
        },
        {
          id: "md2",
          category: "layout",
          title: "マーケティング調査専用レイアウト",
          description: "ブランド比較しやすいカード型レイアウト",
          specifications: [
            { property: "ブランドカード幅", value: "200px", description: "ブランドロゴ表示最適化" },
            { property: "比較表示", value: "横並び3列", description: "競合比較の視認性向上" },
            { property: "評価スケール", value: "スライダー形式", description: "直感的な評価入力" }
          ]
        }
      ],
      flowRules: [
        {
          id: "mf1",
          category: "branching",
          title: "ブランド認知度別分岐",
          description: "認知度に応じた質問分岐",
          conditions: [
            "認知あり → 詳細態度測定へ",
            "認知なし → 認知度向上施策評価へ",
            "利用経験あり → 満足度・推奨度測定へ"
          ]
        }
      ],
      validationRules: [
        {
          id: "mv1",
          category: "logic",
          title: "マーケティング指標の整合性チェック",
          description: "KPI測定の論理的整合性を確保",
          errorMessages: [
            "認知していないブランドは選択できません",
            "利用経験のないブランドの満足度は評価できません"
          ]
        }
      ]
    },
    sampleQuestions: [
      {
        id: "msample1",
        type: "MA",
        title: "以下のブランドの中で、ご存知のものをすべて選択してください",
        options: ["A社", "B社", "C社", "D社", "E社"],
        designApplied: ["A社ブランドカラー適用", "マーケティング調査専用レイアウト"]
      },
      {
        id: "msample2", 
        type: "NUM",
        title: "A社を友人や同僚に勧める可能性はどの程度ですか？（0-10点でお答えください）",
        designApplied: ["評価スケール"]
      }
    ]
  },
  
  // A社営業部のルール
  {
    id: "dept-a2-rule",
    name: "A社営業部ルール",
    description: "営業活動支援のための調査ルール",
    features: ["リード品質評価", "商談プロセス分析", "顧客ニーズ調査"],
    recommended: false,
    level: 'department',
    companyId: "company-a",
    departmentId: "dept-a2", 
    parentId: "company-a-rule",
    inheritedRules: ["A社ブランドガイドライン", "シンプルな設問構成"],
    detailedRules: {
      questionRules: [
        {
          id: "sa1",
          category: "structure",
          title: "営業向け質問構成",
          description: "営業活動に直結する情報を効率的に収集",
          examples: ["購入検討時期はいつ頃ですか？", "決裁者はどなたですか？", "予算はどの程度ですか？"],
          doAndDont: {
            do: ["具体的な数値を聞く", "決裁プロセスを確認", "競合状況を把握"],
            dont: ["抽象的な質問", "営業に関係ない項目", "長すぎる質問"]
          }
        }
      ],
      designRules: [
        {
          id: "sd1",
          category: "layout",
          title: "営業効率重視レイアウト",
          description: "短時間で回答できるシンプルなデザイン",
          specifications: [
            { property: "質問数", value: "最大10問", description: "回答負荷軽減" },
            { property: "回答時間", value: "3分以内", description: "営業現場での実用性" },
            { property: "必須項目", value: "最小限", description: "回答率向上" }
          ],
          preview: "シンプルで回答しやすい営業向けデザイン"
        }
      ],
      flowRules: [],
      validationRules: []
    }
  },
  
  // B社のルール
  {
    id: "company-b-rule",
    name: "B株式会社ルール",
    description: "B社の詳細分析重視の調査設計ルール",
    features: ["高度な質問ロジック", "カスタム回答形式", "詳細な分岐設定"],
    recommended: false,
    level: 'company',
    companyId: "company-b",
    parentId: "global-standard",
    inheritedRules: ["一般的な調査フロー"],
    detailedRules: {
      questionRules: [
        {
          id: "bq1",
          category: "logic",
          title: "高度な質問ロジック",
          description: "複雑な分岐と条件設定による詳細な情報収集",
          examples: ["前問で「はい」と答えた方のみ", "複数回答の組み合わせによる分岐", "スコア計算による自動判定"],
          doAndDont: {
            do: ["論理的な分岐設計", "回答者の負荷を考慮", "データの整合性確保"],
            dont: ["過度に複雑な分岐", "矛盾する条件設定", "無意味な質問の増加"]
          }
        }
      ],
      designRules: [
        {
          id: "bd1",
          category: "layout",
          title: "分析重視デザイン",
          description: "データ分析に最適化されたレイアウト設計",
          specifications: [
            { property: "データ形式", value: "構造化", description: "分析ツール連携" },
            { property: "回答形式", value: "統一", description: "データクリーニング効率化" },
            { property: "必須項目", value: "詳細設定", description: "データ品質確保" }
          ],
          preview: "分析に最適化された詳細なデザイン"
        }
      ],
      flowRules: [],
      validationRules: []
    }
  },
  
  // B社商品企画部のルール
  {
    id: "dept-b1-rule",
    name: "B社商品企画部ルール",
    description: "新商品開発のための市場調査ルール",
    features: ["コンセプトテスト", "価格感度分析", "機能優先度調査", "ターゲット分析"],
    recommended: true,
    level: 'department',
    companyId: "company-b",
    departmentId: "dept-b1",
    parentId: "company-b-rule",
    inheritedRules: ["高度な質問ロジック", "詳細な分岐設定"],
    detailedRules: {
      questionRules: [
        {
          id: "pq1",
          category: "structure",
          title: "コンセプトテスト設計",
          description: "新商品コンセプトの受容性を測定する質問構成",
          examples: ["このコンセプトの魅力度は？", "購入意向はどの程度？", "価格の妥当性は？"],
          doAndDont: {
            do: ["具体的なコンセプト提示", "比較評価の実施", "定量的な測定"],
            dont: ["抽象的な表現", "誘導的な質問", "主観的な評価のみ"]
          }
        },
        {
          id: "pq2",
          category: "options",
          title: "価格感度分析",
          description: "適切な価格帯を把握するための選択肢設計",
          examples: ["PSM法による価格測定", "価格階段による受容性調査", "競合比較価格評価"],
          doAndDont: {
            do: ["段階的な価格提示", "競合との比較", "購入意向との関連付け"],
            dont: ["極端な価格設定", "単一価格での評価", "価格のみの評価"]
          }
        }
      ],
      designRules: [
        {
          id: "pd1",
          category: "layout",
          title: "商品企画専用レイアウト",
          description: "商品コンセプトを効果的に伝えるデザイン",
          specifications: [
            { property: "画像表示", value: "大きめサイズ", description: "コンセプト理解促進" },
            { property: "比較表示", value: "並列配置", description: "競合比較の視認性" },
            { property: "評価軸", value: "統一スケール", description: "データ比較の精度向上" }
          ],
          preview: "商品コンセプトが伝わりやすいビジュアル重視デザイン"
        }
      ],
      flowRules: [],
      validationRules: []
    }
  },
];

function RuleModelModal({
  isOpen,
  onClose,
  onSelect,
  onCreateModel,
  survey,
  currentUser = { companyId: "company-a", departmentId: "dept-a1", role: "user" }, // デフォルト値
}: RuleModelModalProps) {
  const [selectedModel, setSelectedModel] = useState<string>("dept-a1-rule");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelDescription, setNewModelDescription] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>(currentUser.companyId || "");
  const [selectedDepartment, setSelectedDepartment] = useState<string>(currentUser.departmentId || "");
  const [viewMode, setViewMode] = useState<'available' | 'all'>('available');
  const [showDepartmentSelector, setShowDepartmentSelector] = useState(false);
  const [selectionStep, setSelectionStep] = useState<'company' | 'department'>('company');
  const [searchQuery, setSearchQuery] = useState("");
  const [detailRuleModel, setDetailRuleModel] = useState<RuleModel | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'questions' | 'design'>('questions');

  if (!isOpen) return null;

  // ユーザーが利用可能なルールモデルをフィルタリング
  const getAvailableRuleModels = (): RuleModel[] => {
    if (viewMode === 'all') {
      return hierarchicalRuleModels;
    }

    return hierarchicalRuleModels.filter(model => {
      // グローバルルールは常に利用可能
      if (model.level === 'global') return true;
      
      // 会社レベルのルール：選択された会社のルールが利用可能
      if (model.level === 'company') {
        return model.companyId === selectedCompany;
      }
      
      // 部署レベルのルール：選択された部署のルールが利用可能
      if (model.level === 'department') {
        return model.companyId === selectedCompany && 
               model.departmentId === selectedDepartment;
      }
      
      return false;
    });
  };

  // 継承されたルールを含む完全な機能リストを取得
  const getFullFeatures = (model: RuleModel): string[] => {
    const features = [...model.features];
    if (model.inheritedRules) {
      features.unshift(...model.inheritedRules.map(rule => `📋 ${rule}`));
    }
    return features;
  };

  // 階層レベルのアイコンを取得
  const getLevelIcon = (level: RuleModel['level']): string => {
    switch (level) {
      case 'global': return '🌐';
      case 'company': return '🏢';
      case 'department': return '🏬';
      default: return '📋';
    }
  };

  const availableModels = getAvailableRuleModels();

  const handleSelect = () => {
    onSelect(selectedModel);
  };

  const handleCreateModel = () => {
    if (newModelName.trim() && newModelDescription.trim()) {
      onCreateModel(
        newModelName, 
        newModelDescription, 
        selectedCompany || currentUser.companyId,
        selectedDepartment || currentUser.departmentId
      );
      setNewModelName("");
      setNewModelDescription("");
      setShowCreateForm(false);
    }
  };

  // 現在のユーザーの会社・部署情報を取得
  const getCurrentCompany = () => sampleCompanies.find(c => c.id === currentUser.companyId);
  const getCurrentDepartment = () => getCurrentCompany()?.departments.find(d => d.id === currentUser.departmentId);

  // ルール詳細表示ハンドラー
  const handleShowRuleDetail = (model: RuleModel) => {
    setDetailRuleModel(model);
    setActiveDetailTab('questions');
  };

  // 会社選択ハンドラー
  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
    setSelectionStep('department');
    setSearchQuery("");
  };

  // 部署選択ハンドラー
  const handleDepartmentSelect = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setShowDepartmentSelector(false);
    setSelectionStep('company');
    // 選択されたルールをリセット
    setSelectedModel("");
    setDetailRuleModel(null);
  };

  // 選択をリセットして会社選択に戻る
  const handleBackToCompanySelection = () => {
    setSelectionStep('company');
    setSearchQuery("");
  };

  // 検索フィルタリング
  const getFilteredCompanies = () => {
    if (!searchQuery) return sampleCompanies;
    return sampleCompanies.filter(company => 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.departments.some(dept => 
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const getFilteredDepartments = () => {
    const company = sampleCompanies.find(c => c.id === selectedCompany);
    if (!company) return [];
    if (!searchQuery) return company.departments;
    return company.departments.filter(dept =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

        {/* Content - 2パネル構成 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左パネル - ルール選択 */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">ルール一覧</h3>
              
              {/* 事業部選択 - 標準ルール以外の場合のみ表示 */}
              {detailRuleModel?.level !== 'global' && (
                <div className="mb-3">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">適用事業部</span>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowDepartmentSelector(!showDepartmentSelector)}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          🏢 {sampleCompanies.find(c => c.id === selectedCompany)?.name}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-sm text-gray-700">
                          🏬 {sampleCompanies.find(c => c.id === selectedCompany)?.departments.find(d => d.id === selectedDepartment)?.name}
                        </span>
                      </div>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDepartmentSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* 事業部選択ドロップダウン */}
                    {showDepartmentSelector && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {/* 検索バー */}
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="会社名・部署名で検索..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* ブレッドクラム */}
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center text-xs text-gray-600">
                            <button
                              onClick={handleBackToCompanySelection}
                              className={`hover:text-blue-600 ${selectionStep === 'company' ? 'text-blue-600 font-medium' : ''}`}
                            >
                              会社選択
                            </button>
                            {selectionStep === 'department' && (
                              <>
                                <span className="mx-1">›</span>
                                <span className="text-blue-600 font-medium">部署選択</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3">
                          {selectionStep === 'company' ? (
                            /* 会社選択ステップ */
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">会社を選択してください</h4>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {getFilteredCompanies().map((company) => (
                                  <button
                                    key={company.id}
                                    onClick={() => handleCompanySelect(company.id)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                                      selectedCompany === company.id
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span>🏢</span>
                                        <span>{company.name}</span>
                                        <span className="text-xs text-gray-500">({company.departments.length}部署)</span>
                                      </div>
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* 部署選択ステップ */
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700">
                                  {sampleCompanies.find(c => c.id === selectedCompany)?.name} の部署を選択
                                </h4>
                                <button
                                  onClick={handleBackToCompanySelection}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  ← 会社を変更
                                </button>
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {getFilteredDepartments().map((dept) => (
                                  <button
                                    key={dept.id}
                                    onClick={() => handleDepartmentSelect(dept.id)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                                      selectedDepartment === dept.id
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>🏬</span>
                                      <span>{dept.name}</span>
                                      {selectedDepartment === dept.id && (
                                        <span className="ml-auto text-blue-500">✓</span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 標準ルール選択時の説明 */}
              {detailRuleModel?.level === 'global' && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <span className="text-sm font-medium text-blue-800">標準ルール適用中</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">全社共通の基本的な調査設計ルールが適用されます</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'available' ? 'all' : 'available')}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {viewMode === 'available' ? '全てのルールを表示' : '利用可能なルールのみ'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {!showCreateForm ? (
                <>
                  <div className="space-y-4 mb-6">
                {availableModels.map((model) => {
                  const isUnavailable = viewMode === 'all' && !getAvailableRuleModels().includes(model);
                  const fullFeatures = getFullFeatures(model);
                  
                  return (
                    <div
                      key={model.id}
                      onClick={() => {
                        if (!isUnavailable) {
                          setSelectedModel(model.id);
                          handleShowRuleDetail(model);
                        }
                      }}
                      className={`p-4 border rounded-lg transition-all duration-200 ${
                        isUnavailable 
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                          : selectedModel === model.id
                            ? "border-blue-500 bg-blue-50 cursor-pointer"
                            : "border-gray-200 hover:border-gray-300 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedModel === model.id && !isUnavailable
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedModel === model.id && !isUnavailable && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                              <span className="text-lg">{getLevelIcon(model.level)}</span>
                              {model.name}
                              {model.recommended && !isUnavailable && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                  推奨
                                </span>
                              )}
                              {isUnavailable && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                  利用不可
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {model.description}
                            </p>
                            {model.parentId && (
                              <p className="text-xs text-gray-500 mt-1">
                                📋 継承元: {hierarchicalRuleModels.find(m => m.id === model.parentId)?.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-8">
                        <div className="flex flex-wrap gap-2">
                          {fullFeatures.map((feature, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                feature.startsWith('📋')
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
          </div>

          {/* 右パネル - ルール詳細 */}
          <div className="w-1/2 flex flex-col">
            {detailRuleModel ? (
              <>
                {/* 右パネルヘッダー */}
                <div className="p-6 border-b border-gray-200 bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getLevelIcon(detailRuleModel.level)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{detailRuleModel.name}</h3>
                    {detailRuleModel.recommended && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        推奨
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{detailRuleModel.description}</p>
                  {detailRuleModel.parentId && (
                    <p className="text-xs text-gray-500 mt-2">
                      📋 継承元: {hierarchicalRuleModels.find(m => m.id === detailRuleModel.parentId)?.name}
                    </p>
                  )}
                </div>

                {/* タブナビゲーション */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  {[
                    { id: 'questions', label: '質問ルール', icon: FileText },
                    { id: 'design', label: '設問表デザイン', icon: Palette },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                        activeDetailTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-3 w-3" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* タブコンテンツ */}
                <div className="flex-1 overflow-y-auto p-4">
                  {activeDetailTab === 'questions' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">質問設計ルール</h4>
                      {detailRuleModel.detailedRules.questionRules.map((rule) => (
                        <div key={rule.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {rule.category}
                            </span>
                            <h5 className="font-medium text-gray-900 text-sm">{rule.title}</h5>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{rule.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <h6 className="font-medium text-green-700 mb-1">✅ 推奨</h6>
                              <ul className="text-gray-600 space-y-1">
                                {rule.doAndDont.do.map((item, index) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <span className="text-green-500">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-red-700 mb-1">❌ 避ける</h6>
                              <ul className="text-gray-600 space-y-1">
                                {rule.doAndDont.dont.map((item, index) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <span className="text-red-500">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {rule.examples.length > 0 && (
                            <div className="mt-3">
                              <h6 className="text-xs font-medium text-gray-700 mb-1">📝 例文</h6>
                              <div className="bg-gray-50 rounded p-2">
                                {rule.examples.map((example, index) => (
                                  <p key={index} className="text-xs text-gray-600 mb-1 last:mb-0">
                                    "{example}"
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeDetailTab === 'design' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">設問表デザインルール</h4>
                      {detailRuleModel.detailedRules.designRules.map((rule) => (
                        <div key={rule.id} className="border border-gray-200 rounded-lg p-3">
                          {rule.preview && (
                            <div className="mt-3">
                              <h6 className="text-xs font-medium text-gray-700 mb-1">👁️ 設問表プレビュー</h6>
                              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                {/* 実際のスタイルプレビュー */}
                                {rule.id === 'ad1' ? (
                                  <div style={{ 
                                    backgroundColor: '#F8F9FA',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                  }}>
                                    <div style={{ 
                                      color: '#003366',
                                      fontSize: '16px',
                                      fontWeight: '600',
                                      marginBottom: '12px'
                                    }}>
                                      Q1. A社のサービスについてお聞かせください
                                    </div>
                                    <div>
                                      <label style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        color: '#374151',
                                        marginBottom: '6px'
                                      }}>
                                        <input 
                                          type="radio" 
                                          name="sample-a" 
                                          style={{ accentColor: '#FF6B35' }}
                                          disabled 
                                        />
                                        非常に満足
                                      </label>
                                      <label style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        color: '#374151'
                                      }}>
                                        <input 
                                          type="radio" 
                                          name="sample-a" 
                                          style={{ accentColor: '#FF6B35' }}
                                          disabled 
                                        />
                                        満足
                                      </label>
                                    </div>
                                  </div>
                                ) : rule.id === 'md1' ? (
                                  <div style={{ 
                                    backgroundColor: '#ffffff',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '2px solid #1e40af'
                                  }}>
                                    <div style={{ 
                                      color: '#1e40af',
                                      fontSize: '18px',
                                      fontWeight: '700',
                                      marginBottom: '16px',
                                      textAlign: 'center'
                                    }}>
                                      ブランド認知度調査
                                    </div>
                                    <div style={{ 
                                      color: '#374151',
                                      fontSize: '16px',
                                      fontWeight: '600',
                                      marginBottom: '12px'
                                    }}>
                                      Q1. 以下のブランドをご存知ですか？
                                    </div>
                                    <div style={{ 
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(3, 1fr)',
                                      gap: '12px',
                                      marginBottom: '16px'
                                    }}>
                                      {['A社', 'B社', 'C社'].map((brand, index) => (
                                        <div key={index} style={{
                                          padding: '12px',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '6px',
                                          textAlign: 'center',
                                          backgroundColor: '#f9fafb',
                                          fontSize: '14px',
                                          fontWeight: '500'
                                        }}>
                                          {brand}
                                        </div>
                                      ))}
                                    </div>
                                    <div style={{
                                      height: '4px',
                                      backgroundColor: '#f59e0b',
                                      borderRadius: '2px',
                                      width: '60%'
                                    }}></div>
                                  </div>
                                ) : (
                                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                    <p className="text-xs text-blue-800">{rule.preview}</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* 全体サンプルプレビュー */}
                              <div className="mt-4">
                                <h6 className="text-xs font-medium text-gray-700 mb-2">📋 設問表全体プレビュー</h6>
                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                  {/* 全体プレビューの実装 */}
                                  {rule.id === 'ad1' && (
                                    <div style={{ backgroundColor: '#F8F9FA' }}>
                                      {/* ヘッダー */}
                                      <div style={{ 
                                        backgroundColor: '#003366',
                                        color: 'white',
                                        padding: '16px',
                                        textAlign: 'center'
                                      }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700' }}>A社 顧客満足度調査</div>
                                        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>ご協力ありがとうございます</div>
                                      </div>
                                      
                                      {/* プログレス */}
                                      <div style={{ padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                          <span style={{ fontSize: '12px', color: '#6b7280' }}>進捗状況</span>
                                          <span style={{ fontSize: '12px', color: '#6b7280' }}>3 / 10</span>
                                        </div>
                                        <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                                          <div style={{ 
                                            height: '100%', 
                                            width: '30%', 
                                            backgroundColor: '#FF6B35', 
                                            borderRadius: '3px' 
                                          }}></div>
                                        </div>
                                      </div>
                                      
                                      {/* 質問エリア */}
                                      <div style={{ padding: '24px 16px' }}>
                                        <div style={{ 
                                          color: '#003366',
                                          fontSize: '16px',
                                          fontWeight: '600',
                                          marginBottom: '16px'
                                        }}>
                                          Q3. [質問文がここに表示されます]
                                        </div>
                                        
                                        <div style={{ marginBottom: '24px' }}>
                                          {[1,2,3,4].map(i => (
                                            <div key={i} style={{ 
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '12px',
                                              padding: '12px',
                                              backgroundColor: 'white',
                                              border: '1px solid #d1d5db',
                                              borderRadius: '8px',
                                              marginBottom: '8px'
                                            }}>
                                              <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                border: '2px solid #FF6B35',
                                                borderRadius: '50%'
                                              }}></div>
                                              <span style={{ fontSize: '14px', color: '#6b7280' }}>選択肢 {i}</span>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* ナビゲーション */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                          <button style={{
                                            padding: '10px 20px',
                                            backgroundColor: 'white',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            color: '#374151'
                                          }}>
                                            ← 前へ
                                          </button>
                                          <button style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#FF6B35',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            color: 'white',
                                            fontWeight: '600'
                                          }}>
                                            次へ →
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {rule.id === 'md1' && (
                                    <div style={{ backgroundColor: 'white' }}>
                                      {/* マーケティング調査ヘッダー */}
                                      <div style={{ 
                                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                        color: 'white',
                                        padding: '20px',
                                        textAlign: 'center'
                                      }}>
                                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>ブランド認知度調査</div>
                                        <div style={{ fontSize: '14px', opacity: 0.9 }}>マーケティング部 実施</div>
                                      </div>
                                      
                                      {/* ステップインジケーター */}
                                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                          {['基本情報', 'ブランド認知', '利用状況', '満足度'].map((step, index) => (
                                            <div key={index} style={{ 
                                              display: 'flex', 
                                              alignItems: 'center',
                                              fontSize: '12px',
                                              color: index === 1 ? '#1e40af' : '#94a3b8'
                                            }}>
                                              <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: index === 1 ? '#1e40af' : '#e2e8f0',
                                                color: index === 1 ? 'white' : '#94a3b8',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                marginRight: '6px'
                                              }}>
                                                {index + 1}
                                              </div>
                                              {step}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {/* 質問エリア */}
                                      <div style={{ padding: '24px' }}>
                                        <div style={{ 
                                          fontSize: '18px',
                                          fontWeight: '600',
                                          color: '#1e293b',
                                          marginBottom: '20px',
                                          textAlign: 'center'
                                        }}>
                                          [ブランド認知度に関する質問]
                                        </div>
                                        
                                        {/* ブランドカードレイアウト */}
                                        <div style={{ 
                                          display: 'grid',
                                          gridTemplateColumns: 'repeat(3, 1fr)',
                                          gap: '16px',
                                          marginBottom: '24px'
                                        }}>
                                          {['ブランドA', 'ブランドB', 'ブランドC'].map((brand, index) => (
                                            <div key={index} style={{
                                              padding: '20px',
                                              border: '2px solid #e2e8f0',
                                              borderRadius: '12px',
                                              textAlign: 'center',
                                              backgroundColor: '#f8fafc',
                                              cursor: 'pointer'
                                            }}>
                                              <div style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#e2e8f0',
                                                borderRadius: '8px',
                                                margin: '0 auto 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                color: '#64748b'
                                              }}>
                                                LOGO
                                              </div>
                                              <div style={{ fontSize: '14px', fontWeight: '500' }}>{brand}</div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* 評価スライダー */}
                                        <div style={{ 
                                          backgroundColor: '#f1f5f9',
                                          padding: '16px',
                                          borderRadius: '8px',
                                          marginBottom: '20px'
                                        }}>
                                          <div style={{ fontSize: '14px', marginBottom: '12px', color: '#475569' }}>認知度評価</div>
                                          <div style={{ 
                                            height: '8px',
                                            backgroundColor: '#e2e8f0',
                                            borderRadius: '4px',
                                            position: 'relative'
                                          }}>
                                            <div style={{
                                              height: '100%',
                                              width: '70%',
                                              backgroundColor: '#f59e0b',
                                              borderRadius: '4px'
                                            }}></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* デフォルト全体プレビュー */}
                                  {!['ad1', 'md1'].includes(rule.id) && (
                                    <div style={{ backgroundColor: '#f9fafb' }}>
                                      <div style={{ 
                                        backgroundColor: '#374151',
                                        color: 'white',
                                        padding: '16px',
                                        textAlign: 'center'
                                      }}>
                                        <div style={{ fontSize: '16px', fontWeight: '600' }}>調査票タイトル</div>
                                      </div>
                                      <div style={{ padding: '20px' }}>
                                        <div style={{ 
                                          fontSize: '16px',
                                          fontWeight: '600',
                                          marginBottom: '16px',
                                          color: '#374151'
                                        }}>
                                          [質問文エリア]
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                          {[1,2,3].map(i => (
                                            <div key={i} style={{ 
                                              padding: '12px',
                                              backgroundColor: 'white',
                                              border: '1px solid #d1d5db',
                                              borderRadius: '6px',
                                              marginBottom: '8px',
                                              fontSize: '14px',
                                              color: '#6b7280'
                                            }}>
                                              選択肢 {i}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">ルールを選択してください</p>
                  <p className="text-xs text-gray-400 mt-1">左側からルールをクリックすると詳細が表示されます</p>
                </div>
              </div>
            )}
          </div>
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
