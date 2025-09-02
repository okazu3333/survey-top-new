"use client";

import { FileText, MessageSquare, Plus, Settings, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RespondentAttributesDialog } from "@/components/respondent-attributes-dialog";
import { ReviewUrlDialog } from "@/components/review-url-dialog";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Static mock data
const mockProjects = [
  {
    id: "SRB008",
    numericId: 1,
    title: "家族構成に関する調査",
    status: "作成中",
    statusStyle:
      "border-[#4BBC80] text-[#4BBC80] bg-white hover:bg-white hover:text-[#4BBC80]",
    createdDate: "2025/06/01 09:00",
    updatedDate: "2025/06/05 14:30",
    creator: "山田太郎",
  },
  {
    id: "SRB009",
    numericId: 2,
    title: "購買行動パターン分析",
    status: "レビュー待ち",
    statusStyle:
      "border-[#60ADC2] text-[#60ADC2] bg-white hover:bg-white hover:text-[#60ADC2]",
    createdDate: "2025/06/02 10:00",
    updatedDate: "2025/06/06 15:00",
    creator: "鈴木花子",
  },
  {
    id: "SRB010",
    numericId: 3,
    title: "ブランド認知度調査",
    status: "レビュー完了",
    statusStyle:
      "text-white bg-[#60ADC2] border-[#60ADC2] hover:bg-[#60ADC2] hover:text-white",
    createdDate: "2025/06/03 11:00",
    updatedDate: "2025/06/08 16:30",
    creator: "田中一郎",
  },
  {
    id: "SRB011",
    numericId: 4,
    title: "商品満足度アンケート",
    status: "作成完了",
    statusStyle:
      "text-white bg-[#4BBC80] border-[#4BBC80] hover:bg-[#4BBC80] hover:text-white",
    createdDate: "2025/06/04 08:00",
    updatedDate: "2025/06/09 17:00",
    creator: "佐藤美咲",
  },
  {
    id: "SRB012",
    numericId: 5,
    title: "ライフスタイル実態調査",
    status: "配信中",
    statusStyle:
      "text-white bg-[#D96868] border-[#D96868] hover:bg-[#D96868] hover:text-white",
    createdDate: "2025/06/05 13:00",
    updatedDate: "2025/06/10 18:30",
    creator: "高橋健太",
  },
  {
    id: "SRB013",
    numericId: 6,
    title: "消費者意識調査",
    status: "配信終了",
    statusStyle:
      "text-white bg-[#ABAEB1] border-[#ABAEB1] hover:bg-[#ABAEB1] hover:text-white",
    createdDate: "2025/06/06 14:00",
    updatedDate: "2025/06/11 19:00",
    creator: "山田太郎",
  },
  {
    id: "SRB014",
    numericId: 7,
    title: "メディア接触状況調査",
    status: "作成中",
    statusStyle:
      "border-[#4BBC80] text-[#4BBC80] bg-white hover:bg-white hover:text-[#4BBC80]",
    createdDate: "2025/06/07 15:00",
    updatedDate: "2025/06/12 10:30",
    creator: "鈴木花子",
  },
  {
    id: "SRB015",
    numericId: 8,
    title: "健康意識に関する調査",
    status: "レビュー待ち",
    statusStyle:
      "border-[#60ADC2] text-[#60ADC2] bg-white hover:bg-white hover:text-[#60ADC2]",
    createdDate: "2025/06/08 16:00",
    updatedDate: "2025/06/13 11:00",
    creator: "田中一郎",
  },
  {
    id: "SRB016",
    numericId: 9,
    title: "働き方改革実態調査",
    status: "レビュー完了",
    statusStyle:
      "text-white bg-[#60ADC2] border-[#60ADC2] hover:bg-[#60ADC2] hover:text-white",
    createdDate: "2025/06/09 17:00",
    updatedDate: "2025/06/14 12:30",
    creator: "佐藤美咲",
  },
  {
    id: "SRB017",
    numericId: 10,
    title: "教育に関する意識調査",
    status: "作成完了",
    statusStyle:
      "text-white bg-[#4BBC80] border-[#4BBC80] hover:bg-[#4BBC80] hover:text-white",
    createdDate: "2025/06/10 18:00",
    updatedDate: "2025/06/15 13:00",
    creator: "高橋健太",
  },
  {
    id: "SRB018",
    numericId: 11,
    title: "エンターテインメント嗜好調査",
    status: "配信中",
    statusStyle:
      "text-white bg-[#D96868] border-[#D96868] hover:bg-[#D96868] hover:text-white",
    createdDate: "2025/06/11 19:00",
    updatedDate: "2025/06/16 14:30",
    creator: "山田太郎",
  },
  {
    id: "SRB019",
    numericId: 12,
    title: "食生活実態調査",
    status: "配信終了",
    statusStyle:
      "text-white bg-[#ABAEB1] border-[#ABAEB1] hover:bg-[#ABAEB1] hover:text-white",
    createdDate: "2025/06/12 08:00",
    updatedDate: "2025/06/17 15:00",
    creator: "鈴木花子",
  },
  {
    id: "SRB020",
    numericId: 13,
    title: "住環境満足度調査",
    status: "作成中",
    statusStyle:
      "border-[#4BBC80] text-[#4BBC80] bg-white hover:bg-white hover:text-[#4BBC80]",
    createdDate: "2025/06/13 09:00",
    updatedDate: "2025/06/18 16:30",
    creator: "田中一郎",
  },
  {
    id: "SRB021",
    numericId: 14,
    title: "金融サービス利用実態",
    status: "レビュー待ち",
    statusStyle:
      "border-[#60ADC2] text-[#60ADC2] bg-white hover:bg-white hover:text-[#60ADC2]",
    createdDate: "2025/06/14 10:00",
    updatedDate: "2025/06/19 17:00",
    creator: "佐藤美咲",
  },
  {
    id: "SRB022",
    numericId: 15,
    title: "旅行・レジャー意識調査",
    status: "レビュー完了",
    statusStyle:
      "text-white bg-[#60ADC2] border-[#60ADC2] hover:bg-[#60ADC2] hover:text-white",
    createdDate: "2025/06/15 11:00",
    updatedDate: "2025/06/20 18:30",
    creator: "高橋健太",
  },
  {
    id: "SRB023",
    numericId: 16,
    title: "美容・健康商品利用調査",
    status: "作成完了",
    statusStyle:
      "text-white bg-[#4BBC80] border-[#4BBC80] hover:bg-[#4BBC80] hover:text-white",
    createdDate: "2025/06/16 12:00",
    updatedDate: "2025/06/21 09:00",
    creator: "山田太郎",
  },
  {
    id: "SRB024",
    numericId: 17,
    title: "デジタルサービス利用実態",
    status: "配信中",
    statusStyle:
      "text-white bg-[#D96868] border-[#D96868] hover:bg-[#D96868] hover:text-white",
    createdDate: "2025/06/17 13:00",
    updatedDate: "2025/06/22 10:30",
    creator: "鈴木花子",
  },
  {
    id: "SRB025",
    numericId: 18,
    title: "環境意識に関する調査",
    status: "配信終了",
    statusStyle:
      "text-white bg-[#ABAEB1] border-[#ABAEB1] hover:bg-[#ABAEB1] hover:text-white",
    createdDate: "2025/06/18 14:00",
    updatedDate: "2025/06/23 11:00",
    creator: "田中一郎",
  },
  {
    id: "SRB026",
    numericId: 19,
    title: "地域活性化に関する調査",
    status: "作成中",
    statusStyle:
      "border-[#4BBC80] text-[#4BBC80] bg-white hover:bg-white hover:text-[#4BBC80]",
    createdDate: "2025/06/19 15:00",
    updatedDate: "2025/06/24 12:30",
    creator: "佐藤美咲",
  },
  {
    id: "SRB027",
    numericId: 20,
    title: "スポーツ・運動習慣調査",
    status: "レビュー待ち",
    statusStyle:
      "border-[#60ADC2] text-[#60ADC2] bg-white hover:bg-white hover:text-[#60ADC2]",
    createdDate: "2025/06/20 16:00",
    updatedDate: "2025/06/25 13:00",
    creator: "高橋健太",
  },
  {
    id: "SRB028",
    numericId: 21,
    title: "オンライン学習実態調査",
    status: "レビュー完了",
    statusStyle:
      "text-white bg-[#60ADC2] border-[#60ADC2] hover:bg-[#60ADC2] hover:text-white",
    createdDate: "2025/06/21 17:00",
    updatedDate: "2025/06/26 14:30",
    creator: "山田太郎",
  },
  {
    id: "SRB029",
    numericId: 22,
    title: "在宅ワーク環境調査",
    status: "作成完了",
    statusStyle:
      "text-white bg-[#4BBC80] border-[#4BBC80] hover:bg-[#4BBC80] hover:text-white",
    createdDate: "2025/06/22 18:00",
    updatedDate: "2025/06/27 15:00",
    creator: "鈴木花子",
  },
  {
    id: "SRB030",
    numericId: 23,
    title: "高齢者生活実態調査",
    status: "配信中",
    statusStyle:
      "text-white bg-[#D96868] border-[#D96868] hover:bg-[#D96868] hover:text-white",
    createdDate: "2025/06/23 08:00",
    updatedDate: "2025/06/28 16:30",
    creator: "田中一郎",
  },
  {
    id: "SRB031",
    numericId: 24,
    title: "子育て支援ニーズ調査",
    status: "配信終了",
    statusStyle:
      "text-white bg-[#ABAEB1] border-[#ABAEB1] hover:bg-[#ABAEB1] hover:text-white",
    createdDate: "2025/06/24 09:00",
    updatedDate: "2025/06/29 17:00",
    creator: "佐藤美咲",
  },
  {
    id: "SRB032",
    numericId: 25,
    title: "防災意識実態調査",
    status: "作成中",
    statusStyle:
      "border-[#4BBC80] text-[#4BBC80] bg-white hover:bg-white hover:text-[#4BBC80]",
    createdDate: "2025/06/25 10:00",
    updatedDate: "2025/06/30 18:30",
    creator: "高橋健太",
  },
];

