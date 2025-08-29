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
        config: z.record(z.any()).optional(),
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
        config: z.record(z.any()).optional(),
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
              id: z.number().optional(),
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
      const { id, config, options, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };

      if (config) {
        updateData.config = JSON.stringify(config);
      }

      // Update question
      await ctx.db.question.update({
        where: { id },
        data: updateData,
        include: {
          options: true,
        },
      });

      // Update options if provided
      if (options) {
        // Delete all existing options first to avoid order conflicts
        await ctx.db.option.deleteMany({
          where: { questionId: id },
        });

        // Create all options fresh with new order
        if (options.length > 0) {
          await ctx.db.option.createMany({
            data: options.map((opt) => ({
              questionId: id,
              code: opt.code,
              label: opt.label,
              value: opt.value,
              order: opt.order,
            })),
          });
        }
      }

      // Return updated question with options
      return await ctx.db.question.findUnique({
        where: { id },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const question = await ctx.db.question.delete({
        where: { id: input.id },
      });
      return question;
    }),
});
