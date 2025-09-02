"use client";

import { ArrowLeft, Download, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/trpc/react";

export default function ReportPage() {
  const params = useParams();
  const surveyId = Number(params.id);

  const { data: survey, isLoading } = api.survey.getById.useQuery({ id: surveyId });

  const handleDownloadRawData = () => {
    // ローデータのダウンロード処理
    const csvContent = generateRawDataCSV();
    downloadCSV(csvContent, `${survey?.title || 'survey'}_raw_data.csv`);
  };

  const handleDownloadAggregatedData = () => {
    // 集計データのダウンロード処理
    const csvContent = generateAggregatedDataCSV();
    downloadCSV(csvContent, `${survey?.title || 'survey'}_aggregated_data.csv`);
  };

  const generateRawDataCSV = () => {
    // ダミーのローデータを生成
    const headers = ["回答ID", "回答日時", "設問コード", "設問内容", "回答内容"];
    const rows = [
      ["1", "2024-01-15 10:30:00", "SC1", "年齢を教えてください", "20代"],
      ["1", "2024-01-15 10:30:00", "Q1", "満足度を教えてください", "満足"],
      ["2", "2024-01-15 11:15:00", "SC1", "年齢を教えてください", "30代"],
      ["2", "2024-01-15 11:15:00", "Q1", "満足度を教えてください", "不満"],
    ];
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  const generateAggregatedDataCSV = () => {
    // ダミーの集計データを生成
    const headers = ["設問コード", "設問内容", "選択肢", "回答数", "回答率"];
    const rows = [
      ["SC1", "年齢を教えてください", "20代", "1", "50%"],
      ["SC1", "年齢を教えてください", "30代", "1", "50%"],
      ["Q1", "満足度を教えてください", "満足", "1", "50%"],
      ["Q1", "満足度を教えてください", "不満", "1", "50%"],
    ];
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">レポートを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">調査が見つかりません</p>
          <Link href="/surveys">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              TOPに戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/surveys">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                TOPに戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">回答レポート</h1>
              <p className="text-gray-600 mt-1">{survey.title}</p>
            </div>
          </div>
          <Separator />
        </div>

        {/* レポート概要 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              レポート概要
            </CardTitle>
            <CardDescription>
              調査の回答データと集計結果をダウンロードできます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">総回答数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600">設問数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">回答完了率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ダウンロードセクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ローデータ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                ローデータ
              </CardTitle>
              <CardDescription>
                個別回答の詳細データ（CSV形式）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>• 回答ID、回答日時</p>
                  <p>• 設問コード、設問内容</p>
                  <p>• 個別の回答内容</p>
                </div>
                <Button 
                  onClick={handleDownloadRawData}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ローデータをダウンロード
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 集計データ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                集計データ
              </CardTitle>
              <CardDescription>
                選択肢別の集計結果（CSV形式）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>• 設問別の選択肢</p>
                  <p>• 回答数、回答率</p>
                  <p>• 集計用ツール対応形式</p>
                </div>
                <Button 
                  onClick={handleDownloadAggregatedData}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  集計データをダウンロード
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 注意事項 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">注意事項</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• ローデータは個人情報を含む可能性があります。取り扱いにご注意ください。</p>
              <p>• 集計データは統計分析用に最適化されています。</p>
              <p>• データの形式はCSV（UTF-8）です。Excel等で開くことができます。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
