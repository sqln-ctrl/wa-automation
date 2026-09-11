// Seeds initial business settings, an admin user, sample FAQs, and services.
// Kept as plain ESM so seeding does not depend on tsx's temp-directory lookup.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.businessSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "My Business",
      welcomeMessage: "Hi! Welcome to My Business. How can we help you today?",
      handoffKeywords: JSON.stringify(["agent", "human", "help", "speak to someone"]),
    },
  });

  const passwordHash = await bcrypt.hash("changeme123", 10);
  await prisma.adminUser.upsert({
    where: { email: "owner@business.com" },
    update: {},
    create: { email: "owner@business.com", passwordHash, name: "Business Owner" },
  });

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: "What are your business hours?",
          answer: "We're open Monday to Saturday, 9 AM to 7 PM.",
          keywords: JSON.stringify(["hours", "open", "timing", "time"]),
        },
        {
          question: "Where are you located?",
          answer: "Please share your city and we'll send you our nearest branch details.",
          keywords: JSON.stringify(["location", "address", "where"]),
        },
      ],
    });
  }

  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: [
        { name: "Consultation", description: "30-minute consultation", durationMin: 30, isBookable: true, price: 20 },
        { name: "Standard Service", description: "Our most popular offering", durationMin: 60, isBookable: true, price: 50 },
      ],
    });
  }

  console.log("Seed complete. Admin login: owner@business.com / changeme123 (change immediately).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
