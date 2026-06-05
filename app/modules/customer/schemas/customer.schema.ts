import { z } from "zod";

function optionalNumber() {
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number().int().positive().optional());
}

function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    });
}

export const customerFormSchema = z
  .object({
    type: z.enum(["B2B", "B2C"]),
    name: z
      .string()
      .trim()
      .min(2, "Tên khách hàng phải có ít nhất 2 ký tự")
      .max(120, "Tên khách hàng không được vượt quá 120 ký tự"),
    shortName: optionalText(120),
    phone: z.string().trim().min(1, "Vui lòng nhập số điện thoại").max(20),
    taxCode: optionalText(20),
    email: z
      .string()
      .trim()
      .max(120)
      .optional()
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "Email không hợp lệ",
      })
      .transform((value) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : undefined;
      }),
    fax: optionalText(20),
    description: optionalText(1000),
    establishedDate: optionalText(10),
    sourceId: optionalNumber(),
    statusId: optionalNumber(),
    tierId: optionalNumber(),
    assignedTo: optionalNumber(),
    addressType: z.string().trim().max(30).optional(),
    fullAddress: optionalText(500),
    provinceId: optionalNumber(),
    isPrimaryAddress: z.boolean().optional(),
    addresses: z
      .array(
        z.object({
          id: optionalNumber(),
          addressType: z.string().trim().max(30).default("OFFICE"),
          fullAddress: z.string().trim().min(1, "Vui lòng nhập địa chỉ đầy đủ").max(500),
          provinceId: optionalNumber(),
          isPrimary: z.boolean().optional().default(false),
        })
      )
      .optional()
      .default([]),
    contacts: z
      .array(
        z.object({
          id: optionalNumber(),
          fullName: z.string().trim().min(1, "Vui lòng nhập tên liên hệ").max(120),
          phone: optionalText(20),
          email: z
            .string()
            .trim()
            .max(120)
            .optional()
            .refine((value) => !value || z.string().email().safeParse(value).success, {
              message: "Email liên hệ không hợp lệ",
            })
            .transform((value) => {
              const trimmed = value?.trim();
              return trimmed ? trimmed : undefined;
            }),
          position: optionalText(120),
          address: optionalText(255),
          notes: optionalText(500),
          isPrimary: z.boolean().optional().default(false),
        })
      )
      .optional()
      .default([]),
  })
  .superRefine((values, context) => {
    if (values.type === "B2B" && !values.taxCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxCode"],
        message: "Mã số thuế là bắt buộc với khách hàng B2B",
      });
    }

    const addresses = values.addresses ?? [];
    if (addresses.length > 0) {
      const primaryCount = addresses.filter((item) => item.isPrimary).length;
      if (primaryCount !== 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["addresses"],
          message: "Vui lòng chọn đúng 1 địa chỉ chính",
        });
      }
    }

    const contacts = values.contacts ?? [];
    if (contacts.length > 0) {
      const primaryCount = contacts.filter((item) => item.isPrimary).length;
      if (primaryCount !== 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contacts"],
          message: "Vui lòng chọn đúng 1 liên hệ chính",
        });
      }
    }
  });

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type CustomerFormInput = z.input<typeof customerFormSchema>;

export const customerSearchSchema = z.object({
  q: z.string().trim().optional(),
  customerType: z.enum(["B2B", "B2C"]).optional(),
  status: z.enum(["CARING", "PAUSED", "BLACKLIST", "OTHER"]).optional(),
  tier: z.enum(["SILVER", "GOLD", "DIAMOND"]).optional(),
  page: z.coerce.number().min(0).optional().default(0),
  size: z.coerce.number().min(1).max(200).optional().default(50),
  sortBy: z.string().optional().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CustomerSearchValues = z.infer<typeof customerSearchSchema>;