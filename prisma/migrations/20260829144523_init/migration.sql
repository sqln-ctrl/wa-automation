-- Initial local SQLite schema. JSON-like values are stored as JSON text.
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY, "waId" TEXT NOT NULL, "name" TEXT,
    "profileName" TEXT, "email" TEXT, "notes" TEXT, "tags" TEXT NOT NULL DEFAULT '[]',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOT' CHECK ("status" IN ('BOT', 'HUMAN', 'CLOSED')),
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY, "conversationId" TEXT NOT NULL, "whatsappMsgId" TEXT,
    "direction" TEXT NOT NULL CHECK ("direction" IN ('INBOUND', 'OUTBOUND')),
    "type" TEXT NOT NULL DEFAULT 'TEXT' CHECK ("type" IN ('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'VIDEO', 'LOCATION', 'INTERACTIVE_BUTTON', 'INTERACTIVE_LIST', 'TEMPLATE', 'STICKER', 'UNKNOWN')),
    "content" TEXT NOT NULL, "rawPayload" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT' CHECK ("status" IN ('SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED')), "isFromBot" BOOLEAN NOT NULL DEFAULT false,
    "isFromAi" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "price" DECIMAL,
    "durationMin" INTEGER, "isActive" BOOLEAN NOT NULL DEFAULT true, "isBookable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Faq" (
    "id" TEXT NOT NULL PRIMARY KEY, "question" TEXT NOT NULL, "answer" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]', "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "serviceId" TEXT,
    "scheduledAt" DATETIME NOT NULL, "durationMin" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')), "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "triggerType" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]', "responseText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true, "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton', "businessName" TEXT NOT NULL DEFAULT 'My Business',
    "businessHours" TEXT, "welcomeMessage" TEXT, "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiSystemPrompt" TEXT, "handoffKeywords" TEXT NOT NULL DEFAULT '["agent", "human", "help"]',
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
    "name" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Customer_waId_key" ON "Customer"("waId");
CREATE INDEX "Customer_waId_idx" ON "Customer"("waId");
CREATE INDEX "Conversation_customerId_idx" ON "Conversation"("customerId");
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");
CREATE UNIQUE INDEX "Message_whatsappMsgId_key" ON "Message"("whatsappMsgId");
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX "Message_whatsappMsgId_idx" ON "Message"("whatsappMsgId");
CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
