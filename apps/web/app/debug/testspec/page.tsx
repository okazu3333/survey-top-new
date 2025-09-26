"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TestSpecItem = {
  specId: string;
  pattern: string;
  caseType: string; // normal | abnormal
  title?: string | null;
  tags?: string[] | null;
  surveySpec: any;
  expectations?: any;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function TestSpecViewerPage() {
  const [pattern, setPattern] = useState("P1");
  const [caseType, setCaseType] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<TestSpecItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [conditions, setConditions] = useState<string>(
    JSON.stringify(
      {
        title: "",
        purpose: "",
        targetCondition: "",
        analysisCondition: "",
        screeningQuestionCount: 0,
        mainQuestionCount: 0,
      },
      null,
      2,
    ),
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ pattern, caseType, active: "true" });
      const res = await fetch(`/api/testspec?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json.items || []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, caseType]);

  const spec = useMemo(
    () => (items && items.length > 0 ? items[0] : null),
    [items],
  );
  // BigQuery JSON型が文字列で返る場合に備えてパース
  const parsedSurveySpec = useMemo(() => {
    if (!spec) return null;
    const v = spec.surveySpec;
    if (v && typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    }
    return v || null;
  }, [spec]);

  const parsedExpectations = useMemo(() => {
    if (!spec) return null;
    const v = (spec as any).expectations;
    if (v && typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    }
    return v || null;
  }, [spec]);

  // SC/本調査の設問数を算出して基本条件を自動充填
  useEffect(() => {
    if (!parsedSurveySpec && !spec) return;
    const sections = (parsedSurveySpec?.sections || []) as any[];
    const sc = sections.find((s) => String(s.title).includes("スクリーニング"));
    const main = sections.find((s) => String(s.title).includes("本調査"));
    const computedScCount = Array.isArray(sc?.questions)
      ? sc.questions.length
      : 0;
    const computedMainCount = Array.isArray(main?.questions)
      ? main.questions.length
      : 0;

    const basic = (parsedExpectations?.basic || {}) as any;
    const payload = {
      title: basic.title || parsedSurveySpec?.surveyTitle || spec?.title || "",
      purpose: basic.purpose || "",
      targetCondition: Array.isArray(basic.targetConditions)
        ? basic.targetConditions.join(" / ")
        : "",
      analysisCondition: Array.isArray(basic.analysisTargets)
        ? basic.analysisTargets.join(" / ")
        : "",
      screeningQuestionCount: basic.screeningQuestionCount ?? computedScCount,
      mainQuestionCount: basic.mainQuestionCount ?? computedMainCount,
    };
    setConditions(JSON.stringify(payload, null, 2));
  }, [parsedSurveySpec, parsedExpectations, spec]);

  const surveySpec = parsedSurveySpec || {};

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Select value={pattern} onValueChange={setPattern}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Pattern" />
          </SelectTrigger>
          <SelectContent>
            {["P1", "P2", "P3", "P4", "P5"].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={caseType} onValueChange={setCaseType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Case" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">normal</SelectItem>
            <SelectItem value="abnormal">abnormal</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          再取得
        </Button>
        {spec ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{spec.specId}</Badge>
            {spec.isActive ? (
              <Badge>active</Badge>
            ) : (
              <Badge variant="outline">inactive</Badge>
            )}
          </div>
        ) : null}
      </div>

      {error ? <div className="text-red-600 text-sm">{error}</div> : null}

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-4 p-3 space-y-2">
          <div className="font-semibold">基本条件（JSON）</div>
          <Textarea
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            className="min-h-[260px] font-mono text-xs"
          />
          <div className="text-xs text-muted-foreground">
            調査タイトル／目的／対象者条件／分析対象者条件／SC/本調査の設問数
          </div>
        </Card>

        <Card className="col-span-8 p-3">
          <div className="font-semibold mb-2">設問プレビュー</div>
          {loading ? (
            <div className="text-sm text-muted-foreground">読み込み中...</div>
          ) : !spec ? (
            <div className="text-sm text-muted-foreground">
              該当データがありません
            </div>
          ) : (
            <ScrollArea className="h-[520px] pr-3">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {surveySpec?.surveyTitle || spec.title}
                </div>
                {(surveySpec?.sections || []).map((sec: any, si: number) => (
                  <div key={si} className="border rounded p-3">
                    <div className="font-medium mb-2">{sec.title}</div>
                    <div className="space-y-2">
                      {(sec.questions || []).map((q: any, qi: number) => (
                        <div key={qi} className="text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{q.type}</Badge>
                            <div className="font-medium">
                              [{q.code}] {q.title}
                            </div>
                          </div>
                          {Array.isArray(q.options) && q.options.length > 0 && (
                            <ul className="list-disc pl-6 mt-1 text-muted-foreground">
                              {q.options.map((o: any, oi: number) => (
                                <li key={oi}>
                                  [{o.code}] {o.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>

      <Card className="p-3">
        <div className="font-semibold mb-2">期待ルール（expectations）</div>
        <pre className="whitespace-pre-wrap break-words text-xs bg-muted/30 p-2 rounded">
          {JSON.stringify(spec?.expectations || {}, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
