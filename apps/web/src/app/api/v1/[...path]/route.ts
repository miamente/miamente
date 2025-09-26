import { NextRequest } from "next/server";

const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";

async function proxy(request: NextRequest, context: { params?: Promise<{ path?: string | string[] }> }) {
  const params = await context?.params;
  const raw = params?.path;
  const pathSuffix = Array.isArray(raw) ? raw.join("/") : (raw ?? "");
  const targetUrl = `${backendBaseUrl}/api/v1/${pathSuffix}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(backendBaseUrl).host);
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.blob(),
    redirect: "manual",
    // credentials are not forwarded; tokens should be in Authorization header if present
  };

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);
  // Remove hop-by-hop headers
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
};
