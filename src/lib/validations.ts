import { z } from "zod";

// Community form validations
export const topicSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(100, "Slug must be less than 100 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  guestName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional(),
});

export const questionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title must be less than 200 characters"),
  body: z.string().min(20, "Question must be at least 20 characters").max(2000, "Question must be less than 2000 characters"),
  isAnonymous: z.boolean().optional().default(false),
  guestName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional(),
});

export const answerSchema = z.object({
  body: z.string().min(10, "Answer must be at least 10 characters").max(2000, "Answer must be less than 2000 characters"),
  guestName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional(),
});

export type TopicFormData = z.infer<typeof topicSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type AnswerFormData = z.infer<typeof answerSchema>;