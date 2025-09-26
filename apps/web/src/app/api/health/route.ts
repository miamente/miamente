export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Log health check requests for debugging
  console.log(`[${new Date().toISOString()}] Health check requested - GET /api/health`);

  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function HEAD() {
  // Log health check requests for debugging
  console.log(`[${new Date().toISOString()}] Health check requested - HEAD /api/health`);

  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
