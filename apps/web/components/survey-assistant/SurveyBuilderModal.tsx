"use client";

import { X, Plus, GripVertical, Trash2, FileText, List, Sparkles } from "lucide-react";
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

interface Question {
  id: string;
  code: string;
  type: 'SA' | 'MA' | 'FA' | 'NUM';
  title: string;
  options?: string[];
  sectionTitle?: string;
}

interface DragItem {
  type: 'question-text' | 'single-option';
  question: Question;
  option?: string;
  optionIndex?: number;
}

interface SurveyBuilderModalProps {
  isOpen: boolean;
  pastSurvey: Survey | null;
  baseSurvey: Survey | null; // ベースとなる調査票
  onClose: () => void;
  onCreateSurvey?: (questions: Question[]) => void;
}

// 過去の調査票のサンプル設問データ
const getPastSurveyQuestions = (surveyId: string): Question[] => {
  const questionSets: { [key: string]: Question[] } = {
    "1": [
      {
        id: "q1",
        code: "SC1",
        type: "SA",
        title: "性別を教えてください",
        options: ["男性", "女性", "回答しない"],
        sectionTitle: "基本属性"
      },
      {
        id: "q2", 
        code: "SC2",
        type: "SA",
        title: "年齢を教えてください",
        options: ["20-29歳", "30-39歳", "40-49歳", "50-59歳", "60歳以上"],
        sectionTitle: "基本属性"
      },
      {
        id: "q3",
        code: "SC3", 
        type: "SA",
        title: "居住地（都道府県）を教えてください",
        options: ["北海道・東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"],
        sectionTitle: "基本属性"
      },
      {
        id: "q4",
        code: "Q1",
        type: "SA",
        title: "当サービスの利用頻度を教えてください",
        options: ["毎日", "週に数回", "週1回", "月に数回", "ほとんど利用しない"],
        sectionTitle: "利用実態"
      },
      {
        id: "q5",
        code: "Q2",
        type: "MA",
        title: "利用する理由を教えてください（複数選択可）",
        options: ["価格が安い", "品質が良い", "使いやすい", "サポートが充実", "信頼できる"],
        sectionTitle: "利用実態"
      },
      {
        id: "q6",
        code: "Q3",
        type: "SA",
        title: "総合的な満足度を教えてください",
        options: ["非常に満足", "満足", "どちらでもない", "不満", "非常に不満"],
        sectionTitle: "満足度評価"
      },
      {
        id: "q7",
        code: "Q4",
        type: "FA",
        title: "改善してほしい点があれば自由にお書きください",
        sectionTitle: "満足度評価"
      },
      {
        id: "q8",
        code: "Q5",
        type: "SA",
        title: "今後も利用し続けますか",
        options: ["継続する", "条件次第で継続", "どちらでもない", "利用を検討中", "利用を中止する"],
        sectionTitle: "今後の利用意向"
      }
    ]
  };
  
  return questionSets[surveyId] || questionSets["1"];
};

