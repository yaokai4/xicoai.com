import { z } from "zod";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalStr = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

export const applySchema = z.object({
  name: z.string().trim().min(1, "required").max(128),
  email: z.string().trim().max(256).regex(emailRe, "invalid email"),
  phone: optionalStr(64),
  links: optionalStr(1000),
  note: optionalStr(5000),
  jobSlug: optionalStr(128),
  locale: optionalStr(8),
});

export const joinSchema = z.object({
  type: z.enum(["investor", "partner", "collaborator"]),
  name: z.string().trim().min(1, "required").max(128),
  email: z.string().trim().max(256).regex(emailRe, "invalid email"),
  org: optionalStr(256),
  intro: optionalStr(5000),
  links: optionalStr(1000),
  // type-specific
  field1: optionalStr(512),
  field2: optionalStr(512),
  field3: optionalStr(512),
  locale: optionalStr(8),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "required").max(128),
  email: z.string().trim().max(256).regex(emailRe, "invalid email"),
  company: optionalStr(256),
  topic: optionalStr(64),
  message: z.string().trim().min(1, "required").max(5000),
  locale: optionalStr(8),
});

export const waitlistSchema = z.object({
  email: z.string().trim().max(256).regex(emailRe, "invalid email"),
  name: optionalStr(128),
  source: optionalStr(64),
  locale: optionalStr(8),
});

export type ApplyInput = z.infer<typeof applySchema>;
export type JoinInput = z.infer<typeof joinSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type WaitlistInput = z.infer<typeof waitlistSchema>;
