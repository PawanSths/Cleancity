import { z } from "zod";

export const complaintSchema = z.object({
  title: z.string().trim().min(6, "Use a clear title.").max(120),
  description: z.string().trim().min(12, "Describe the issue briefly.").max(1000),
  category: z.enum(["garbage", "pothole", "drainage", "sewage", "graffiti", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(180).optional().or(z.literal("")),
  aiSummary: z.string().trim().max(600).optional().or(z.literal("")),
  aiConfidence: z.coerce.number().min(0).max(1).optional(),
  aiSpamScore: z.coerce.number().min(0).max(1).optional(),
  anonymous: z.coerce.boolean().default(false),
});

export const statusUpdateSchema = z.object({
  complaintId: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "resolved"]),
});

export const assignmentSchema = z.object({
  complaintId: z.string().uuid(),
  staffId: z.string().uuid().nullable().optional(),
});
