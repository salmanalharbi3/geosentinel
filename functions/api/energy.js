export async function onRequest() {
  try {
    const url = "https://www.eia.gov/todayinenergy/prices.php";
    const res = await fetch(url, {
      headers: {
        "user-agent": "GeoSentinel/1.0"
      }
    });

    if (!res.ok) {
      throw new Error(`EIA request failed: ${res.status}`);
    }

    const html = await res.text();

    // نحاول استخراج Brent و WTI من الصفحة
    const clean = html.replace(/\s+/g, " ");

    // أمثلة أسماء محتملة داخل الصفحة
    const brentRegexes = [
      /Brent[^<]{0,120}?\$?\s*([0-9]+(?:\.[0-9]+)?)/i,
      /Europe Brent Spot Price FOB[^<]{0,120}?\$?\s*([0-9]+(?:\.[0-9]+)?)/i
    ];

    const wtiRegexes = [
      /WTI[^<]{0,120}?\$?\s*([0-9]+(?:\.[0-9]+)?)/i,
      /WTI Cushing[^<]{0,120}?\$?\s*([0-9]+(?:\.[0-9]+)?)/i
    ];

    function pickNumber(regexes, text) {
      for (const rx of regexes) {
        const m = text.match(rx);
        if (m && m[1]) return Number(m[1]);
      }
      return 0;
    }

    const brent = pickNumber(brentRegexes, clean);
    const wti = pickNumber(wtiRegexes, clean);

    return new Response(
      JSON.stringify({
        updated_at: new Date().toISOString(),
        brent_usd: brent,
        wti_usd: wti,
        source: "EIA Daily Prices",
        note: brent || wti ? "live-scrape" : "parse-fallback"
      }),
      {
        headers: {
          "content-type": "application/json; charset=UTF-8",
          "cache-control": "no-store"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        updated_at: new Date().toISOString(),
        brent_usd: 0,
        wti_usd: 0,
        source: "fallback",
        note: error.message || "Energy fetch failed"
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=UTF-8",
          "cache-control": "no-store"
        }
      }
    );
  }
}
