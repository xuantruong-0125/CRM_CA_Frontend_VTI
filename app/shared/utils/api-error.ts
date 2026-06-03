import type { ApiHttpError } from "@/shared/api/http";

export function getApiErrorMessage(error: unknown): string {
  if (!error) return "Có lỗi xảy ra, vui lòng thử lại.";

  const apiError = error as ApiHttpError;

  function extractFromText(text: string | undefined | null): string | null {
    if (!text) return null;
    const s = text.toString();

    // MESSAGE_TEXT = '...'
    const signalMatch = s.match(/MESSAGE_TEXT\s*=\s*'([^']+)'/i);
    if (signalMatch && signalMatch[1]) return signalMatch[1].trim();

    // bracketed [message]
    const bracketMatches = s.match(/\[([^\]]+)\]/g);
    if (bracketMatches && bracketMatches.length > 0) {
      for (const raw of bracketMatches) {
        const inner = raw.slice(1, -1).trim();
        if (inner.length > 5 && /\s/.test(inner) && !/HikariProxy/i.test(inner) && !/CALL\s+/i.test(inner)) {
          return inner;
        }
      }
      const firstInner = bracketMatches[0].slice(1, -1).trim();
      if (firstInner) return firstInner;
    }

    // quoted single-quote message, especially when SQLSTATE present
    const quotedMatch = s.match(/'([^']+)'/);
    if (s.includes("45000") && quotedMatch && quotedMatch[1]) {
      return quotedMatch[1].trim();
    }

    // Look for common Vietnamese phrases to prefer short messages
    const vietMatch = s.match(/(Không thể[^\.\n\[]+|Không tìm thấy[^\.\n\[]+|Lỗi[^\.\n\[]+)/i);
    if (vietMatch && vietMatch[0]) return vietMatch[0].trim();

    return null;
  }

  // 1) apiError.data as string
  if (typeof apiError.data === "string") {
    const extracted = extractFromText(apiError.data);
    if (extracted) return extracted;
    if (apiError.data.trim()) return apiError.data;
  }

  // 2) apiError.data as object -> try message/error fields first (but parse them), then stringify
  if (apiError.data && typeof apiError.data === "object") {
    const anyData = apiError.data as any;
    if (typeof anyData.message === "string" && anyData.message.trim()) {
      const extracted = extractFromText(anyData.message);
      if (extracted) return extracted;
      return anyData.message;
    }
    if (typeof anyData.error === "string" && anyData.error.trim()) {
      const extracted = extractFromText(anyData.error);
      if (extracted) return extracted;
      return anyData.error;
    }

    try {
      const json = JSON.stringify(apiError.data);
      const extracted = extractFromText(json);
      if (extracted) return extracted;
    } catch {
      // ignore
    }
  }

  // 3) apiError.message
  const msg = (apiError.message ?? "").toString();
  const extractedFromMessage = extractFromText(msg);
  if (extractedFromMessage) return extractedFromMessage;

  // 4) whole error toString()
  try {
    const asString = (error as any).toString?.() ?? String(error);
    const extractedFromFull = extractFromText(asString);
    if (extractedFromFull) return extractedFromFull;
  } catch {
    // ignore
  }

  return msg || "Có lỗi xảy ra, vui lòng thử lại.";
}
