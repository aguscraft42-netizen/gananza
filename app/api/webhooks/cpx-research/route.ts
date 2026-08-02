import { processProviderWebhook } from "../[provider]/route";

export async function GET(request: Request) {
  return processProviderWebhook(request, "cpx-research");
}

export async function POST(request: Request) {
  return processProviderWebhook(request, "cpx-research");
}
