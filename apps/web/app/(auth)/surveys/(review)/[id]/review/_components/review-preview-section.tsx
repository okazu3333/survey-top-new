"use client";

import { MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Comment } from "@/app/(auth)/surveys/(review)/[id]/review/_components/comment";
import { QuestionForm, type QuestionType } from "@/components/question-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/trpc/react";

type ReviewItem = {
  id: number;
  questionNo: string;
  type: string;
  reviewerName: string;
  time: string;
  comment: string;
  status: "unresolved" | "resolved";
  reviewType: "ai" | "team";
  replies?: number;
};

type QuestionFormData = Record<string, string | string[] | undefined>;

type TabType = "share" | "design" | "all" | "screening" | "main";

// Tab Selection Component
const TabSelectionSection = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabItems = [
    { id: "share" as TabType, label: "レビュー共有" },
    { id: "design" as TabType, label: "調査設計" },
    { id: "all" as TabType, label: "調査全体" },
    { id: "screening" as TabType, label: "スクリーニング調査" },
    { id: "main" as TabType, label: "本調査" },
  ];

  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`w-53 h-10 rounded-[8px_8px_0px_0px] px-8 py-2 flex items-center justify-center cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-[#138FB5] text-white font-bold text-base"
                : "bg-white text-[#138FB5] font-medium text-base border-t-2 border-r-2 border-l-2 border-[#138FB5] hover:bg-gray-50"
            }`}
          >
            <span className="text-center leading-6 font-['Noto_Sans_JP']">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

type ReviewPreviewSectionProps = {
  userType?: "reviewer" | "reviewee";
};

