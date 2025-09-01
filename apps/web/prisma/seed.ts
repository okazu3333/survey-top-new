import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// For PoC simplicity, reuse the same seeding logic as packages/database/prisma/seed.ts
// Trimmed: create minimal seed to verify connectivity
async function main() {
  console.log("🌱 Starting web-local database seed...");

  await prisma.review.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.section.deleteMany();
  await prisma.survey.deleteMany();

  const survey = await prisma.survey.create({
    data: {
      title: "PoC Survey",
      purpose: "PoC local prisma in apps/web",
      targetCondition: "n/a",
      analysisCondition: "n/a",
      researchMethod: "n/a",
      researchScale: "n/a",
      sections: {
        create: [
          {
            phase: "SCREENING",
            order: 1,
            title: "Screening",
            questions: {
              create: [
                {
                  code: "SC1",
                  type: "SA",
                  title: "年齢を教えてください",
                  order: 1,
                  isRequired: true,
                  config: "{}",
                  options: {
                    create: [
                      { code: "1", label: "20代", value: "20s", order: 1 },
                      { code: "2", label: "30代", value: "30s", order: 2 }
                    ]
                  }
                }
              ]
            }
          },
          {
            phase: "MAIN",
            order: 1,
            title: "Main",
            questions: {
              create: [
                {
                  code: "Q1",
                  type: "SA",
                  title: "満足度を教えてください",
                  order: 1,
                  isRequired: true,
                  config: "{}",
                  options: {
                    create: [
                      { code: "1", label: "満足", value: "good", order: 1 },
                      { code: "2", label: "不満", value: "bad", order: 2 }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  await prisma.thread.create({
    data: {
      questionId: (await prisma.question.findFirst({ where: { code: "Q1" } }))!.id,
      x: 10,
      y: 10,
      createdBy: "AIレビュー",
      message: "PoC: 表現の一貫性を確認してください",
      type: "ai"
    }
  });

  console.log("✅ Web local seed done:", survey.id);
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
}); 