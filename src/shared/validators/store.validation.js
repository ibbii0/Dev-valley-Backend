import { z } from "zod";

// 🏪 Create Store Validation
export const createStoreSchema = z.object({
  storeName: z
    .string({ required_error: "Store name is required" })
    .min(3, "Store name must be at least 3 characters")
    .max(100, "Store name cannot exceed 100 characters"),

  storeLogo: z
    .string()
    .url("Store logo must be a valid URL")
    .optional(),

  storeCoverImage: z
    .string()
    .url("Store cover image must be a valid URL")
    .optional(),

  storeDescription: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  storeCategoryId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid category ID format")
    .optional()
    .nullable(),

  idCardNumber: z
    .string()
    .regex(/^\d{13}$/, "ID card number must be exactly 13 digits")
    .optional(),

  idCardImage: z
    .string()
    .url("ID card image must be a valid URL")
    .optional(),
});

// 🧾 Update Store Validation
export const updateStoreSchema = z.object({
  storeName: z
    .string()
    .min(3, "Store name must be at least 3 characters")
    .max(100, "Store name cannot exceed 100 characters")
    .optional(),

  storeLogo: z
    .string()
    .url("Store logo must be a valid URL")
    .optional(),

  storeCoverImage: z
    .string()
    .url("Store cover image must be a valid URL")
    .optional(),

  storeDescription: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  storeCategoryId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid category ID format")
    .optional()
    .nullable(),

  idCardNumber: z
    .string()
    .regex(/^\d{13}$/, "ID card number must be exactly 13 digits")
    .optional(),

  idCardImage: z
    .string()
    .url("ID card image must be a valid URL")
    .optional(),
});
// 🛒 Store Product Category Validation
export const storeProductCategorySchema = z.object({
  categoryName: z
    .string({
      required_error: "Category name is required",
    })
    .trim()
    .min(2, "Category name must be at least 2 characters long")
    .max(100, "Category name cannot exceed 100 characters"),

  categoryLogo: z
    .string()
    .url("Category logo must be a valid URL")
    .optional(),
});

// 🛠️ Update Store Product Category Validation
export const updateStoreProductCategorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters long")
    .max(100, "Category name cannot exceed 100 characters")
    .optional(),

  categoryLogo: z
    .string()
    .url("Category logo must be a valid URL")
    .optional(),
});


// 🛍️ Store Product Validation (Fixed for Multer)
export const storeProductSchema = z.object({
  productName: z
    .string({
      required_error: "Product name is required",
    })
    .trim()
    .min(2, "Product name must be at least 2 characters long")
    .max(100, "Product name cannot exceed 100 characters"),

  productDescription: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  productCategoryId: z
    .string()
    .trim()
    .optional(), // Will hold ObjectId as string reference

  price: z.preprocess((val) => Number(val), z.number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0")
    .max(9999999, "Price too large")
  ),

  stock: z.preprocess((val) => Number(val ?? 0), z.number({
      invalid_type_error: "Stock must be a number",
    })
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
  ).optional(),

  productImage: z
    .string()
    .url("Product image must be a valid URL")
    .optional(),

  isActive: z.boolean().optional().default(true),

  productStatus: z
    .enum(["live", "pending"])
    .optional()
    .default("pending"),
});


// 🛠️ Update Store Product Validation
export const updateStoreProductSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters long")
    .max(100, "Product name cannot exceed 100 characters")
    .optional(),

  productDescription: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  productCategoryId: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid category ID format")
    .optional(),

  price: z
    .number({
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0")
    .max(9999999, "Price too large")
    .optional(),

  stock: z
    .number({
      invalid_type_error: "Stock must be a number",
    })
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .optional(),

  productImage: z
    .string()
    .url("Product image must be a valid URL")
    .optional(),

  isActive: z.boolean().optional(),

  productStatus: z.enum(["live", "pending"]).optional(),
});

// ------------------ Store Product Review Validation ------------------
export const storeProductReviewValidation = z.object({
  productId: z.string().min(1, "Product ID is required"),
  storeId: z.string().min(1, "Store ID is required"),
  storeProductRating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
});

// ------------------ Store Feedback Validation ------------------
export const storeFeedbackValidation = z.object({
  storeFeedback: z.string().min(5, "Feedback must be at least 5 characters long"),
  storeId: z.string().min(1, "Store ID is required"),
});


// ------------------ Store Product Feedback Validation ------------------
// Only user-provided fields
export const storeProductFeedbackValidation = z.object({
  storeProductId: z.string().min(1, "Product ID is required"),
  description: z.string().min(1, "Description is required"),
  storeProductImage: z.string().optional(),
});

// ------------------ Store Transaction Validation ------------------
export const storeTransactionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  cardNumber: z
    .string()
    .min(12, "Card number must be at least 12 digits")
    .max(20, "Card number cannot exceed 20 digits"),
  cardHolderName: z.string().max(100, "Card holder name cannot exceed 100 characters"),
  cardExpiryDate: z.string().optional(),
  cvcNumber: z.string().optional(),
  amount: z.number().min(0, "Amount must be greater than 0").optional(), // auto-calculated
  status: z.enum(["successful", "failed"]).optional(),
});

// ------------------ Store Order Validation ------------------
// Each product in order
const orderProductValidation = z.object({
  storeProductId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be greater than 0"),
});

export const storeOrderValidation = z.object({
  products: z.array(orderProductValidation).min(1, "At least one product is required"),
  shippingAddress: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  orderStatus: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  trackingId: z.string().optional(),
  totalAmount: z.number().min(0, "Total amount must be greater than 0"),
  orderNumber: z.string().min(1, "Order number is required"),
});