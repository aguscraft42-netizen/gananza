import { createHash, timingSafeEqual } from "node:crypto";
import type { NormalizedPostbackPayload, PostbackValidationResult, ProviderAdapter } from "./types";

export const CPX_APP_ID = process.env.NEXT_PUBLIC_CPX_APP_ID || "35021";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

export type CpxIframeParams = {
  userId: string;
  email?: string;
  displayName?: string;
  username?: string;
  countryCode?: string;
  birthDate?: string | null; // Formato: "YYYY-MM-DD"
  gender?: string | null;    // "m" | "f"
  zipCode?: string | null;
  userIp?: string | null;
  userAgent?: string | null;
  orderBy?: number;          // 3 = Priorizar Conversion Rate si aplica
  secret?: string;
};

export type CpxApiSurveyItem = {
  id: string;
  amount_local: number;
  amount_usd?: number;
  estimated_minutes?: number;
  conversion_rate?: number;
  score?: number;
  top?: number;
  type?: string;
};

export function cleanPublicIp(rawIp?: string | null): string | null {
  if (!rawIp) return null;
  let ip = rawIp.split(",")[0].trim();
  // Eliminar puerto si viene como IPv4:puerto (ej: 190.191.192.193:8080)
  if (ip.includes(":") && !ip.includes("::") && ip.split(":").length === 2) {
    ip = ip.split(":")[0];
  }
  if (isPrivateOrInvalidIp(ip)) return null;
  return ip;
}

function isPrivateOrInvalidIp(ip: string): boolean {
  const clean = ip.trim();
  if (!clean || clean === "127.0.0.1" || clean === "::1" || clean === "0.0.0.0") return true;
  if (clean.startsWith("10.") || clean.startsWith("192.168.")) return true;
  if (clean.startsWith("172.")) {
    const parts = clean.split(".");
    if (parts.length >= 2) {
      const second = Number.parseInt(parts[1], 10);
      if (second >= 16 && second <= 31) return true;
    }
  }
  const lower = clean.toLowerCase();
  if (lower.startsWith("fc00:") || lower.startsWith("fe80:")) return true;
  return false;
}

export class CpxProviderAdapter implements ProviderAdapter {
  readonly slug = "cpx-research";
  readonly name = "CPX Research";

  generateSecureHash(userId: string, secret?: string): string | null {
    const key = secret || process.env.CPX_APP_SECURE_HASH || process.env.CPX_RESEARCH_SECRET_KEY;
    if (!key) return null;
    return createHash("md5").update(`${userId}-${key}`).digest("hex");
  }

  getIframeUrl(params: CpxIframeParams): string {
    const search = new URLSearchParams({
      app_id: CPX_APP_ID,
      ext_user_id: params.userId,
    });

    const countryCode = (params.countryCode || "").trim().toUpperCase();
    if (countryCode && countryCode.length === 2) {
      search.set("user_country_code", countryCode);
    }

    const userName = (params.displayName || params.username || "").trim();
    if (userName) {
      search.set("username", userName);
    }
    const cleanEmail = (params.email || "").trim();
    if (cleanEmail) {
      search.set("email", cleanEmail);
    }

    let hasDemographics = false;

    if (params.birthDate) {
      const parts = params.birthDate.split("-");
      if (parts.length === 3) {
        const year = Number.parseInt(parts[0], 10);
        const month = Number.parseInt(parts[1], 10);
        const day = Number.parseInt(parts[2], 10);
        if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          search.set("birthday_day", String(day));
          search.set("birthday_month", String(month));
          search.set("birthday_year", String(year));
          hasDemographics = true;
        }
      }
    }

    if (params.gender) {
      const g = params.gender.trim().toLowerCase();
      if (g === "m" || g === "f") {
        search.set("gender", g);
        hasDemographics = true;
      }
    }

    if (params.zipCode && params.zipCode.trim()) {
      search.set("zip_code", params.zipCode.trim());
      hasDemographics = true;
    }

    // Agregar main_info=true ÚNICAMENTE cuando exista al menos un dato demográfico válido
    if (hasDemographics) {
      search.set("main_info", "true");
    }

    if (params.orderBy) {
      search.set("order_by", String(params.orderBy));
    }

    // IP pública real del usuario
    const validIp = cleanPublicIp(params.userIp);
    if (validIp) {
      search.set("ip_user", validIp);
    }

    if (params.userAgent && params.userAgent.trim()) {
      search.set("user_agent", params.userAgent.trim());
    }

    const secureHash = this.generateSecureHash(params.userId, params.secret);
    if (secureHash) {
      search.set("secure_hash", secureHash);
    }

    this.logMatchingDiagnosis({
      userId: params.userId,
      countryCode: countryCode || "AR",
      hasDemographics,
      hasIp: Boolean(validIp),
    });

