import type { ApiHttpError } from "@/shared/api/http";

export function getApiErrorMessage(error: unknown): string {
  if (!error) {
    return "Co loi xay ra, vui long thu lai.";
  }

  const apiError = error as ApiHttpError;
  return apiError.message || "Co loi xay ra, vui long thu lai.";
}
