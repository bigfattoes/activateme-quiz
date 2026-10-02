/*
 * ============================================================
 *  ALL THE WORDING on the quiz screens (except the questions,
 *  answers and activity lines, which live in quiz.js).
 * ============================================================
 *  - Change the text between the quotes.
 *  - Words in {curly brackets} are filled in automatically:
 *      {kid}      -> "your kid" or the kid's first name
 *      {kids}     -> "your kid's" or "Sara's"
 *      {activity} -> the matched activity, e.g. "Football"
 *      {n} / {total} -> question numbers
 * ============================================================
 */
window.STRINGS = {
  // Event details (also used on the share image)
  eventName: "ActivateMe Fest",
  eventLine: "Try it at ActivateMe Fest · 16–17 Jan 2027 · Dubai Silicon Oasis",
  eventDates: "16–17 Jan 2027",
  eventPlace: "Dubai Silicon Oasis",
  instagram: "@activatemefest",
  instagramUrl: "https://instagram.com/activatemefest",
  website: "activatemefest.com",
  websiteUrl: "https://activatemefest.com",

  // Start screen
  startKicker: "ActivateMe Fest quiz",
  startTitle: "What should my kid try?",
  startText: "6 quick questions, under a minute. Acti will find your kid's perfect activity!",
  startButton: "Let's go!",
  startNote: "No sign-up needed to see the result.",

  // Questions
  questionCount: "Question {n} of {total}",
  back: "Back",

  // Thinking screen
  thinking: "Acti is thinking…",

  // Result screen
  resultKicker: "Your kid's perfect match is…",
  runnerUpsTitle: "Also worth a try",
  guideTitle: "Why {activity} is a great fit",
  guideBuilds: "Great for",
  guideTryAtHome: "Try this at home",
  clubsTitle: "Clubs to try",
  clubAges: "Ages",
  festTitle: "Try it for real!",
  festText: "Have a go at {activity} and 11 more activities at ActivateMe Fest.",

  // Share
  shareTitle: "Share the result",
  shareStory: "Story",
  sharePost: "Post",
  shareMaking: "Making your image…",
  shareButton: "Share",
  saveButton: "Save image",
  saveHint: "Press and hold the image to save it.",
  close: "Close",
  shareText: "{kids} perfect activity is {activity}! Find your kid's match:",
  cardKicker: "{kids} perfect match",
  cardKickerDefault: "Our kid's perfect match",
  cardAlso: "Also great:",

  // Email capture
  emailTitle: "Get {kids} activity guide + which clubs to try, by email",
  emailEmail: "Parent email",
  emailKid: "Kid's first name (optional)",
  emailOptClubs: "Send me club info",
  emailOptNews: "ActivateMe news",
  emailButton: "Send me the guide",
  emailSending: "Sending…",
  emailPrivacy: "We only use your email for this guide and anything you tick above. Unsubscribe anytime.",
  emailThanks: "You're on the list! 🎉 We'll email {kids} guide soon.",
  emailBadEmail: "Hmm, that email doesn't look right.",
  emailError: "Oops, that didn't send. Please try again.",

  // AR filter
  arTitle: "Now become Acti 🧢",
  arText: "Try our Instagram face filter and turn into Acti!",
  arButton: "Open the Acti filter",
  arUrl: "https://becomeacti.pages.dev",

  // Footer
  retake: "Take the quiz again",
  yourKid: "your kid",
  yourKids: "your kid's"
};
