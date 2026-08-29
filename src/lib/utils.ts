import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normalizes a phone number to WhatsApp's wa_id format (digits only, no leading +). */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function formatCurrency(amount: number | string, currency = "USD"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function truncate(text: string, length = 60): string {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}
