import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const questionRouter = router({
  listBySurvey: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .query(async ({ input, ctx }) => {
      const sections = await ctx.db.section.findMany({
        where: { surveyId: input.surveyId },
        orderBy: [{ phase: "asc" }, { order: "asc" }],
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
      return sections;
    }),

  create: publicProcedure
    .input(
      z.object({
        sectionId: z.number(),
        code: z.string(),
        type: z.enum(["SA", "MA", "NUM", "FA"]),
        title: z.string(),
        description: z.string().optional(),
        isRequired: z.boolean().optional(),
        order: z.number().optional(),
        config: z.record(z.string(), z.any()).optional(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        respondentCondition: z.string().optional(),
        answerControl: z.string().optional(),
        targetCondition: z.string().optional(),
        skipCondition: z.string().optional(),
        displayOrder: z.string().optional(),
        jumpCondition: z.string().optional(),
        options: z
          .array(
            z.object({
              code: z.string(),
              label: z.string(),
              value: z.string(),
              order: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { options, config, ...questionData } = input;

      // orderが指定されていない場合は、最大order + 1を設定
      let order = questionData.order;
      if (order === undefined) {
        const maxOrderQuestion = await ctx.db.question.findFirst({
          where: { sectionId: input.sectionId },
          orderBy: { order: "desc" },
        });
        order = (maxOrderQuestion?.order ?? 0) + 1;
      }

      const question = await ctx.db.question.create({
        data: {
          ...questionData,
          order,
          config: config ? JSON.stringify(config) : "{}",
        },
      });

      // 選択肢を作成（SA/MA の場合）
      if (options && options.length > 0) {
        await ctx.db.option.createMany({
          data: options.map((opt) => ({
            questionId: question.id,
            ...opt,
          })),
        });
      }

      return question;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        code: z.string().optional(),
        type: z.enum(["SA", "MA", "NUM", "FA"]).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        isRequired: z.boolean().optional(),
        order: z.number().optional(),
        config: z.record(z.string(), z.any()).optional(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        respondentCondition: z.string().optional(),
        answerControl: z.string().optional(),
        targetCondition: z.string().optional(),
        skipCondition: z.string().optional(),
        displayOrder: z.string().optional(),
        jumpCondition: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, config, ...data } = input;
      const question = await ctx.db.question.update({
        where: { id },
        data: {
          ...data,
          config: config ? JSON.stringify(config) : undefined,
        },
      });
      return question;
    }),

  // ダミー設問をセクション毎に生成（既に質問があるセクションはスキップ）
  seedForSurvey: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const sections = await ctx.db.section.findMany({
        where: { surveyId: input.surveyId },
        orderBy: [{ phase: "asc" }, { order: "asc" }],
        include: { questions: true },
      });

      for (const section of sections) {
        if ((section.questions?.length || 0) > 0) continue;

        const baseCode = section.phase === "SCREENING" ? "SC" : "Q";
        const titles = [
          `${section.title}についての質問1`,
          `${section.title}についての質問2`,
          `${section.title}についての質問3`,
        ];

        for (let i = 0; i < titles.length; i++) {
          const q = await ctx.db.question.create({
            data: {
              sectionId: section.id,
              code: `${baseCode}${section.order * 10 + i + 1}`,
              type: i === 1 ? "MA" : "SA",
              title: titles[i],
              isRequired: i === 0,
              order: i + 1,
              config: "{}",
            },
          });

          // SA/MA の場合は選択肢を作成
          await ctx.db.option.createMany({
            data: [1, 2, 3, 4].map((n) => ({
              questionId: q.id,
              code: `O${n}`,
              label: `選択肢${n}`,
              value: `opt_${n}`,
              order: n,
            })),
          });
        }
      }

      return { ok: true };
    }),
});