    return `https://offers.cpx-research.com/index.php?${search.toString()}`;
  }

  sortSurveysByConversionRate(surveys: CpxApiSurveyItem[]): CpxApiSurveyItem[] {
    return [...surveys].sort((a, b) => {
      const convA = a.conversion_rate ?? 0;
      const convB = b.conversion_rate ?? 0;
      if (convA !== convB) return convB - convA;

      const topA = a.top ?? 0;
      const topB = b.top ?? 0;
      if (topA !== topB) return topB - topA;

      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      return b.amount_local - a.amount_local;
    });
  }

  private logMatchingDiagnosis(info: {
    userId: string;
    countryCode: string;
    hasDemographics: boolean;
    hasIp: boolean;
  }) {
    const anonUserId = info.userId.length > 8 ? `${info.userId.slice(0, 8)}...` : info.userId;
    console.log(
      `[CPX Matching Diagnosis] timestamp=${new Date().toISOString()} | user_id_anon=${anonUserId} | country=${info.countryCode} | has_demographics=${info.hasDemographics} | main_info=${info.hasDemographics} | has_public_ip=${info.hasIp}`
    );
  }

  async parseAndValidatePostback(
    _request: Request,
    urlParams: URLSearchParams,
    body: Record<string, unknown>,
    secret?: string
  ): Promise<PostbackValidationResult> {
    const raw: Record<string, unknown> = {
      ...Object.fromEntries(urlParams.entries()),
      ...body,
    };

    const statusParam = String(raw.status || raw.status_code || "").trim();
    const transId = String(raw.trans_id || raw.transaction_id || raw.id || "").trim();
    const userId = String(raw.user_id || raw.ext_user_id || raw.sub_id || "").trim();
    const rewardStr = String(raw.amount_local || raw.reward || raw.amount || "0").trim();
    const grossStr = String(raw.amount_gross || raw.amount_publisher || raw.payout || rewardStr).trim();
    const amountUsd = Number.parseFloat(String(raw.amount_usd || "0").trim()) || 0;
    const typeParam = String(raw.type || raw.event_type || "").toLowerCase().trim();

    if (!transId || !userId || !statusParam) {
      return {
        isValid: false,
        error: "Missing required CPX parameters (trans_id, user_id, status)",
        statusCode: 400,
      };
    }

    const receivedHash = String(raw.hash || raw.secure_hash || "").trim();
    const secretKey = process.env.CPX_APP_SECURE_HASH || secret || process.env.CPX_RESEARCH_SECRET_KEY || "";

    if (secretKey || receivedHash) {
      if (!secretKey || !receivedHash) {
        return {
          isValid: false,
          error: "Invalid or missing secure hash signature",
          statusCode: 401,
        };
      }

      const expected1 = createHash("md5").update(`${transId}-${secretKey}`).digest("hex");
      const expected2 = createHash("md5").update(`${statusParam}${transId}${userId}${rewardStr}${grossStr}${secretKey}`).digest("hex");
      const expected3 = createHash("md5").update(`${userId}-${secretKey}`).digest("hex");

      const match = safeCompare(receivedHash, expected1) || safeCompare(receivedHash, expected2) || safeCompare(receivedHash, expected3);

      if (!match) {
        return {
          isValid: false,
          error: "Invalid CPX postback secure hash signature",
          statusCode: 401,
        };
      }
    }

    let status: NormalizedPostbackPayload["status"] = "confirmed";
    if (statusParam === "2" || typeParam === "canceled" || typeParam === "reversed" || typeParam === "chargeback") {
      status = "reversed";
    } else if (statusParam === "0" || typeParam === "pending") {
      status = "pending";
    } else if (statusParam === "3" || typeParam === "rejected") {
      status = "rejected";
    }

    const userReward = Number.parseFloat(rewardStr) || 0;
    const grossAmount = Math.max(Number.parseFloat(grossStr) || 0, userReward);

    let description = "CPX Research · Encuesta completada";
    if (status === "reversed") {
      description = "CPX Research · Reversión del proveedor";
    } else if (typeParam === "bonus" || typeParam === "screenout" || typeParam.includes("screenout")) {
      description = "CPX Research · Bono por participación";
    } else if (typeParam === "complete" || typeParam === "completed") {
      description = "CPX Research · Encuesta completada";
    }

    return {
      isValid: true,
      payload: {
        providerSlug: this.slug,
        externalTransactionId: transId,
        userId,
        status,
        userReward,
        grossAmount,
        rawPayload: {
          ...raw,
          amount_usd: amountUsd,
          type: typeParam,
          description,
        },
      },
    };
  }
}

export const cpxAdapter = new CpxProviderAdapter();
