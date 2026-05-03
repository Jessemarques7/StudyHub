import DOMPurify from "dompurify";

export const sanitize = (html: string): string =>
  typeof window !== "undefined" ? DOMPurify.sanitize(html) : html;
