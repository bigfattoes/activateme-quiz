/*
 * ============================================================
 *  ActivateMe Fest quiz: QUESTIONS, SCORING and RESULTS
 * ============================================================
 *  This is the one file to edit to change the quiz.
 *
 *  HOW SCORING WORKS
 *  - Every answer has "points": which activities it adds points to.
 *  - After the last question, the points are added up.
 *  - Highest total = top match. Next two = runner-ups.
 *  - If two activities have the same total, the one that appears
 *    EARLIER in "tieBreakOrder" (at the bottom) wins.
 *
 *  EDITING TIPS
 *  - Keep the quotes, commas and brackets exactly as they are.
 *  - Activity names in "points" must match the ids in "activities"
 *    (football, basketball, cricket, tennis, swimming, gymnastics,
 *     boxing, skating, cycling, esports, chess, creativity).
 *  - Answer "id"s are what get saved in the sign-ups export.
 *    You can change labels freely, but try to keep ids the same.
 *  - "acti" is which Acti pose to show. Options:
 *    front, wave, run, jump, lol, hmm, threequarter, face
 *  - After editing, run "npm test" (see README) to check for mistakes.
 * ============================================================
 */
window.QUIZ = {
  questions: [
    {
      id: "age",
      title: "How old is your little legend?",
      acti: "wave",
      answers: [
        { id: "4-6",   emoji: "🐣", label: "4–6",   points: { swimming: 1, gymnastics: 1, creativity: 1, football: 1 } },
        { id: "7-9",   emoji: "🧒", label: "7–9",   points: { skating: 1, cycling: 1, tennis: 1, basketball: 1 } },
        { id: "10-14", emoji: "🧑", label: "10–14", points: { esports: 1, boxing: 1, cricket: 1, chess: 1 } }
      ]
    },
    {
      id: "energy",
      title: "How much energy are we talking?",
      acti: "run",
      answers: [
        { id: "walls", emoji: "🚀", label: "Bouncing off the walls", points: { football: 2, basketball: 2, boxing: 2, gymnastics: 1, cycling: 1 } },
        { id: "busy",  emoji: "⚡", label: "Busy, but can focus",     points: { tennis: 2, swimming: 2, skating: 2, cricket: 1, cycling: 1 } },
        { id: "calm",  emoji: "🧘", label: "Calm and thoughtful",     points: { chess: 2, creativity: 2, esports: 2, cricket: 1 } }
      ]
    },
    {
      id: "social",
      title: "Team player or solo star?",
      acti: "threequarter",
      answers: [
        { id: "team",  emoji: "🤝", label: "Loves being in a team",      points: { football: 3, basketball: 3, cricket: 3 } },
        { id: "solo",  emoji: "🦸", label: "Happy doing their own thing", points: { tennis: 2, swimming: 2, gymnastics: 2, skating: 2, cycling: 2, boxing: 2 } },
        { id: "buddy", emoji: "👯", label: "Best with a buddy",           points: { chess: 2, esports: 2, creativity: 2, tennis: 1 } }
      ]
    },
    {
      id: "spark",
      title: "What lights them up?",
      acti: "hmm",
      answers: [
        { id: "win",    emoji: "🏆", label: "Winning!",               points: { boxing: 2, tennis: 2, esports: 2, football: 1, basketball: 1, chess: 1 } },
        { id: "make",   emoji: "🎨", label: "Making things",          points: { creativity: 3, gymnastics: 1, skating: 1 } },
        { id: "puzzle", emoji: "🧩", label: "Figuring things out",    points: { chess: 3, esports: 2, cricket: 1 } },
        { id: "tricks", emoji: "🤸", label: "Showing off cool tricks", points: { gymnastics: 2, skating: 2, cycling: 1, basketball: 1 } }
      ]
    },
    {
      id: "place",
      title: "Where are they happiest?",
      acti: "jump",
      answers: [
        { id: "outdoors", emoji: "☀️", label: "Outdoors",     points: { football: 2, cricket: 2, cycling: 2, tennis: 1, skating: 1 } },
        { id: "indoors",  emoji: "🏠", label: "Indoors",      points: { gymnastics: 1, boxing: 1, basketball: 1, chess: 1, esports: 1, creativity: 1 } },
        { id: "water",    emoji: "💦", label: "In the water", points: { swimming: 3 } }
      ]
    },
    {
      id: "power",
      title: "Pick their superpower!",
      acti: "lol",
      answers: [
        { id: "speed",       emoji: "⚡", label: "Speed",       points: { cycling: 3, football: 1, skating: 1, swimming: 1 } },
        { id: "strength",    emoji: "💪", label: "Strength",    points: { boxing: 2, cricket: 1, basketball: 1 } },
        { id: "aim",         emoji: "🎯", label: "Perfect aim", points: { cricket: 2, tennis: 2, basketball: 1 } },
        { id: "balance",     emoji: "🌀", label: "Balance",     points: { gymnastics: 2, skating: 2 } },
        { id: "imagination", emoji: "💡", label: "Imagination", points: { creativity: 3, esports: 2 } },
        { id: "brain",       emoji: "🧠", label: "Brain power", points: { chess: 2, esports: 1 } }
      ]
    }
  ],

  /*
   * The 12 festival activities.
   *  reason   = the big fun line for a TOP match
   *  short    = the small line for a RUNNER-UP
   *  builds   = what it's great for (shown in the on-screen guide)
   *  tryAtHome = an easy first step (shown in the on-screen guide)
   *  acti     = Acti pose shown on the result screen and share card
   */
  activities: {
    football:   { name: "Football",     emoji: "⚽", acti: "run",          reason: "Born to run and loves a team. Football!",          short: "Team energy to burn",      builds: "Teamwork, speed and confidence",           tryAtHome: "Kick a ball around the park with friends." },
    basketball: { name: "Basketball",   emoji: "🏀", acti: "jump",         reason: "Bouncy, quick and a team star. Basketball!",       short: "Bounce plus teamwork",     builds: "Coordination, teamwork and quick thinking", tryAtHome: "Practise dribbling: 20 bounces with each hand." },
    cricket:    { name: "Cricket",      emoji: "🏏", acti: "front",        reason: "Sharp eye, steady arm, team spirit. Cricket!",     short: "Great aim, team spirit",   builds: "Focus, hand-eye coordination and patience", tryAtHome: "Play catch: count how many in a row without a drop." },
    tennis:     { name: "Tennis",       emoji: "🎾", acti: "jump",         reason: "Quick feet and a perfect aim. Tennis!",            short: "Quick feet, sharp aim",    builds: "Agility, focus and coordination",          tryAtHome: "Bounce a ball on a racket (or a book!) and count." },
    swimming:   { name: "Swimming",     emoji: "🏊", acti: "wave",         reason: "Part fish, all fun. Swimming!",                    short: "Loves to splash",          builds: "Water confidence, stamina and safety",     tryAtHome: "Practise floating like a starfish at the pool." },
    gymnastics: { name: "Gymnastics",   emoji: "🤸", acti: "jump",         reason: "Flips, balance and serious bounce. Gymnastics!",   short: "A natural flipper",        builds: "Strength, balance and flexibility",        tryAtHome: "Try a 10-second balance on one leg, eyes closed." },
    boxing:     { name: "Boxing",       emoji: "🥊", acti: "run",          reason: "Strong, fast and fearless. Boxing!",               short: "Strong and fearless",      builds: "Fitness, focus and self-confidence",       tryAtHome: "Do 30 seconds of shadow-boxing to music." },
    skating:    { name: "Skating",      emoji: "🛼", acti: "run",          reason: "Smooth moves and great balance. Skating!",         short: "Rolls with style",         builds: "Balance, coordination and courage",        tryAtHome: "Walk heel-to-toe along a line to train balance." },
    cycling:    { name: "Cycling",      emoji: "🚴", acti: "run",          reason: "Loves speed and the open air. Cycling!",           short: "Built for speed",          builds: "Stamina, balance and independence",        tryAtHome: "Plan a family ride on a cycle track this weekend." },
    esports:    { name: "VR & Esports", emoji: "🎮", acti: "lol",          reason: "Quick thumbs and a big imagination. VR & Esports!", short: "Game-ready brain",        builds: "Reaction speed, strategy and teamwork",    tryAtHome: "Play a co-op game together and plan your moves." },
    chess:      { name: "Chess",        emoji: "♟️", acti: "hmm",          reason: "A big brain that loves a challenge. Chess!",       short: "Loves a puzzle",           builds: "Focus, planning and patience",             tryAtHome: "Learn how the knight moves and play a mini game." },
    creativity: { name: "Creativity",   emoji: "🎨", acti: "lol",          reason: "Full of ideas and loves to make. Creativity!",     short: "Full of ideas",            builds: "Imagination, expression and confidence",   tryAtHome: "Build something new from a box of recycling." }
  },

  // Used ONLY when two activities have exactly the same total score.
  // Earlier in the list wins.
  tieBreakOrder: [
    "football", "swimming", "basketball", "gymnastics", "tennis", "cricket",
    "skating", "cycling", "boxing", "creativity", "chess", "esports"
  ]
};

/*
 * The scoring engine. You don't need to edit anything below this line.
 * answers = { age: "4-6", energy: "walls", ... }  (question id -> answer id)
 * Returns the activity ids ranked best first, plus every score.
 */
window.scoreQuiz = function (answers, quiz) {
  quiz = quiz || window.QUIZ;
  var scores = {};
  Object.keys(quiz.activities).forEach(function (id) { scores[id] = 0; });
  quiz.questions.forEach(function (q) {
    var picked = null;
    q.answers.forEach(function (a) { if (a.id === answers[q.id]) picked = a; });
    if (!picked) return;
    Object.keys(picked.points).forEach(function (act) {
      if (act in scores) scores[act] += picked.points[act];
    });
  });
  var order = quiz.tieBreakOrder;
  var ranked = Object.keys(scores).sort(function (a, b) {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    var ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return { ranked: ranked, scores: scores };
};
