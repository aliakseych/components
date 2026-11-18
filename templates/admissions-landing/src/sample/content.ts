// Placeholder copy and data. Schools, people and programmes are fictional.

export type NavLink = { label: string; href: string; description?: string };

export const nav = {
  links: [
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "#blog" },
  ] satisfies NavLink[],
  menus: [
    {
      label: "Tools",
      items: [
        { label: "Essay grader", href: "#tools-grader", description: "Score a draft paragraph by paragraph" },
        { label: "Admission odds", href: "#tools-odds", description: "Estimate your chances at each school" },
        { label: "Deadline planner", href: "#tools-planner", description: "Lay out the year week by week" },
        { label: "All tools", href: "#tools", description: "Every free tool in one place" },
      ],
    },
    {
      label: "Explore",
      items: [
        { label: "Colleges", href: "#colleges", description: "Profiles, deadlines and essay prompts" },
        { label: "Scholarships", href: "#scholarships", description: "Awards filtered to your background" },
        { label: "Summer programs", href: "#summer", description: "Pre-college courses and research" },
        { label: "Financial aid", href: "#aid", description: "Plain guides to forms and offers" },
      ],
    },
  ] satisfies { label: string; items: NavLink[] }[],
};

export const hero = {
  pill: { text: "A practice review panel reads your essay", action: "Try it free", href: "#start" },
  title: "The calm AI coach for college applications.",
  body: "Quill has studied 500+ essays that got into selective schools, and it grades yours the way a first reader would, marking the lines that hold it back. First full review free.",
  primary: { label: "Grade my essay free", href: "#start" },
  secondary: { label: "Start your application", href: "#start" },
};

export const dashboard = {
  greeting: "Hi, Sam.",
  subline: "First deadline in 226 days · Northfield University RD.",
  sidebar: {
    main: ["Home", "Discover", "Chat", "Review panel"],
    application: [
      { label: "Activities" },
      { label: "Honors" },
      { label: "Letters", count: 1 },
      { label: "My essays", count: 1 },
    ],
    schools: [
      { label: "Northfield University", count: 8, color: "#9f1d35" },
      { label: "Harbor City University", count: 7, color: "#1f4e8c" },
      { label: "Lakeside College", count: 8, color: "#c2414b" },
      { label: "Westbrook University", count: 6, color: "#8c1515" },
      { label: "Metro State University", count: 6, color: "#57068c" },
    ],
  },
  today: [
    { icon: "pen", title: "Open Northfield University: Intellectual Curiosity", meta: "Due in 226 days", action: "Write" },
    { icon: "award", title: "Find scholarships you qualify for", meta: "Filter by major, state, deadline, and background.", action: "Browse" },
    { icon: "mail", title: "Set up a dedicated application inbox", meta: "Use a clean address with your real name. Admissions offices, the application portal, aid forms and sponsors will all write here. Keep it tidy.", action: "Open mail" },
  ],
  timeline: [
    { at: 2, label: "today", kind: "dot" },
    { at: 17, label: "2 milestones", meta: "47d", kind: "pen", badge: 2 },
    { at: 48, label: "2 milestones", meta: "174d", kind: "pen", badge: 2 },
    { at: 59, label: "5 schools", meta: "226d", kind: "schools" },
    { at: 82, label: "Decisions", meta: "316d", kind: "mail", badge: 5 },
    { at: 89, label: "Commit day", meta: "346d", kind: "flag" },
  ],
};

export type Logo = { name: string; style: "serif-caps" | "serif" | "sans-bold" | "block" | "stack" | "script"; color: string; size: "lg" | "sm" };

export const logos = {
  heading: "Over 60,000 students have used Quill to reach these schools.",
  items: [
    { name: "Northfield", style: "serif", color: "#9f1d35", size: "lg" },
    { name: "NTU", style: "block", color: "#a31f34", size: "lg" },
    { name: "Ashford", style: "serif", color: "#00356b", size: "lg" },
    { name: "Kingsley University", style: "stack", color: "#222222", size: "sm" },
    { name: "Penrose", style: "serif", color: "#011f5b", size: "lg" },
    { name: "Harbor City University", style: "serif-caps", color: "#1f3f87", size: "sm" },
    { name: "Westbrook", style: "sans-bold", color: "#8c1515", size: "lg" },
    { name: "Lakeside College", style: "stack", color: "#b31b1b", size: "sm" },
    { name: "Bramwell", style: "script", color: "#4e3629", size: "lg" },
    { name: "Metro State", style: "sans-bold", color: "#57068c", size: "sm" },
    { name: "Calder Tech", style: "block", color: "#ff6c0c", size: "lg" },
    { name: "Elmhurst", style: "serif", color: "#00693e", size: "lg" },
    { name: "Southgate University", style: "serif-caps", color: "#990000", size: "sm" },
    { name: "Riverton", style: "script", color: "#003262", size: "lg" },
    { name: "Oakmont", style: "sans-bold", color: "#012169", size: "sm" },
  ] satisfies Logo[],
};

