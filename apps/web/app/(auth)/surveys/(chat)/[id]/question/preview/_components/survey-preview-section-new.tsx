"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { QuestionForm, type QuestionType } from "@/components/question-form";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/trpc/react";

type TabType = "items" | "allocation" | "screening" | "main";

type FormData = Record<string, string | string[] | undefined>;

// Tab Selection Component
const TabSelectionSection = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabItems = [
    { id: "items" as TabType, label: "調査項目" },
    { id: "screening" as TabType, label: "SC調査" },
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
            className={`w-auto h-10 rounded-[8px_8px_0px_0px] px-6 py-2 flex items-center justify-center cursor-pointer transition-colors ${
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

export const SurveyPreviewSection = () => {
  const params = useParams();
  const surveyId = Number(params.id);
  const [activeTab, setActiveTab] = useState<TabType>("items");
  const [formValues, setFormValues] = useState<FormData>({});

  // Fetch questions from tRPC
  const { data: sections, isLoading } = api.question.listBySurvey.useQuery({
    surveyId,
  });

  const { handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", { ...formValues, ...data });
  };

  const handleValueChange = (
    questionCode: string,
    value: string | string[],
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [questionCode]: value,
    }));
  };

  if (isLoading) {
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

  // Filter sections based on active tab
  const currentSections = sections.filter((section) => {
    switch (activeTab) {
      case "items":
        return true; // Show all sections for 調査項目
      case "allocation":
        return false; // Will implement allocation logic later
      case "screening":
        return section.phase === "SCREENING";
      case "main":
        return section.phase === "MAIN";
      default:
        return false;
    }
  });

  const renderQuestion = (
    question: any,
    sectionIndex: number,
    questionIndex: number,
  ) => {
    const questionNumber = `${
      activeTab === "screening" || activeTab === "items" ? "SC" : "Q"
    }${sectionIndex * 10 + questionIndex + 1}`;
    const questionCode = question.code;

    // Parse config if it's a string
    const config =
      typeof question.config === "string"
        ? JSON.parse(question.config)
        : question.config || {};

    // Map question type and prepare common props
    const questionType = question.type as QuestionType;

    // Prepare options for SA and MA questions
    const options =
      question.type === "SA" || question.type === "MA"
        ? question.options.map((opt: any) => ({
            id: opt.value,
            label: opt.label,
          }))
        : undefined;

    // Get the appropriate value based on question type
    const value =
      question.type === "MA"
        ? (formValues[questionCode] as string[]) || []
        : (formValues[questionCode] as string);

    return (
      <QuestionForm
        key={question.id}
        type={questionType}
        questionNumber={questionNumber}
        questionText={question.title}
        options={options}
        suffix={question.type === "NU" ? question.suffix : undefined}
        placeholder={question.type === "FA" ? config.placeholder : undefined}
        isFixed={question.isRequired}
        isEditable={false}
        isMultiline={question.type === "FA" && config.rows > 1}
        value={value}
        min={question.type === "NU" ? config.minValue : undefined}
        max={question.type === "NU" ? config.maxValue : undefined}
        onValueChange={(val) => handleValueChange(questionCode, val)}
      />
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-start relative self-stretch w-full"
    >
      <TabSelectionSection activeTab={activeTab} onTabChange={setActiveTab} />
      <Card className="flex flex-col items-start gap-4 p-4 relative self-stretch w-full bg-[#138FB5] rounded-lg">
        <ScrollArea className="w-full h-[620px]">
          <div className="flex flex-col items-start gap-4 relative w-full">
            {activeTab === "items" && (
              <div className="w-full mb-2">
                <h2 className="text-base font-bold text-white">調査項目案</h2>
              </div>
            )}
            {currentSections.map((section, sectionIndex) => (
              <Card
                key={section.id}
                className="flex flex-col items-start gap-4 px-6 py-4 relative self-stretch w-full bg-[#f4f7f9] rounded-lg border border-solid border-[#dcdcdc] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.04)]"
              >
                <div className="inline-flex items-start gap-2 relative">
                  <div className="relative w-fit mt-[-1.00px] font-bold text-[#333333] text-xs leading-6 whitespace-nowrap">
                    {section.title}
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  {section.questions.map(
                    (question: any, questionIndex: number) =>
                      renderQuestion(question, sectionIndex, questionIndex),
                  )}
                </div>
              </Card>
            ))}

            {currentSections.length === 0 && activeTab !== "allocation" && (
              <div className="flex flex-col items-center justify-center w-full h-64">
                <p className="text-white">
                  {activeTab === "items"
                    ? "調査項目がありません"
                    : activeTab === "screening"
                      ? "SC調査の質問がありません"
                      : "本調査の質問がありません"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <Separator
        className="absolute w-1 h-[230px] top-[211px] right-4 bg-[#dcdcdc] rounded"
        orientation="vertical"
      />
    </form>
  );
};