const ITEMS_PER_PAGE = 10;

export default function SurveysPage() {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number>(1);
  const [respondentDialogOpen, setRespondentDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    title: string;
  } | null>(null);



  // Use static mock data
  const allProjects = mockProjects;

  // Calculate pagination
  const totalPages = Math.ceil(allProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = allProjects.slice(startIndex, endIndex);


  const handleRowClick = (numericId: number, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.closest("button")) {
      return;
    }
    router.push(`/surveys/${numericId}/question/preview`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">調査一覧</h1>
          <Button 
            onClick={() => router.push('/surveys/assistant')}
            className="bg-[#138fb5] hover:bg-[#0f7a9e]"
          >
            <Plus className="w-4 h-4 mr-1" />
            新規調査作成
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#75bacf] hover:bg-[#75bacf]">
                    <TableHead className="text-white">調査コード</TableHead>
                    <TableHead className="text-white">調査タイトル</TableHead>
                    <TableHead className="text-white">ステータス</TableHead>
                    <TableHead className="text-white">作成日時</TableHead>
                    <TableHead className="text-white">更新日時</TableHead>
                    <TableHead className="text-white">作成者</TableHead>
                    <TableHead className="text-white text-center whitespace-nowrap">
                      レビューリンク
                    </TableHead>
                    <TableHead className="text-white text-center whitespace-nowrap">
                      回答画面
                    </TableHead>
                    <TableHead className="text-white text-center whitespace-nowrap">
                      配信
                    </TableHead>
                    <TableHead className="text-white text-center whitespace-nowrap">
                      レポート
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProjects.map((project) => {
                    return (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={(e) => handleRowClick(project.numericId, e)}
                      >
                        <TableCell className="font-medium">
                          {project.id}
                        </TableCell>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${project.statusStyle} rounded-[4px]`}
                            style={{ transition: "none" }}
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {project.createdDate}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {project.updatedDate}
                        </TableCell>
                        <TableCell>{project.creator}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSurveyId(project.numericId);
                              setReviewDialogOpen(true);
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject({
                                id: project.id,
                                title: project.title,
                              });
                              setRespondentDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open("/non-existent-page", "_blank");
                            }}
                            title="配信設定を開く"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/surveys/${project.numericId}/report`);
                            }}
                            title="レポートページを開く"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1)
                            handlePageChange(currentPage - 1);
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNumber = i + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNumber);
                              }}
                              isActive={pageNumber === currentPage}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <PaginationEllipsis key={pageNumber} />;
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            handlePageChange(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <ReviewUrlDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        surveyId={selectedSurveyId}
      />
      {selectedProject && (
        <RespondentAttributesDialog
          open={respondentDialogOpen}
          onOpenChange={setRespondentDialogOpen}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
        />
      )}


    </div>
  );
}
