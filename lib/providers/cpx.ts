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

export class CpxProviderAdapter implements ProviderAdapter {
  readonly slug = "cpx-research";
  readonly name = "CPX Research";

  generateSecureHash(userId: string, secret?: string): string | null {
    const key = secret || process.env.CPX_APP_SECURE_HASH || process.env.CPX_RESEARCH_SECRET_KEY;
    if (!key) return null;
    return createHash("md5").update(`${userId}-${key}`).digest("hex");
  }

  getIframeUrl(params: { userId: string; email?: string; displayName?: string; username?: string; secret?: string }): string {
    const search = new URLSearchParams({
      app_id: CPX_APP_ID,
      ext_user_id: params.userId,
    });
    const userName = params.displayName || params.username;
    if (userName) {
      search.set("username", userName);
    }
    if (params.email) {
      search.set("email", params.email);
    }
    const secureHash = this.generateSecureHash(params.userId, params.secret);
    if (secureHash) {
      search.set("secure_hash", secureHash);
    }
    return `https://offers.cpx-research.com/index.php?${search.toString()}`;
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