export const features = {
  title: ["Plan, draft, refine, send.", "All in one."],
  body: "Quill guides you through the full application. Follow every deadline, find scholarships you can win, draft essays with scoring tuned on 450+ admitted examples, and read your whole file before submission night.",
  cards: [
    {
      title: "Every school, every deadline, one timeline",
      body: "Add the schools on your list. Quill gathers the deadlines, maps the year week by week, and tells you what to work on next.",
    },
    {
      title: "Scholarships you qualify for",
      body: "Filter awards by grade, state, major, background, and deadline. Save the ones worth your time. Quill places them on your timeline and reviews each essay when you're ready.",
    },
    {
      title: "Paragraph grades in 60 seconds",
      body: "Six measures: hook, theme, detail, honesty, reflection, writing. You get a percentile against admitted students, and Quill names the exact paragraph pulling your draft down most.",
    },
    {
      title: "The admitted essay nearest yours",
      body: "Side by side with your draft, from a student admitted to Northfield, Westbrook, Ashford or Penrose. 1650+ admitted essays in the library, free on every plan.",
    },
    {
      title: "Edits that still sound like you",
      body: "Quill reads your earlier writing first, then suggests one edit at a time. Accept the line, the paragraph, or the rewrite. Drop whatever doesn't sound like you.",
    },
    {
      title: "A last pass before you submit",
      body: "Final Pass checks every essay, activity, honor, and recommendation on submission day. It shows what's ready and which lines still need one more look, so nothing slips through on the last night.",
    },
  ],
  timeline: {
    title: "Your application year",
    next: "Next: Penrose ED, Nov 1",
    months: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    active: 3,
    chips: [
      { label: "Penrose ED", start: 2, span: 1, tone: "blue" },
      { label: "Harbor EA", start: 3, span: 1, tone: "emerald" },
      { label: "NTU EA", start: 3, span: 1, tone: "amber" },
      { label: "Westbrook RD", start: 4, span: 1, tone: "amber" },
      { label: "Ashford RD", start: 4, span: 1, tone: "neutral" },
    ],
  },
  scholarships: {
    title: "Scholarships you qualify for",
    count: "24 of 361",
    items: [
      { letter: "Q", name: "Bridgeway Match", amount: "Full ride", date: "Sep 26", match: "96%", tone: "emerald" },
      { letter: "C", name: "Civic Leaders Fund", amount: "$20,000", date: "Oct 31", match: "88%", tone: "rose" },
      { letter: "B", name: "Main Street Scholars", amount: "$5,000", date: "Dec 15", match: "81%", tone: "amber" },
      { letter: "J", name: "Horizon Foundation", amount: "$55,000", date: "Nov 18", match: "79%", tone: "blue" },
    ],
  },
  essay: {
    paragraphs: [
      [
        { text: "Last spring, a city council office brought us a problem they " },
        { text: "couldn't fix", mark: "amber" },
        { text: ": their new tool worked in testing but sat unused in practice." },
      ],
      [{ text: "The hard part: getting the people using it to explain their choice.", mark: "emerald" }],
      [
        { text: "I grew up a few miles from city hall. " },
        { text: "Budgets, boards, committees,", mark: "rose" },
        { text: " were the words I heard at dinner." },
      ],
    ],
    comments: [
      { tone: "amber", text: "Hook lands. Specific number, real stakes, a name." },
      { tone: "emerald", text: "This is the thesis. Pull it forward." },
      { tone: "rose", text: "Slides into proper nouns. Show one moment instead." },
    ],
  },
  admitted: {
    tag: "Admitted",
    school: "Northfield '28",
    title: "An Unusual Background",
    paragraphs: [
      "The summer after my first year of high school, I sat in a basement office of the county planning department, watching a pilot program quietly stall. The room held three analysts, two interns, and the smell of burnt coffee. My job, on paper, was to take notes. My job, in practice, was to listen.",
      "Six months later I was writing letters to the local paper about that same program from my bedroom desk. I was sure it would work.",
    ],
    footer: "647 words · Personal statement",
  },
  rewrite: {
    original: [
      { text: "I've always been " },
      { text: "passionate about", cut: true },
      { text: " systems that " },
      { text: "actually work in the real world", cut: true },
      { text: "." },
    ],
    revised: [
      { text: "I've been " },
      { text: "chasing", add: true },
      { text: " systems that " },
      { text: "ship and hold up under pressure", add: true },
      { text: "." },
    ],
    keep: "Keep",
    retry: "Try again",
  },
  finalRead: {
    title: "Final Pass",
    subtitle: "Submission day",
    done: 4,
    total: 6,
    rows: [
      { name: "An Unusual Background", school: "Northfield", ready: true },
      { name: "Intellectual Curiosity", school: "Northfield", ready: true },
      { name: "Roommate Note", school: "Northfield", ready: false },
      { name: "Why Penrose", school: "Penrose", ready: true },
      { name: "Community", school: "Penrose", ready: true },
      { name: "Letter to a roommate", school: "Westbrook", ready: false },
    ],
  },
};

