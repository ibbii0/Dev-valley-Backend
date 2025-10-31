import { z } from "zod";

// 🏭 Create Factory Validation
export const createFactorySchema = z.object({
  factoryName: z
    .string({ required_error: "Factory name is required" })
    .min(3, "Factory name must be at least 3 characters")
    .max(100, "Factory name cannot exceed 100 characters"),

  factoryDescription: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  factoryCoverImage: z
    .string()
    .url("Factory cover image must be a valid URL")
    .optional(),

  factoryLogo: z
    .string()
    .url("Factory logo must be a valid URL")
    .optional(),

  factoryLicenseNumber: z
    .string()
    .max(50, "License number cannot exceed 50 characters")
    .optional()
    .nullable(),

  factoryLicenseImage: z
    .string()
    .url("License image must be a valid URL")
    .optional(),

  idCardNumber: z
    .string()
    .max(20, "ID card number cannot exceed 20 characters")
    .optional(),

  factoryCategoryId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid category ID format")
    .optional()
    .nullable(),
});

// 🏭 Update Factory Validation
export const updateFactorySchema = z.object({
  factoryName: z
    .string()
    .min(3, "Factory name must be at least 3 characters")
    .max(100, "Factory name cannot exceed 100 characters")
    .optional(),

  factoryDescription: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  factoryCoverImage: z
    .string()
    .url("Factory cover image must be a valid URL")
    .optional(),

  factoryLogo: z
    .string()
    .url("Factory logo must be a valid URL")
    .optional(),

  factoryLicenseNumber: z
    .string()
    .max(50, "License number cannot exceed 50 characters")
    .optional()
    .nullable(),

  factoryLicenseImage: z
    .string()
    .url("License image must be a valid URL")
    .optional(),

  idCardNumber: z
    .string()
    .max(20, "ID card number cannot exceed 20 characters")
    .optional(),

  factoryCategoryId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid category ID format")
    .optional()
    .nullable(),

  factoryStatus: z.enum(["pending", "approved", "rejected"]).optional(),
});


// 🏭 Create Factory Product Category Validation
export const factoryProductCategorySchema = z.object({
  factoryProductCategoryName: z
    .string({ required_error: "Factory product category name is required" })
    .trim()
    .min(2, "Category name must be at least 2 characters long")
    .max(100, "Category name cannot exceed 100 characters"),

  factoryProductCategoryLogo: z
    .string()
    .url("Category logo must be a valid URL")
    .optional(),
});

// 🛠️ Update Factory Product Category Validation
export const updateFactoryProductCategorySchema = z.object({
  factoryProductCategoryName: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters long")
    .max(100, "Category name cannot exceed 100 characters")
    .optional(),

  factoryProductCategoryLogo: z
    .string()
    .url("Category logo must be a valid URL")
    .optional(),
});


// Create Factory Product Validation
export const factoryProductSchema = z.object({
  factoryProductName: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),
  factoryProductDescription: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  factoryProductImage: z
    .string()
    .url("Product image must be a valid URL")
    .optional(),
  factoryMinOrderUnits: z
    .preprocess((val) => Number(val), z.number().int("Must be integer").min(1, "Minimum 1 unit"))
    .optional(),
  factoryProductStatus: z
    .enum(["live", "pending"])
    .optional()
    .default("pending"),
  factoryProductReviewId: z.string().optional(),
  factoryProductFeedbackId: z.string().optional(),
  productCategoryId: z.string().optional(), // ✅ Added category
});

// Update Factory Product Validation
export const updateFactoryProductSchema = z.object({
  factoryProductName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .optional(),
  factoryProductDescription: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  factoryProductImage: z
    .string()
    .url("Product image must be a valid URL")
    .optional(),
  factoryMinOrderUnits: z
    .number()
    .int("Must be integer")
    .min(1, "Minimum 1 unit")
    .optional(),
  factoryProductStatus: z
    .enum(["live", "pending"])
    .optional(),
  factoryProductReviewId: z.string().optional(),
  factoryProductFeedbackId: z.string().optional(),
  productCategoryId: z.string().optional(), 
});
//factory feedback validation
export const factoryFeedbackValidation = z.object({
  factoryFeedback: z
    .string()
    .min(5, "Feedback must be at least 5 characters long"),
  factoryId: z.string().min(1, "Factory ID is required"), // only this required from body
});

//factory product feedback validation
export const factoryProductFeedbackValidation = z.object({
  factoryProductId: z.string().min(1, "Factory Product ID is required"),
  factoryId: z.string().min(1, "Factory ID is required"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters long")
    .max(500, "Description too long"),
});
// ✅ Create factory product review validation
export const createFactoryProductReviewSchema = z.object({
  factoryProductId: z.string({
    required_error: "Factory Product ID is required",
  }),
  factoryProductRating: z
    .number({
      required_error: "Rating is required",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
});

// ✅ Update factory product review validation
export const updateFactoryProductReviewSchema = z.object({
  factoryProductRating: z
    .number({
      required_error: "Rating is required",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
});
// ------------------ Factory Order Validation ------------------

export const factoryOrderValidation = z.object({
  shippingAddress: z
    .string({ required_error: "Shipping address is required" })
    .min(5, "Shipping address is too short"),
  products: z
    .array(
      z.object({
        factoryProductId: z.string({ required_error: "Product ID is required" }),
        quantity: z
          .number({ required_error: "Quantity is required" })
          .min(1, "Quantity must be at least 1")
          .default(1),
        price: z
          .number({ required_error: "Price is required" })
          .min(0, "Price must be positive"),
      })
    )
    .min(1, "At least one product is required"),
});

// ------------------ Factory Transaction Validation ------------------
export const factoryTransactionSchema = z.object({
  orderId: z.string({ required_error: "Order ID is required" }),
  cardNumber: z.string({ required_error: "Card number is required" }),
  cardUserName: z.string({ required_error: "Card holder name is required" }),
  cardExpiryDate: z.string({ required_error: "Card expiry date is required" }),
  cvcNumber: z.string({ required_error: "CVC is required" }),
  transactionStatus: z.enum(["successful", "failed"]).default("failed"),
  amount: z.number().optional(), // will be taken from order automatically
});