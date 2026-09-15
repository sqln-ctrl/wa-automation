// Keep the application-level values validated at the API boundary and stored
// in the schema's portable text columns.
export const ConversationStatus = {
  BOT: "BOT",
  HUMAN: "HUMAN",
  CLOSED: "CLOSED",
} as const;
export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus];

export const MessageDirection = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
} as const;
export type MessageDirection = (typeof MessageDirection)[keyof typeof MessageDirection];

export const MessageStatus = {
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
  RECEIVED: "RECEIVED",
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const MessageType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  DOCUMENT: "DOCUMENT",
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
  LOCATION: "LOCATION",
  INTERACTIVE_BUTTON: "INTERACTIVE_BUTTON",
  INTERACTIVE_LIST: "INTERACTIVE_LIST",
  TEMPLATE: "TEMPLATE",
  STICKER: "STICKER",
  UNKNOWN: "UNKNOWN",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW",
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