export const ReviewPreviewSection = ({
  userType = "reviewee",
}: ReviewPreviewSectionProps) => {
  const params = useParams();
  const surveyId = Number(params.id);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [expandedCommentId, setExpandedCommentId] = useState<number | null>(
    null,
  );
  const [hoveredQuestionId, setHoveredQuestionId] = useState<number | null>(
    null,
  );
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showIcon, setShowIcon] = useState(false);
  const [threadFormOpen, setThreadFormOpen] = useState(false);
  const [threadFormData, setThreadFormData] = useState<{
    questionId: number;
    x: number;
    y: number;
  } | null>(null);
  const [threadMessage, setThreadMessage] = useState("");
  const questionRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { handleSubmit, watch, setValue } = useForm<QuestionFormData>({
    defaultValues: {},
  });

  // Fetch survey overview
  const { data: survey } = api.survey.getById.useQuery({ id: surveyId });

  // Fetch questions from tRPC
  const { data: sections, isLoading: sectionsLoading, refetch } =
    api.question.listBySurvey.useQuery({
      surveyId,
    });

  // Seed dummy questions if none exist
  const seedMutation = api.question.seedForSurvey.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (!sectionsLoading && sections && sections.length > 0) {
      const total = sections.reduce((sum: number, s: any) => sum + (s.questions?.length || 0), 0);
      if (total === 0 && !seedMutation.isPending) {
        seedMutation.mutate({ surveyId });
      }
    }
  }, [sectionsLoading, sections, seedMutation, surveyId, refetch]);

  // Fetch threads from tRPC
  const {
    data: threads,
    isLoading: threadsLoading,
    refetch: refetchThreads,
  } = api.thread.list.useQuery({
    surveyId,
  });

  // Create thread mutation
  const createThreadMutation = api.thread.create.useMutation({
    onSuccess: () => {
      refetchThreads();
      setThreadFormOpen(false);
      setThreadMessage("");
      setThreadFormData(null);
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    console.log("Form submitted:", data);
  };

  const handleCommentIconClick = (e: React.MouseEvent, questionId: number) => {
    const questionEl = questionRefs.current.get(questionId);
    if (!questionEl) return;

    const rect = questionEl.getBoundingClientRect();
    const scrollContainer = questionEl.closest(".scroll-container");
    const containerRect = scrollContainer?.getBoundingClientRect();

    if (!containerRect) return;

    // Calculate position relative to the question element
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setThreadFormData({
      questionId,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
    setThreadFormOpen(true);
  };

  const handleCreateThread = async () => {
    if (!threadFormData || !threadMessage.trim()) return;

    await createThreadMutation.mutateAsync({
      questionId: threadFormData.questionId,
      message: threadMessage,
      type: "team",
      x: threadFormData.x,
      y: threadFormData.y,
      createdBy: userType === "reviewer" ? "レビュアー" : "レビュイー",
    });
  };

  const handleMouseMove = (e: React.MouseEvent, questionId: number) => {
    const questionEl = questionRefs.current.get(questionId);
    if (!questionEl) return;

    const rect = questionEl.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    // Clear existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Show icon immediately on movement
    setShowIcon(true);

    // Hide icon after a short delay if mouse stops moving
    hoverTimeoutRef.current = setTimeout(() => {
      setShowIcon(false);
    }, 1500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Convert threads to ReviewItems format
  const reviewItems: ReviewItem[] =
    threads?.map((thread: any) => {
      // Calculate relative time
      const createdAt = new Date(thread.createdAt);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60),
      );
      let timeAgo = "";
      if (diffInMinutes < 60) {
        timeAgo = `${diffInMinutes}分前`;
      } else if (diffInMinutes < 1440) {
        timeAgo = `${Math.floor(diffInMinutes / 60)}時間前`;
      } else {
        timeAgo = `${Math.floor(diffInMinutes / 1440)}日前`;
      }

      return {
        id: thread.id,
        questionNo: thread.question.code,
        type: thread.type === "ai" ? "AIレビュー" : thread.createdBy,
        reviewerName: thread.createdBy,
        time: timeAgo,
        comment: thread.message,
        status: thread.isCompleted ? "resolved" : "unresolved",
        reviewType: thread.type as "ai" | "team",
        replies: thread.reviews?.length || 0,
      };
    }) || [];

  if (sectionsLoading || threadsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-96 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">質問が設定されていません</p>
      </div>
    );
  }

  // Get current sections based on active tab
  const currentSections = (sections || [])
    .filter((section: any) =>
      activeTab === "all"
        ? true
        : activeTab === "screening"
          ? section.phase === "SCREENING"
          : activeTab === "main"
            ? section.phase === "MAIN"
            : false,
    )
    .sort((a: any, b: any) => {
      if (activeTab !== "all") return 0;
      if (a.phase === b.phase) return 0;
      return a.phase === "SCREENING" ? -1 : 1;
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-start relative self-stretch w-full"
    >
      <TabSelectionSection activeTab={activeTab} onTabChange={setActiveTab} />
      <Card className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-[#138FB5] rounded-lg">
        <ScrollArea className="w-full h-[620px] scroll-container">
          <div className="flex flex-col items-start gap-4 relative w-full">
            {activeTab === "share" && (
              <Card className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]">
                <div className="inline-flex items-start gap-2 relative">
                  <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                    レビュー共有
                  </div>
                </div>
                <Card className="flex flex-col items-center justify-center relative self-stretch w-full bg-white rounded-lg border border-solid border-[#dcdcdc] min-h-[200px]">
                  <p className="text-[#333333] text-base">後ほど実装予定</p>
                </Card>
              </Card>
            )}

            {activeTab === "design" && (
              <Card className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]">
                <div className="inline-flex items-start gap-2 relative">
                  <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                    調査設計（概要 + セクション設定）
                  </div>
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <Card className="p-4 bg-white border border-[#dcdcdc] rounded-lg">
                    <div className="font-bold text-sm text-[#333333] mb-2">概要の設定項目</div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-[#333333]">
                      <div><span className="text-[#666666] mr-2">タイトル</span>{survey?.title || "-"}</div>
                      <div><span className="text-[#666666] mr-2">調査目的</span>{survey?.purpose || "-"}</div>
                      <div className="col-span-2"><span className="text-[#666666] mr-2">調査対象者条件</span>{survey?.targetCondition || "-"}</div>
                      <div className="col-span-2"><span className="text-[#666666] mr-2">分析対象者条件</span>{survey?.analysisCondition || "-"}</div>
                      <div><span className="text-[#666666] mr-2">調査手法</span>{survey?.researchMethod || "-"}</div>
                      <div><span className="text-[#666666] mr-2">調査規模（予算）</span>{survey?.researchScale || "-"}</div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-white border border-[#dcdcdc] rounded-lg">
                    <div className="font-bold text-sm text-[#333333] mb-2">セクションの設定項目</div>
                    <div className="w-full overflow-auto">
                      <table className="min-w-full text-sm text-[#333333]">
                        <thead>
                          <tr className="text-left text-[#666666]">
                            <th className="pr-4 py-1">フェーズ</th>
                            <th className="pr-4 py-1">セクション名</th>
                            <th className="pr-4 py-1">質問数</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(sections as any[]).map((s: any) => (
                            <tr key={s.id}>
                              <td className="pr-4 py-1">{s.phase === "SCREENING" ? "SC" : "Q"}</td>
                              <td className="pr-4 py-1">{s.title}</td>
                              <td className="pr-4 py-1">{s.questions?.length ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </Card>
            )}

            {activeTab !== "design" && activeTab !== "share" && (
              currentSections.map((section: any) => (
                <Card
                  key={section.id}
                  className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]"
                >
                  <div className="inline-flex items-start gap-2 relative">
                    <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                      {section.title}
                      <span className="ml-2 text-[#666666]">(
                        {section.phase === "SCREENING" ? "SC" : "Q"}
                      )</span>
                    </div>
                  </div>

                  {section.questions.map((question: any) => {
                    // Get threads for this question
                    const questionThreads =
                      threads?.filter(
                        (thread: any) => thread.questionId === question.id,
                      ) || [];

                    return (
                      // biome-ignore lint/a11y/useSemanticElements: unexpected reason
                      <div
                        key={question.id}
                        className="w-full relative group"
                        ref={(el) => {
                          if (el) questionRefs.current.set(question.id, el);
                        }}
                        onMouseEnter={() => setHoveredQuestionId(question.id)}
                        onMouseLeave={() => {
                          setHoveredQuestionId(null);
                          setCursorPosition(null);
                          setShowIcon(false);
                          if (hoverTimeoutRef.current) {
                            clearTimeout(hoverTimeoutRef.current);
                          }
                        }}
                        onMouseMove={(e) => handleMouseMove(e, question.id)}
                        role="region"
                        aria-label={`Question ${question.code}`}
                      >
                        {/* Hover comment icon at cursor position */}
                        {hoveredQuestionId === question.id &&
                          userType === "reviewer" &&
                          cursorPosition &&
                          showIcon && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCommentIconClick(e, question.id)
                              }
                              className="absolute p-1.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 border border-gray-200 opacity-90 hover:opacity-100"
                              style={{
                                left: `${cursorPosition.x + 10}px`,
                                top: `${cursorPosition.y - 10}px`,
                                pointerEvents: "auto",
                                transform: "translate(-50%, -50%)",
                              }}
                              aria-label="Add comment"
                            >
                              <MessageCircle className="w-4 h-4 text-[#138FB5]" />
                            </button>
                          )}

                        {/* Display threads as comments positioned on the question */}
                        {questionThreads.map((thread: any) => {
                          const reviewItem = reviewItems.find(
                            (item) => item.id === thread.id,
                          );
                          if (!reviewItem) return null;

                          return (
                            <div
                              key={thread.id}
                              className="absolute"
                              style={{
                                left: `${thread.x}%`,
                                top: `${thread.y}%`,
                                zIndex:
                                  expandedCommentId === thread.id ? 50 : 30,
                              }}
                            >
                              <Comment
                                {...reviewItem}
                                userType={userType}
                                question={question}
                                threadId={thread.id}
                                threadMessage={thread.message}
                                threadCreatedBy={thread.createdBy}
                                threadCreatedAt={thread.createdAt}
                                threadIsCompleted={thread.isCompleted}
                                reviews={thread.reviews}
                                onExpandChange={(id, expanded) => {
                                  setExpandedCommentId(expanded ? id : null);
                                }}
                                onDelete={() => {
                                  setExpandedCommentId(null);
                                  refetchThreads();
                                }}
                                sectionName={section.title}
                                sectionPhase={
                                  section.phase as "SCREENING" | "MAIN"
                                }
                              />
                            </div>
                          );
                        })}

                        {/* Question using QuestionForm component */}
                        <QuestionForm
                          type={question.type as QuestionType}
                          questionNumber={question.code}
                          questionText={question.title}
                          options={question.options?.map((opt: any) => ({
                            id: opt.value,
                            label: opt.label,
                          }))}
                          suffix={question.suffix || undefined}
                          placeholder={
                            question.config
                              ? typeof question.config === "string"
                                ? JSON.parse(question.config).placeholder
                                : (question.config as { placeholder: string })
                                    .placeholder
                              : undefined
                          }
                          isFixed={question.isRequired}
                          isEditable={false}
                          value={watch(question.code)}
                          onValueChange={(value) =>
                            setValue(question.code, value)
                          }
                        />
                      </div>
                    );
                  })}
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Thread Creation Dialog */}
      <Dialog open={threadFormOpen} onOpenChange={setThreadFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新しいスレッドを作成</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Textarea
              placeholder="コメントを入力してください..."
              value={threadMessage}
              onChange={(e) => setThreadMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setThreadFormOpen(false);
                  setThreadMessage("");
                  setThreadFormData(null);
                }}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleCreateThread}
                disabled={
                  !threadMessage.trim() || createThreadMutation.isPending
                }
              >
                {createThreadMutation.isPending ? "作成中..." : "作成"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};
