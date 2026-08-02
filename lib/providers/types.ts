export type ConversionStatus = "pending" | "confirmed" | "rejected" | "reversed";

export type NormalizedPostbackPayload = {
  providerSlug: string;
  externalTransactionId: string;
  userId: string;
  offerId?: string | null;
  status: ConversionStatus;
  grossAmount: number;
  userReward: number;
  rawPayload: Record<string, unknown>;
};

export type PostbackValidationResult =
  | { isValid: true; payload: NormalizedPostbackPayload }
  | { isValid: false; error: string; statusCode?: number };

export interface ProviderAdapter {
  slug: string;
  name: string;
  getIframeUrl(params: { userId: string; email?: string; displayName?: string; username?: string }): string;
  parseAndValidatePostback(
    request: Request,
    urlParams: URLSearchParams,
    body: Record<string, unknown>,
    secret?: string
  ): Promise<PostbackValidationResult>;
}
