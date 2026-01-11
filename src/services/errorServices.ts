import { QueryError } from "@/types/ResponseTypes";

export const normalizeApiErrors = (error?: QueryError): string[] => {
  if (!error?.response?.data) return [];

  const { message } = error.response.data;

  if (Array.isArray(message)) {
    return message;
  }

  const messages = typeof message === "string"
    ? [message]
    : Object.values(message).flat();

  return messages as string[];
};
