import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Password is too long");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const followAllocationSchema = z.object({
  leaderId: z.string().uuid(),
  allocationAmount: z.coerce
    .number()
    .positive("Allocation must be greater than $0")
    .max(1_000_000, "Allocation is too large"),
});
export type FollowAllocationInput = z.infer<typeof followAllocationSchema>;

export const orderSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "Symbol is required")
      .max(10),
    side: z.enum(["buy", "sell"]),
    orderType: z.enum(["market", "limit"]).default("market"),
    // Market orders are dollar-denominated (Alpaca "notional"); limit orders
    // are share-denominated (Alpaca requires qty, not notional, for limit
    // orders) with an explicit limit price.
    notionalAmount: z.coerce.number().positive("Enter an amount greater than $0").optional(),
    qty: z.coerce.number().positive("Enter a quantity greater than 0").optional(),
    limitPrice: z.coerce.number().positive("Enter a valid limit price").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "market" && !data.notionalAmount) {
      ctx.addIssue({ code: "custom", path: ["notionalAmount"], message: "Enter an amount greater than $0" });
    }
    if (data.orderType === "limit" && !data.qty) {
      ctx.addIssue({ code: "custom", path: ["qty"], message: "Enter a quantity greater than 0" });
    }
    if (data.orderType === "limit" && !data.limitPrice) {
      ctx.addIssue({ code: "custom", path: ["limitPrice"], message: "Enter a limit price" });
    }
  });
export type OrderInput = z.infer<typeof orderSchema>;

export const kycOnboardingSchema = z.object({
  legalFirstName: z.string().trim().min(1, "Required"),
  legalLastName: z.string().trim().min(1, "Required"),
  dateOfBirth: z.string().min(1, "Required"),
  ssnLast4: z.string().regex(/^\d{4}$/, "Enter the last 4 digits of your SSN"),
  streetAddress: z.string().trim().min(1, "Required"),
  city: z.string().trim().min(1, "Required"),
  state: z.string().trim().length(2, "Use a 2-letter state code"),
  postalCode: z.string().trim().min(5, "Required"),
  countryOfCitizenship: z.string().trim().min(1, "Required"),
});
export type KycOnboardingInput = z.infer<typeof kycOnboardingSchema>;

export const fundingSchema = z.object({
  achRelationshipId: z.string().min(1, "Link a bank account first"),
  amount: z.coerce.number().positive("Enter an amount greater than $0").max(100_000),
});
export type FundingInput = z.infer<typeof fundingSchema>;
