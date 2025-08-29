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

type TabType = "title" | "screening" | "main";

// Tab Selection Component
const TabSelectionSection = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabItems = [
    { id: "title" as TabType, label: "タイトル全体" },
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
  const [activeTab, setActiveTab] = useState<TabType>("screening");
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

  // Fetch questions from tRPC
  const { data: sections, isLoading: sectionsLoading } =
    api.question.listBySurvey.useQuery({
      surveyId,
    });

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
    threads?.map((thread) => {
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
  const currentSections = sections.filter((section) =>
    activeTab === "title"
      ? false
      : activeTab === "screening"
        ? section.phase === "SCREENING"
        : section.phase === "MAIN",
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-start relative self-stretch w-full"
    >
      <TabSelectionSection activeTab={activeTab} onTabChange={setActiveTab} />
      <Card className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-[#138FB5] rounded-lg">
        <ScrollArea className="w-full h-[620px] scroll-container">
          <div className="flex flex-col items-start gap-4 relative w-full">
            {activeTab === "title" ? (
              <Card className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]">
                <div className="inline-flex items-start gap-2 relative">
                  <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                    タイトル全体
                  </div>
                </div>
                <Card className="flex flex-col items-center justify-center relative self-stretch w-full bg-white rounded-lg border border-solid border-[#dcdcdc] min-h-[200px]">
                  <p className="text-[#333333] text-base">
                    タイトル全体のコンテンツ
                  </p>
                </Card>
              </Card>
            ) : (
              currentSections.map((section) => (
                <Card
                  key={section.id}
                  className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]"
                >
                  <div className="inline-flex items-start gap-2 relative">
                    <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                      {section.title}
                    </div>
                  </div>

                  {section.questions.map((question) => {
                    // Get threads for this question
                    const questionThreads =
                      threads?.filter(
                        (thread) => thread.questionId === question.id,
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
                        {questionThreads.map((thread) => {
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
                          options={question.options?.map((opt) => ({
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
