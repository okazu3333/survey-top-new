import { NextResponse } from "next/server";
import { runQuery } from "@survey-poc/api/src/bq";

export async function GET(req: Request) {
	try {
		if (process.env.DB_PROVIDER !== "bigquery") {
			return NextResponse.json({ error: "DB_PROVIDER must be bigquery" }, { status: 400 });
		}
		const { searchParams } = new URL(req.url);
		const project = process.env.BQ_PROJECT_ID || "viewpers";
		const dataset = process.env.BQ_DATASET || "surveybridge_db";
		const location = process.env.BQ_LOCATION || "US";

		const pattern = searchParams.get("pattern");
		const caseType = searchParams.get("caseType"); // normal | abnormal
		const specId = searchParams.get("specId");
		const activeParam = searchParams.get("active");
		const active = activeParam === null ? null : activeParam === "true";

		const conds: string[] = [];
		if (specId) conds.push(`specId = '${specId.replace(/'/g, "\\'")}'`);
		if (pattern) conds.push(`pattern = '${pattern.replace(/'/g, "\\'")}'`);
		if (caseType) conds.push(`caseType = '${caseType.replace(/'/g, "\\'")}'`);
		if (active !== null) conds.push(`isActive = ${active ? "TRUE" : "FALSE"}`);
		const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

		const sql = `
			SELECT specId, pattern, caseType, title, tags, surveySpec, expectations, isActive, createdAt, updatedAt
			FROM \`${project}.${dataset}.TestSpec\`
			${where}
			ORDER BY pattern, caseType
		`;
		const rows = await runQuery<any>(sql, location);

		// Normalize age labels in surveySpec JSON for display if old buckets remain
		const norm = (s: string) =>
			s
				.replaceAll('"18-24"', '"20-29"')
				.replaceAll('"25-34"', '"30-39"')
				.replaceAll('"35-49"', '"40-49"')
				.replaceAll('"50+"', '"50-59"')
				.replaceAll('"60+"', '"60-69"');

		const items = (rows || []).map((r: any) => {
			const out: any = { ...r };
			if (typeof out.surveySpec === "string") {
				out.surveySpec = norm(out.surveySpec);
			}
			return out;
		});

		return NextResponse.json({ items }, { status: 200 });
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
	}
} 