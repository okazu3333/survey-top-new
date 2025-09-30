import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const surveyRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    // BigQuery implementation
    const [rows] = await ctx.db.query({
      query: `
        SELECT id, title, purpose, targetCondition, analysisCondition, 
               researchMethod, researchScale, createdAt, updatedAt
        FROM \`viewpers.surveybridge_db.Survey\`
        ORDER BY createdAt DESC
      `,
      location: process.env.BQ_LOCATION || "US",
    });
    return rows;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      // BigQuery implementation
      const [rows] = await ctx.db.query({
        query: `
          SELECT id, title, purpose, targetCondition, analysisCondition, 
                 researchMethod, researchScale, createdAt, updatedAt
          FROM \`viewpers.surveybridge_db.Survey\`
          WHERE id = ${input.id}
        `,
        location: process.env.BQ_LOCATION || "US",
      });
      
      if (rows.length === 0) return null;
      
      // Ensure proper data types for BigQuery results
      const survey = {
        ...rows[0],
        id: Number(rows[0].id),
        title: String(rows[0].title || ''),
        purpose: String(rows[0].purpose || ''),
        targetCondition: String(rows[0].targetCondition || ''),
        analysisCondition: String(rows[0].analysisCondition || ''),
        researchMethod: String(rows[0].researchMethod || ''),
        researchScale: String(rows[0].researchScale || ''),
      };
      
      console.log("Survey.getById processed result:", survey);
      return survey;
    }),

  getByIdWithRelations: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      // BigQuery implementation - simplified version
      // For now, return the same as getById since relations are complex
      const [rows] = await ctx.db.query({
        query: `
          SELECT id, title, purpose, targetCondition, analysisCondition, 
                 researchMethod, researchScale, createdAt, updatedAt
          FROM \`viewpers.surveybridge_db.Survey\`
          WHERE id = ${input.id}
        `,
        location: process.env.BQ_LOCATION || "US",
      });
      
      if (rows.length === 0) return null;
      
      const survey = {
        ...rows[0],
        id: Number(rows[0].id),
        title: String(rows[0].title || ''),
        purpose: String(rows[0].purpose || ''),
        targetCondition: String(rows[0].targetCondition || ''),
        analysisCondition: String(rows[0].analysisCondition || ''),
        researchMethod: String(rows[0].researchMethod || ''),
        researchScale: String(rows[0].researchScale || ''),
        sections: [], // TODO: Implement sections relation
      };
      
      return survey;
    }),

  // create: Disabled - Read-only mode, only reference existing BigQuery data
  // create: publicProcedure...

  // update: Disabled - Read-only mode, only reference existing BigQuery data
  // update: publicProcedure...

  // delete: Disabled - Read-only mode, only reference existing BigQuery data  
  // delete: publicProcedure...
});
