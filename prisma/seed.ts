// Seeds initial business settings, an admin user, sample FAQs, and services.
// Run with: npm run db:seed
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
      handoffKeywords: ["agent", "human", "help", "speak to someone"],
    },
  });

  const passwordHash = await bcrypt.hash("changeme123", 10);
  await prisma.adminUser.upsert({
    where: { email: "owner@business.com" },
    update: {},
    create: { email: "owner@business.com", passwordHash, name: "Business Owner" },
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "What are your business hours?",
        answer: "We're open Monday to Saturday, 9 AM to 7 PM.",
        keywords: ["hours", "open", "timing", "time"],
      },
      {
        question: "Where are you located?",
        answer: "Please share your city and we'll send you our nearest branch details.",
        keywords: ["location", "address", "where"],
      },
    ],
    skipDuplicates: true,
  });

  await prisma.service.createMany({
    data: [
      { name: "Consultation", description: "30-minute consultation", durationMin: 30, isBookable: true, price: 20 },
      { name: "Standard Service", description: "Our most popular offering", durationMin: 60, isBookable: true, price: 50 },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete. Admin login: owner@business.com / changeme123 (change immediately).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