export const faq = {
  title: "Common questions",
  body: "Plain answers on honesty, your voice, pricing, and privacy.",
  items: [
    {
      q: "What does Quill actually do?",
      a: "Quill is the home for your entire college application. Follow deadlines, build your school list, find scholarships and summer programs that fit you, draft essays beside admitted examples, shape your activities and honors, and run a last pass before you submit. It began as an essay grader. Now it's where the whole application lives.",
    },
    {
      q: "How is Quill unlike a chatbot?",
      a: "A general chatbot writes essays for you and forgets everything else about your application. Quill helps you build the full application: school list, deadlines, scholarships, summer programs, essays, activities, honors, and recommendations. Its feedback is tuned on essays that were admitted, and it never writes your essay for you.",
    },
    {
      q: "Is using Quill cheating?",
      a: "No. Quill works like a strong counselor or teacher who reads your draft and tells you what isn't working. It points at weak lines, asks questions, and suggests edits you can accept or reject. The ideas, the stories and the final words stay yours, which is exactly what schools allow when they say you may get feedback.",
    },
    {
      q: "Will my essays still sound like me?",
      a: "Yes. Quill reads samples of your earlier writing before it suggests anything, and every edit is offered one at a time so you choose what stays. Nothing is rewritten without you.",
    },
    {
      q: "Will colleges know I used Quill?",
      a: "There is nothing to detect. You write the essay; Quill gives feedback the way a teacher would. What you submit is your own writing, revised by you.",
    },
    {
      q: "Where do I begin?",
      a: "Add a few schools you're curious about. Quill builds your timeline, shows which essays each school asks for, and gives you one clear next step each week.",
    },
    {
      q: "Can parents use Quill?",
      a: "Yes. Parents can follow progress with the student's permission, and counselors can invite a whole class to keep deadlines and drafts in one shared view.",
    },
    {
      q: "How does the season pass work?",
      a: "The season pass is a single payment that covers one full application cycle, from the first essay in summer to the last decision in spring. It includes unlimited essay grading, every rewrite, the scholarship finder, the timeline, and the Final Pass on submission day. There is no monthly charge and nothing renews on its own. When the cycle ends, your drafts stay in your account so you can export or reuse them for transfer or graduate applications later.",
    },
    {
      q: "Can I buy just a few weeks?",
      a: "Yes. A monthly plan covers short pushes like an early deadline or a scholarship essay sprint. Cancel any time and keep everything you wrote.",
    },
    {
      q: "Where is my data stored?",
      a: "Your drafts and profile are stored on encrypted servers in the United States and are only visible to you and anyone you choose to share them with. We never sell student data, and we never share essays with schools, sponsors or other students. You can download or delete everything from your settings at any time.",
    },
    {
      q: "Do you train AI on my essays?",
      a: "No. Your writing is never used to train any model, ours or anyone else's.",
    },
    {
      q: "Why does Quill exist?",
      a: "Good feedback on an application essay used to depend on knowing the right counselor. We built Quill so every student can get a careful, honest read without paying for private coaching.",
    },
    {
      q: "Can I cancel?",
      a: "Yes. Monthly plans can be cancelled from settings with two clicks, and you keep access until the end of the period you paid for. Season passes don't renew, so there's nothing to cancel. If you run into trouble, write to support and a person will sort it out within a day.",
    },
    {
      q: "Do you offer refunds?",
      a: "Yes. If Quill isn't helping, ask within 14 days for a full refund.",
    },
  ],
};

export const cta = {
  title: "Ready to begin?",
  body: "Your application home, deadline timeline, scholarship finder and one full Quill review of your essay are free. No card, no trial clock.",
  primary: { label: "Grade my essay free", href: "#start" },
  secondary: { label: "See pricing", href: "#pricing" },
};

export const footer = {
  columns: [
    { title: "Product", links: ["Home", "Pricing", "Open app"] },
    { title: "Free tools", links: ["Essay grader", "Admission odds", "Deadline planner", "All tools"] },
    { title: "Explore", links: ["Colleges", "Scholarships", "Summer programs", "Rankings", "Quiz", "Financial aid"] },
    { title: "Resources", links: ["Blog", "Guides", "Play"] },
    { title: "Company", links: ["Contact", "Privacy", "Terms"] },
    { title: "Connect", links: ["Instagram", "Discord"] },
  ],
  disclaimer:
    "Made by former applicants. An independent product, not affiliated with or endorsed by any college or university; every school name shown here is fictional.",
};
