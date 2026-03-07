export async function onRequest() {
  const fallbackNews = [
    {
      title: "Iran conducts naval exercise in Gulf waters",
      source: "GeoSentinel Fallback",
      country: "Iran",
      date: "2026-03-08",
      url: "",
      category: "military"
    },
    {
      title: "Oil tanker traffic increases near Strait of Hormuz",
      source: "GeoSentinel Fallback",
      country: "Oman",
      date: "2026-03-08",
      url: "",
      category: "energy"
    }
  ];

  try {
    // في هذه المرحلة نرجع JSON جاهز من الـ Function نفسها
    return new Response(JSON.stringify(fallbackNews), {
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to build live news feed"
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json; charset=UTF-8"
        }
      }
    );
  }
}
