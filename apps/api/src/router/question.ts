import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const questionRouter = router({
  listBySurvey: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Optimized BigQuery implementation - Single JOIN query instead of N+1 queries
      const [rows] = await ctx.db.query({
        query: `
          SELECT 
            s.id as section_id, s.surveyId, s.title as section_title, s.phase, s.order as section_order,
            s.createdAt as section_createdAt, s.updatedAt as section_updatedAt,
            q.id as question_id, q.sectionId, q.code as question_code, q.type as question_type, 
            q.title as question_title, q.description, q.isRequired, q.order as question_order, 
            q.config, q.respondentCondition, q.answerControl, q.targetCondition, q.skipCondition, 
            q.displayOrder, q.jumpCondition, q.prefix, q.suffix, q.isActive,
            q.createdAt as question_createdAt, q.updatedAt as question_updatedAt,
            o.id as option_id, o.questionId as option_questionId, o.code as option_code, 
            o.label as option_label, o.value as option_value, o.order as option_order,
            o.createdAt as option_createdAt, o.updatedAt as option_updatedAt
          FROM \`viewpers.surveybridge_db.Section\` s
          LEFT JOIN \`viewpers.surveybridge_db.Question\` q ON s.id = q.sectionId
          LEFT JOIN \`viewpers.surveybridge_db.Option\` o ON q.id = o.questionId
          WHERE s.surveyId = ${input.surveyId}
          ORDER BY s.phase ASC, s.order ASC, q.order ASC, o.order ASC
        `,
        location: process.env.BQ_LOCATION || "US",
      });

      // Group the flattened results back into hierarchical structure
      const sectionsMap = new Map();
      const questionsMap = new Map();

      for (const row of rows) {
        // Process section
        if (!sectionsMap.has(row.section_id)) {
          sectionsMap.set(row.section_id, {
            id: Number(row.section_id),
            surveyId: Number(row.surveyId),
            title: String(row.section_title || ''),
            phase: String(row.phase || ''),
            order: Number(row.section_order),
            createdAt: row.section_createdAt,
            updatedAt: row.section_updatedAt,
            questions: [],
          });
        }

        // Process question
        if (row.question_id && !questionsMap.has(row.question_id)) {
          const question = {
            id: Number(row.question_id),
            sectionId: Number(row.sectionId),
            code: String(row.question_code || ''),
            type: String(row.question_type || ''),
            title: String(row.question_title || ''),
            description: row.description ? String(row.description) : null,
            isRequired: Boolean(row.isRequired),
            order: Number(row.question_order),
            config: row.config ? String(row.config) : '{}',
            respondentCondition: row.respondentCondition,
            answerControl: row.answerControl,
            targetCondition: row.targetCondition,
            skipCondition: row.skipCondition,
            displayOrder: row.displayOrder,
            jumpCondition: row.jumpCondition,
            prefix: row.prefix,
            suffix: row.suffix,
            isActive: row.isActive,
            createdAt: row.question_createdAt,
            updatedAt: row.question_updatedAt,
            options: [],
          };
          
          questionsMap.set(row.question_id, question);
          sectionsMap.get(row.section_id).questions.push(question);
        }

        // Process option
        if (row.option_id) {
          const option = {
            id: Number(row.option_id),
            questionId: Number(row.option_questionId),
            code: String(row.option_code || ''),
            label: String(row.option_label || ''),
            value: String(row.option_value || ''),
            order: Number(row.option_order),
            createdAt: row.option_createdAt,
            updatedAt: row.option_updatedAt,
          };
          
          if (questionsMap.has(row.question_id)) {
            questionsMap.get(row.question_id).options.push(option);
          }
        }
      }

      const sections = Array.from(sectionsMap.values());
      console.log("Question.listBySurvey optimized - sections:", sections.length, "total rows:", rows.length);
      return sections;
    }),

  // create: Disabled - Read-only mode, only reference existing BigQuery data
  // create: publicProcedure...

  // update: Disabled - Read-only mode, only reference existing BigQuery data
  // update: publicProcedure...

  // seedForSurvey: Disabled - Read-only mode, only reference existing BigQuery data
  // seedForSurvey: publicProcedure...
});
