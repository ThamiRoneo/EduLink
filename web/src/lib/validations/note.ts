import { z } from "zod"

export const noteUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  institution: z.string().min(1, "Institution is required").max(100),
  course_code: z.string().min(1, "Course code is required").max(50),
  course_name: z.string().min(1, "Course name is required").max(100),
  year: z.string().min(1, "Year is required").max(10),
  tags: z.array(z.string()).optional(),
})

export const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
})

export const reviewSchema = z.object({
  content: z.string().min(1).max(500),
})

export const reportSchema = z.object({
  category: z.enum(["Abuse", "Incorrect/Misleading", "Copyright", "Other"]),
  details: z.string().optional(),
})
