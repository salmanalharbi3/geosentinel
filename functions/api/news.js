function decodeXml(str = "") {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(str = "") {
  return decodeXml(str).replace(/<[^>]*>/g, "").trim();
}

function extractTag(block, tag) {
  const rx = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(rx);
  return m ? stripTags(m[1]) : "";
}

function inferCountry(text = "") {
  const t = text.toLowerCase();
  if (t.includes("iran")) return "Iran";
  if (t.includes("saudi")) return "Saudi Arabia";
  if (t.includes("israel")) return "Israel";
  if (t.includes("gaza") || t.includes("palest")) return "Palestine";
  if (t.includes("yemen")) return "Yemen";
  if (t.includes("iraq")) return "Iraq";
  if (t.includes("qatar")) return "Qatar";
  if (t.includes("uae") || t.includes("emirates")) return "UAE";
  if (t.includes("oman")) return "Oman";
  if (t.includes("kuwait")) return "Kuwait";
  if (t.includes("syria")) return "Syria";
  if (t.includes("lebanon")) return "Lebanon";
  if (t.includes("turkey")) return "Turkey";
  if (t.includes("egypt")) return "Egypt";
  return "Middle East";
}

function inferCategory(text = "") {
  const t = text.toLowerCase();
  if (
    t.includes("missile") ||
    t.includes("airstrike") ||
    t.includes("drone") ||
    t.includes("military") ||
    t.includes("naval") ||
    t.includes("army") ||
    t.includes("defense") ||
    t.includes("strike")
  ) return "military";

  if (
    t.includes("oil") ||
    t.includes("gas") ||
    t.includes("brent") ||
    t.includes("wti") ||
    t.includes("energy") ||
    t.includes("tanker")
  ) return "energy";

  return "geopolitics";
}

function parseRss(xml, fallbackSource = "RSS") {
  const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(m => m[0]);

  return items.slice(0, 12).map(item => {
    const title = extractTag(item, "title");
    const link = extractTag(item, "link");
    const pubDate = extractTag(item, "pubDate");
    const source = extractTag(item, "source") || fallbackSource;

    return {
      title,
      source,
      country: inferCountry(title),
      date: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      url: link,
      category: inferCategory(title)
    };
  });
}

export async function onRequest() {
  const feeds = [
    {
      url: "https://news.google.com/rss/search?q=Middle+East+OR+Iran+OR+Gulf+energy+when:1d&hl=en-US&gl=US&ceid=US:en",
      source: "Google News"
    },
    {
      url: "https://news.google.com/rss/search?q=oil+OR+Brent+OR+WTI+OR+Hormuz+when:1d&hl=en-US&gl=US&ceid=US:en",
      source: "Google News"
    },
    {
      url: "https://news.google.com/rss/search?q=military+OR+naval+OR+drone+OR+missile+Middle+East+when:1d&hl=en-US&gl=US&ceid=US:en",
      source: "Google News"
    }
  ];

  try {
    const results = await Promise.all(
      feeds.map(async feed => {
        const res = await fetch(feed.url, {
          headers: { "user-agent": "GeoSentinel/1.0" }
        });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRss(xml, feed.source);
      })
    );

    const merged = results
      .flat()
      .filter(item => item.title && item.url)
      .filter((item, idx, arr) =>
        idx === arr.findIndex(x => x.title === item.title)
      )
      .slice(0, 20);

    if (!merged.length) {
      throw new Error("No feed items parsed");
    }

    return new Response(JSON.stringify(merged), {
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    const fallbackNews = [
      {
        title: "Fallback: no live items parsed",
        source: "GeoSentinel Fallback",
        country: "Middle East",
        date: new Date().toISOString().slice(0, 10),
        url: "",
        category: "geopolitics"
      }
    ];

    return new Response(JSON.stringify(fallbackNews), {
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "no-store"
      }
    });
  }
}
