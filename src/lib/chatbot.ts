// Rule-based chatbot engine: matches inbound text against FAQs and AutomationRules
// before (optionally) falling back to the AI engine.
import { prisma } from "@/lib/prisma";
export interface Faq {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: string;
  keywords: string[];
  responseText: string;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotMatch {
  type: "FAQ" | "RULE" | "GREETING" | "HANDOFF" | "NONE";
  responseText: string | null;
  matched?: Faq | AutomationRule;
}

const GREETING_WORDS = ["hi", "hello", "hey", "salam", "assalam", "hallo"];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function containsKeyword(text: string, keywords: string[]): boolean {
  const normalized = normalize(text);
  return keywords.some((k) => normalized.includes(k.toLowerCase()));
}

/** Checks whether the message should be handed over to a human agent. */
export async function shouldHandoff(text: string): Promise<boolean> {
  const settings = await prisma.businessSettings.findUnique({ where: { id: "singleton" } });
  const keywords = settings?.handoffKeywords ?? ["agent", "human", "help"];
  return containsKeyword(text, keywords);
}

/** Attempts to match an inbound message against FAQs, then automation rules, then a greeting. */
export async function matchRuleBasedResponse(text: string): Promise<ChatbotMatch> {
  const normalized = normalize(text);

  if (await shouldHandoff(text)) {
    return { type: "HANDOFF", responseText: null };
  }

  if (GREETING_WORDS.some((w) => normalized === w || normalized.startsWith(`${w} `))) {
    const settings = await prisma.businessSettings.findUnique({ where: { id: "singleton" } });
    return {
      type: "GREETING",
      responseText:
        settings?.welcomeMessage ||
        `Hi! Welcome to ${settings?.businessName ?? "our business"}. How can we help you today?`,
    };
  }

  const faqs = await prisma.faq.findMany({ where: { isActive: true } });
  const matchedFaq = faqs.find((f: Faq) => containsKeyword(normalized, f.keywords.length ? f.keywords : [f.question]));
  if (matchedFaq) {
    return { type: "FAQ", responseText: matchedFaq.answer, matched: matchedFaq };
  }

  const rules = await prisma.automationRule.findMany({
    where: { isActive: true, triggerType: "KEYWORD" },
    orderBy: { priority: "desc" },
  });
  const matchedRule = rules.find((r: AutomationRule) => containsKeyword(normalized, r.keywords));
  if (matchedRule) {
    return { type: "RULE", responseText: matchedRule.responseText, matched: matchedRule };
  }

  const fallback = await prisma.automationRule.findFirst({
    where: { isActive: true, triggerType: "FALLBACK" },
  });
  if (fallback) {
    return { type: "RULE", responseText: fallback.responseText, matched: fallback };
  }

  return { type: "NONE", responseText: null };
}