export default function SurveyBuilderModal({
  isOpen,
  pastSurvey,
  baseSurvey,
  onClose,
  onCreateSurvey,
}: SurveyBuilderModalProps) {
  if (!isOpen || !pastSurvey || !baseSurvey) return null;

  const [pastQuestions] = useState<Question[]>(getPastSurveyQuestions(pastSurvey.id));
  const [baseQuestions, setBaseQuestions] = useState<Question[]>(getPastSurveyQuestions(baseSurvey.id));
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, dragItem: DragItem) => {
    console.log('Drag start:', dragItem);
    setDraggedItem(dragItem);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData('text/plain', JSON.stringify(dragItem));
  };

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    console.log('Drop event triggered:', { draggedItem, targetIndex });
    
    if (draggedItem) {
      const timestamp = Date.now();
      
      if (draggedItem.type === 'question-text') {
        // 設問文を新しい設問として追加
        const newQuestion: Question = {
          id: `added_question_${timestamp}`,
          code: `Q${baseQuestions.length + 1}`,
          type: draggedItem.question.type,
          title: draggedItem.question.title,
          options: draggedItem.question.type === 'FA' || draggedItem.question.type === 'NUM' ? undefined : [],
          sectionTitle: draggedItem.question.sectionTitle,
        };
        
        console.log('Adding question:', newQuestion);
        
        if (targetIndex !== undefined && targetIndex <= baseQuestions.length) {
          // 指定位置に挿入
          const newQuestions = [...baseQuestions];
          newQuestions.splice(targetIndex, 0, newQuestion);
          setBaseQuestions(newQuestions);
          console.log('Inserted question at index:', targetIndex, 'New length:', newQuestions.length);
        } else {
          // 末尾に追加
          setBaseQuestions(prev => [...prev, newQuestion]);
          console.log('Added question to end, new length:', baseQuestions.length + 1);
        }
      } else if (draggedItem.type === 'single-option' && draggedItem.option) {
        // 選択肢を新しい設問として追加
        const newQuestion: Question = {
          id: `added_option_question_${timestamp}`,
          code: `Q${baseQuestions.length + 1}`,
          type: 'SA', // 選択肢から作成する場合は単一回答
          title: `${draggedItem.question.title}の選択肢から作成`,
          options: [draggedItem.option],
          sectionTitle: draggedItem.question.sectionTitle,
        };
        
        console.log('Adding option-based question:', newQuestion);
        
        if (targetIndex !== undefined && targetIndex <= baseQuestions.length) {
          // 指定位置に挿入
          const newQuestions = [...baseQuestions];
          newQuestions.splice(targetIndex, 0, newQuestion);
          setBaseQuestions(newQuestions);
          console.log('Inserted option-based question at index:', targetIndex, 'New length:', newQuestions.length);
        } else {
          // 末尾に追加
          setBaseQuestions(prev => [...prev, newQuestion]);
          console.log('Added option-based question to end, new length:', baseQuestions.length + 1);
        }
      }
      
      setDraggedItem(null);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    setBaseQuestions(prev => prev.filter(q => q.id !== questionId));
  };


  const handleCreateSurvey = () => {
    if (onCreateSurvey) {
      onCreateSurvey(baseQuestions);
    }
    onClose();
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'SA': return '単一選択';
      case 'MA': return '複数選択';
      case 'FA': return '自由記述';
      case 'NUM': return '数値入力';
      default: return type;
    }
  };

  const groupQuestionsBySection = (questions: Question[]) => {
    const grouped: { [key: string]: Question[] } = {};
    questions.forEach(q => {
      const section = q.sectionTitle || 'その他';
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(q);
    });
    return grouped;
  };

  const pastQuestionsBySection = groupQuestionsBySection(pastQuestions);
  const baseQuestionsBySection = groupQuestionsBySection(baseQuestions);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative p-6 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">調査票作成</h2>
            <p className="text-sm text-gray-600">
              参考調査票から設問・選択肢をドラッグして新しい調査票を作成
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Past Survey Questions */}
          <div className="w-1/2 border-r bg-slate-100 flex flex-col">
            <div className="p-4 border-b bg-slate-200 border-slate-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h3 className="font-medium text-slate-800">参考調査票</h3>
              </div>
              <p className="text-sm text-slate-700 mb-1 font-medium">{pastSurvey.title}</p>
              <p className="text-xs text-slate-600">
                設問文や選択肢をドラッグして右側に追加
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(pastQuestionsBySection).map(([sectionTitle, questions]) => (
                <div key={sectionTitle} className="bg-slate-50 rounded-lg border border-slate-300">
                  <div className="px-4 py-2 bg-slate-200 border-b border-slate-300 text-center">
                    <h4 className="font-medium text-slate-700">{sectionTitle}</h4>
                  </div>
                  <div className="p-3 space-y-2">
                    {questions.map((question) => (
                      <div key={question.id} className="space-y-3">
                        {/* 設問文 */}
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, { type: 'question-text', question })}
                          className="p-3 border border-slate-400 bg-slate-200 rounded-lg cursor-move hover:bg-slate-300 hover:border-slate-500 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <GripVertical className="w-4 h-4 text-slate-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono bg-slate-300 text-slate-800 px-2 py-1 rounded">
                                  {question.code}
                                </span>
                                <span className="text-xs text-slate-700">
                                  {getQuestionTypeLabel(question.type)}
                                </span>
                                <span className="text-xs bg-slate-800 text-white px-2 py-1 rounded">
                                  設問文
                                </span>
                              </div>
                              <p className="text-sm text-slate-900 leading-relaxed font-medium">
                                {question.title}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 選択肢（一つひとつ表示） */}
                        {question.options && question.options.length > 0 && (
                          <div className="ml-4 space-y-1">
                            <div className="text-xs text-slate-600 mb-2 font-medium">選択肢:</div>
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={`${question.id}-option-${optionIndex}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, { 
                                  type: 'single-option', 
                                  question, 
                                  option: option,
                                  optionIndex: optionIndex 
                                })}
                                className="p-2 border border-slate-400 bg-slate-300 rounded cursor-move hover:bg-slate-400 hover:border-slate-500 transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-3 h-3 text-slate-600 flex-shrink-0" />
                                  <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">
                                    {optionIndex + 1}
                                  </span>
                                  <span className="text-sm text-slate-900 font-medium">
                                    {option}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Base Survey Modification */}
          <div className="w-1/2 flex flex-col bg-blue-25">
            <div className="p-4 border-b bg-blue-50 border-blue-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-blue-800">新しい調査票</h3>
              </div>
              <p className="text-sm text-blue-700 mb-1 font-medium">{baseSurvey.title}をベースに作成中</p>
              <p className="text-xs text-blue-600">
                現在の設問数: {baseQuestions.length}件
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-blue-25">
              <div className="space-y-4">
                {Object.keys(baseQuestionsBySection).length === 0 && (
                  <div 
                    className="h-32 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-blue-500 bg-blue-50"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      console.log('Dropped on empty area');
                      handleDrop(e);
                    }}
                  >
                    ここに設問をドラッグ&ドロップしてください
                  </div>
                )}
                {Object.entries(baseQuestionsBySection).map(([sectionTitle, questions]) => (
                  <div key={sectionTitle} className="bg-white rounded-lg border border-blue-200 shadow-sm">
                    <div className="px-4 py-2 bg-blue-100 border-b border-blue-200 text-center">
                      <h4 className="font-medium text-blue-800">{sectionTitle}</h4>
                    </div>
                    <div className="p-3 space-y-2">
                      {questions.map((question, questionIndex) => {
                        const globalIndex = baseQuestions.findIndex(q => q.id === question.id);
                        const insertIndex = globalIndex >= 0 ? globalIndex : baseQuestions.length;
                        return (
                          <div key={question.id}>
                            {/* Drop zone above each question */}
                            <div
                              className={`h-8 border-2 border-dashed transition-all duration-200 ${
                                dragOverIndex === insertIndex 
                                  ? 'border-blue-400 bg-blue-100' 
                                  : 'border-transparent hover:border-blue-300 hover:bg-blue-50'
                              } rounded flex items-center justify-center`}
                              onDragOver={(e) => handleDragOver(e, insertIndex)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, insertIndex)}
                            >
                              <span className="text-xs text-blue-500 opacity-0 hover:opacity-100 transition-opacity">
                                ここに挿入
                              </span>
                            </div>
                            
                            {/* Question components */}
                            <div className="space-y-3 group">
                              {/* 設問文 */}
                              <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <GripVertical className="w-4 h-4 text-blue-500 mt-1" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-mono bg-white text-blue-700 px-2 py-1 rounded border border-blue-200">
                                        {question.code}
                                      </span>
                                      <span className="text-xs text-blue-600">
                                        {getQuestionTypeLabel(question.type)}
                                      </span>
                                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                        設問文
                                      </span>
                                      {question.id.startsWith('added_question_') && (
                                        <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded">
                                          追加
                                        </span>
                                      )}
                                      {question.id.startsWith('added_option_question_') && (
                                        <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded">
                                          選択肢から作成
                                        </span>
                                      )}
                                      {question.id.startsWith('option_removed_') && (
                                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                                          選択肢削除
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                      {question.title}
                                    </p>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleRemoveQuestion(question.id)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                                      title="設問を削除"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                              </div>

                              {/* 選択肢（一つひとつ表示） */}
                              {question.options && question.options.length > 0 && (
                                <div className="ml-4 space-y-2">
                                  <div className="text-xs text-blue-600 mb-2 font-medium">選択肢:</div>
                                  {question.options.map((option, optionIndex) => (
                                    <div
                                      key={`${question.id}-option-${optionIndex}`}
                                      className="p-2 border border-blue-200 bg-blue-25 rounded"
                                    >
                                      <div className="flex items-center gap-2">
                                        <GripVertical className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                          {optionIndex + 1}
                                        </span>
                                        <span className="text-sm text-blue-800 flex-1">
                                          {option}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const newOptions = [...question.options!];
                                            newOptions.splice(optionIndex, 1);
                                            const newQuestions = [...baseQuestions];
                                            newQuestions[globalIndex] = {
                                              ...question,
                                              options: newOptions,
                                              id: `option_removed_${question.id}_${Date.now()}`,
                                            };
                                            setBaseQuestions(newQuestions);
                                          }}
                                          className="p-1 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                          title="選択肢を削除"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Drop zone at the end of section */}
                      <div
                        className={`h-8 border-2 border-dashed transition-all rounded flex items-center justify-center text-xs ${
                          dragOverIndex === baseQuestions.length 
                            ? 'border-blue-400 bg-blue-100 text-blue-600' 
                            : 'border-blue-300 text-blue-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                        onDragOver={(e) => handleDragOver(e, baseQuestions.length)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, baseQuestions.length)}
                      >
                        末尾に追加
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-blue-50 border-blue-200 flex justify-between items-center">
          <div className="text-sm text-blue-700">
            作成中の調査票: {baseQuestions.length}件の設問
            {baseQuestions.some(q => q.id.startsWith('added_')) && (
              <span className="ml-2 text-emerald-600 font-medium">（追加済み）</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateSurvey}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              この調査票で作成する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
