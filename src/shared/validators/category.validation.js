import { z } from "zod";

export const storeCategorySchema = z.object({
  categoryName: z
    .string({ required_error: "Category name is required" })
    .min(3, "Category name must be at least 3 characters long")
    .max(100, "Category name cannot exceed 100 characters")
    .trim(),

  categoryType: z.enum(["Store", "Factory"], {
    required_error: "Category type is required",
    invalid_type_error: "Category type must be either 'Store' or 'Factory'",
  }),
});
