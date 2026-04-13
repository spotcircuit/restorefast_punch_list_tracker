import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.punchItem.deleteMany();
  await prisma.project.deleteMany();

  await prisma.project.create({
    data: {
      name: "Demo jobsite",
      address: "123 Builder Lane",
      items: {
        create: [
          {
            location: "Unit 204 — Kitchen",
            description: "Drywall patch behind door",
            status: "open",
            priority: "normal",
          },
          {
            location: "Lobby",
            description: "Touch-up paint near elevator",
            status: "in_progress",
            priority: "high",
            assignedTo: "Alex",
          },
        ],
      },
    },
  });
}

main()
  .then(() => {
    console.log("Seed finished.");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
