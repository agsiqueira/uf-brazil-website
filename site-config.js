// Public configuration only. Keep provider credentials on the signup service.
window.UFBrazilConfig = Object.freeze({
  // Update only from confirmed program availability, never information signups.
  availability: Object.freeze({ places: 12, updated: "2026-10-03" }),
  signupEndpoint: null,
  ayushInvitation: Object.freeze({
    approved: false,
    headline: null,
    videoUrl: null,
    captionsUrl: null,
    transcript: null,
  }),
  programGuideUrl: null,
  bookVisualUrl: "assets/book-cover-mockup.png",
  bookVisualAlt:
    "Concept cover mockup of Virtual Reality & Immersive Storytelling: Designing Experiences That Engage, Educate, and Inspire, credited to Dr. Alexandre G. de Siqueira, MBA, PhD",
  bookVisualCaption:
    "Concept cover preview supplied by the author. Final publication design may change.",
});
