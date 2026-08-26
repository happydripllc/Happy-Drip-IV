// Cloudflare Pages Function — /api/reviews
// Fetches Google Places reviews, caches for 24h via Cloudflare Cache API.
// Requires env var: GOOGLE_PLACES_API_KEY (set in Cloudflare Pages dashboard)

const PLACE_ID  = 'ChIJmfpTtRDMM6MRnkpXDl57x0c';
const CACHE_URL = 'https://happydripiv.com/__reviews_cache_v2';
const CACHE_TTL = 86400; // 24 hours

export async function onRequest({ env }) {
  const cache  = caches.default;
  const cached = await cache.match(CACHE_URL);
  if (cached) return cached;

  let payload;
  let debugError = null;

  try {
    const apiKey = env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not set -- available keys: ' + Object.keys(env || {}).join(', '));

    const resp = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`,
      {
        headers: {
          'X-Goog-Api-Key':   apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        },
      }
    );

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Places API ${resp.status}: ${body.slice(0, 200)}`);
    }

    const data = await resp.json();

    // Temporary debug -- remove after confirming reviews field shape
    const rawReviews = data.reviews ?? data.Reviews ?? null;

    payload = {
      rating:       data.rating        ?? null,
      totalRatings: data.userRatingCount ?? null,
      reviews: (rawReviews ?? [])
        .filter(r => r.rating >= 4)
        .map(r => ({
          authorName:   r.authorAttribution?.displayName ?? 'Happy Drip Patient',
          rating:       r.rating,
          text:         r.text?.text ?? '',
          relativeTime: r.relativePublishTimeDescription ?? '',
        })),
      updatedAt: new Date().toISOString(),
      _debug: { topLevelKeys: Object.keys(data), rawReviewCount: rawReviews?.length ?? 'field missing', firstReview: rawReviews?.[0] ?? null },
    };
  } catch (err) {
    debugError = err.message;
    payload = {
      rating: null, totalRatings: null,
      reviews: [], updatedAt: new Date().toISOString(),
      _error: debugError, // temporary -- remove once working
    };
  }

  // Only cache successful responses
  const response = new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!debugError) {
    const cacheable = new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type':  'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    });
    await cache.put(CACHE_URL, cacheable);
  }

  return response;
}
