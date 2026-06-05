import { z } from "zod";

// Helper: preprocess null/undefined → "" trước khi validate string
// Đặt .trim(), .min(), .max() bên TRONG inner để tránh lỗi TypeScript trên ZodEffects
const ns = (inner: z.ZodString) =>
  z.preprocess((v) => (v == null ? "" : String(v)), inner);

export const leadFormSchema = z.object({
  contactName: ns(
    z.string().trim()
      .min(2, "Tên liên hệ phải có ít nhất 2 ký tự")
      .max(100, "Tên liên hệ không được vượt quá 100 ký tự")
  ),

  companyName: ns(z.string().trim().max(100, "Tên công ty không được vượt quá 100 ký tự"))
    .optional()
    .refine((value) => !value || value.length >= 2, {
      message: "Tên công ty phải có ít nhất 2 ký tự",
    }),

  phone: ns(z.string().trim())
    .optional()
    .refine((value) => !value?.trim() || /^[0-9+\-\s]{10}$/.test(value.trim()), {
      message: "Số điện thoại không hợp lệ",
    }).transform((val) => (val === "" ? undefined : val)),

  email: ns(z.string().trim().max(100, "Email không được vượt quá 100 ký tự"))
    .optional()
    .refine((value) => !value?.trim() || z.string().email().safeParse(value.trim()).success, {
      message: "Email không hợp lệ",
    }).transform((val) => (val === "" ? undefined : val)),

  address: ns(z.string().trim().max(150, "Địa chỉ không được vượt quá 150 ký tự"))
    .optional(),

  website: ns(z.string().trim().max(100, "Website không được vượt quá 100 ký tự"))
    .optional()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,24}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(value),
      { message: "Website không hợp lệ (VD: https://domain.com, www.domain.com)" }
    ),

  taxCode: ns(z.string().trim().max(13, "Mã số thuế không được vượt quá 13 ký tự"))
    .optional()
    .refine((value) => !value?.trim() || /^[a-zA-Z0-9-]+$/.test(value.trim()), {
      message: "Mã số thuế chỉ chứa chữ cái, số và dấu gạch ngang",
    }).transform((val) => (val === "" ? undefined : val)),

  citizenId: ns(z.string().trim())
    .optional()
    .refine((value) => !value?.trim() || /^[0-9]{12}$/.test(value.trim()), {
      message: "CCCD/CMND phải là dãy số dài 12 ký tự",
    }).transform((val) => (val === "" ? undefined : val)),

  // --- Validation cho Combobox/Select ---
  // Các Select tuỳ chọn (Optional): biến chuỗi "" (coerced thành 0) thành undefined
  provinceId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  campaignId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  sourceId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  organizationId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  assignedTo: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),

  // Select Trạng thái là BẮT BUỘC (Required): kiểm tra giá trị > 0
  statusId: z.coerce.number().refine((val) => val > 0, {
    message: "Vui lòng chọn Trạng thái",
  }),

  description: ns(z.string().trim()).optional(),

  expectedRevenue: z.coerce
    .number()
    .nonnegative("Doanh thu dự kiến không được là số âm")
    .optional()
    .transform((val) => (!val ? undefined : val)),

  productInterestIds: z.preprocess(
    (value) => {
      if (!Array.isArray(value)) return [];
      return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
    },
    z.array(z.number().positive()).default([])
  ),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const leadSearchSchema = z.object({
  phone: z.string().trim().optional(),
  provinceId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  sourceId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  campaignId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  assignedTo: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  statusId: z.coerce.number().optional().transform((val) => (!val ? undefined : val)),
  q: z.string().trim().optional(), // Text search chung
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(200).optional().default(50),
});

export type LeadSearchValues = z.infer<typeof leadSearchSchema>;