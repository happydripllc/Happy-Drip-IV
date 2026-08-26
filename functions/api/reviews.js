// /api/reviews — serves curated patient reviews for the homepage carousel.
//
// To add or update a review: edit the REVIEWS array below and push to GitHub.
// Format: authorName, rating (1-5), text (the review), relativeTime (displayed label).
//
// Note: Google Places API does not expose reviews for this listing via their API,
// so reviews are maintained here manually. To revisit live reviews in the future,
// replace this file with an API fetch once Google enables them for this business type.

const REVIEWS = [
  {
    authorName:   'Calliope P.',
    rating:       5,
    text:         'Brittany saved my life. From identifying my clinical depression to facilitating my 130+ lb weight loss, she has been pivotal in all of my most impactful health improvements. Let her change your life. You won\'t regret it.',
    relativeTime: 'Weight Loss Patient • 130+ lbs lost',
  },
  {
    authorName:   'Asheleigh T.',
    rating:       5,
    text:         'I Absolutely LOVE Happy Drip! The staff is so kind and take their time with you. I\'ve been coming here for a while now and I wouldn\'t trade this experience for anything. Truly the best!',
    relativeTime: 'Happy Drip Patient',
  },
  {
    authorName:   'Julie C.',
    rating:       5,
    text:         'I have followed Brittany from a previous medical practice. She offers the ultimate, full package kind of service everyone wants when it comes to your health. She sets aside time to go over labs in detail -- something most providers just don\'t do.',
    relativeTime: 'Long-Time Patient',
  },
  {
    authorName:   'Rachel M.',
    rating:       5,
    text:         'Brittany is absolutely amazing. She takes the time to really listen and explain everything. I\'ve been on semaglutide for 3 months and already down 24 lbs. The whole experience feels so personalized.',
    relativeTime: 'Weight Loss Patient',
  },
  {
    authorName:   'Tasha J.',
    rating:       5,
    text:         'I came in for a Myers Cocktail before a big work event and felt like a brand new person after. Scheduling was easy, the clinic is beautiful, and Brittany is so warm and knowledgeable. Already booked my next drip!',
    relativeTime: 'IV Therapy Patient',
  },
];

export async function onRequest() {
  const payload = {
    rating:       5.0,
    totalRatings: 19,
    reviews:      REVIEWS,
    updatedAt:    new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
}
