import { PrismaClient } from "@prisma/client";

const jsonFields: Record<string, readonly string[]> = {
  customer: ["tags"],
  message: ["rawPayload"],
  faq: ["keywords"],
  automationrule: ["keywords"],
  businesssettings: ["businessHours", "handoffKeywords"],
};

function serializeJsonFields(model: string | undefined, value: unknown): unknown {
  if (!model || !value || typeof value !== "object" || Array.isArray(value)) return value;

  const fields = jsonFields[model.toLowerCase()] ?? [];
  const data = { ...(value as Record<string, unknown>) };
  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== "string") {
      data[field] = JSON.stringify(data[field]);
    }
  }
  return data;
}

function serializeOperationArgs(model: string | undefined, args: Record<string, unknown>) {
  const next = { ...args };
  for (const key of ["data", "create", "update"] as const) {
    const value = next[key];
    next[key] = Array.isArray(value)
      ? value.map((item) => serializeJsonFields(model, item))
      : serializeJsonFields(model, value);
  }
  return next;
}

function deserializeJsonFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deserializeJsonFields);
  if (!value || typeof value !== "object") return value;
  if (value instanceof Date) return value;

  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(record)) {
    if (
      ["tags", "keywords", "rawPayload", "businessHours", "handoffKeywords"].includes(key) &&
      typeof child === "string"
    ) {
      try {
        next[key] = JSON.parse(child);
        continue;
      } catch {
        // Existing plain-text values remain readable if a database was edited manually.
      }
    }
    next[key] = deserializeJsonFields(child);
  }
  return next;
}

// Prevent creating multiple Prisma Client instances in dev (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const client =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;

/**
 * SQLite has no JSON or array column types. This keeps the original model
 * shapes while storing those values as JSON text in the local database.
 */
export const prisma: any = client.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, args, query }) {
        const result = await query(serializeOperationArgs(model, args as Record<string, unknown>) as never);
        return deserializeJsonFields(result) as never;
      },
    },
  },
});
