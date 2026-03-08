export async function onRequest() {
  try {
    // مؤقتًا: قيم fallback حتى نربط مفتاح EIA لاحقًا
    const fallback = {
      updated_at: new Date().toISOString(),
      brent_usd: 0,
      wti_usd: 0,
      gas_note: "EIA integration pending"
    };

    return new Response(JSON.stringify(fallback), {
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load energy data" }),
      {
        status: 500,
        headers: { "content-type": "application/json; charset=UTF-8" }
      }
    );
  }
}
