import { db } from "@survey-poc/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const threadRouter = router({
  // surveyIdを元にスレッド一覧を取得
  list: publicProcedure
    .input(
      z.object({
        surveyId: z.number(),
        type: z.string().optional(),
        isCompleted: z.boolean().nullable().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where: {
        question: {
          section: {
            surveyId: number;
          };
        };
        type?: string;
        isCompleted?: boolean;
      } = {
        question: {
          section: {
            surveyId: input.surveyId,
          },
        },
      };

      // typeでフィルタリング
      if (input.type !== undefined) {
        where.type = input.type;
      }

      // isCompletedでフィルタリング（nullでない場合のみ）
      if (input.isCompleted !== null && input.isCompleted !== undefined) {
        where.isCompleted = input.isCompleted;
      }

      const threads = await db.thread.findMany({
        where,
        include: {
          question: {
            select: {
              id: true,
              code: true,
              title: true,
            },
          },
          reviews: {
            select: {
              id: true,
              message: true,
              createdBy: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return threads;
    }),

  // スレッドを作成
  create: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        x: z.number(),
        y: z.number(),
        message: z.string(),
        createdBy: z.string(),
        type: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const thread = await db.thread.create({
        data: {
          questionId: input.questionId,
          x: input.x,
          y: input.y,
          message: input.message,
          createdBy: input.createdBy,
          type: input.type,
        },
      });

      return thread;
    }),

  // スレッドを取得
  get: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const thread = await db.thread.findUnique({
        where: {
          id: input.id,
        },
        include: {
          question: true,
          reviews: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!thread) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found",
        });
      }

      return thread;
    }),

  // スレッドを更新
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          message: z.string().optional(),
          isCompleted: z.boolean().optional(),
          type: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const thread = await db.thread.update({
        where: {
          id: input.id,
        },
        data: input.data,
      });

      return thread;
    }),

  // スレッドを削除
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const thread = await db.thread.delete({
        where: {
          id: input.id,
        },
      });

      return thread;
    }),
});
