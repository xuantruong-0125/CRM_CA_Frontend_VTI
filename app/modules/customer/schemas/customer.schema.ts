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
  })
  .superRefine((values, context) => {
    if (values.type === "B2B" && !values.taxCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxCode"],
        message: "Mã số thuế là bắt buộc với khách hàng B2B",
      });
    }
  });

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const customerSearchSchema = z.object({
  q: z.string().trim().optional(),
  customerType: z.enum(["B2B", "B2C"]).optional(),
  status: z.enum(["CARING", "PAUSED", "BLACKLIST", "OTHER"]).optional(),
  tier: z.enum(["SILVER", "GOLD", "DIAMOND"]).optional(),
  page: z.coerce.number().min(0).optional().default(0),
  size: z.coerce.number().min(1).optional().default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CustomerSearchValues = z.infer<typeof customerSearchSchema>;