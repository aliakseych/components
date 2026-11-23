// Placeholder copy, kept at the length of the reference so line breaks and rhythm match.
export const hero = {
  eyebrows: ["For shops that already sell", "For shops that plan to sell"],
  title: "Your own online store.",
  sub: "Products, checkout, local payments, delivery, orders, and your sales channels — in one place.",
  pains: [
    { title: "The store is yours", body: "Catalog, orders, and customers stay in your business." },
    { title: "Sell on any platform", body: "Your site, social apps, or a marketplace. The store is still yours." },
    { title: "The margin stays with you", body: "A sale on your store doesn't pay a marketplace commission." },
  ],
};

export const design = {
  title: "Use a theme, or build your own",
  sub: "Start on a ready-made theme, or build a custom storefront on our APIs.",
};

export const products = {
  eyebrow: "Your products",
  title: "Make your products shine",
  sub: "Add polished product images and descriptions.",
};

export const paid = {
  title: "Accepting payment is easy",
  sub: "All you need is a bank account.",
};

export const connections = {
  title: "Payments and delivery your customers already use.",
  sub: "Cards, wallets, and local couriers are available now. Marketplace sync connects in a later step.",
  rows: [
    { label: "Payment integrations", title: "Cards, wallets, and BNPL options at checkout.", art: "cards" },
    { label: "Logistics and courier", title: "Three courier partners, set up for how you ship.", art: "couriers" },
    { label: "Marketplaces", badge: "Roadmap", title: "Four marketplaces kept in sync with your catalog", art: "app" },
  ] as const,
};

export const advantages = {
  eyebrow: "Marlo advantages",
  title: "Run every channel from one place",
  sub: "Your store, socials, and marketplaces share one catalog, one order queue, and your customers.",
  items: [
    { title: "Your own channel", body: "Sell on your site and on socials. Those orders pay no marketplace commission." },
    { title: "Local checkout", body: "Cards, wallets, and BNPL at checkout, so more orders get finished." },
    { title: "One admin", body: "One catalog and one order queue. No copying orders between dashboards." },
    { title: "Marketplaces too", body: "Marketplace sync is on the roadmap, beside your store and socials." },
    { title: "Economics first", body: "We compare marketplace fees and direct-channel costs before we propose the build." },
    { title: "Set up locally", body: "We configure payments, delivery, and fiscalization within your project scope." },
  ],
  stats: [
    { value: "Agreed", title: "Setup fee", body: "One-time fee, set in the proposal" },
    { value: "Scope", title: "Operations", body: "Support and fees — in the proposal" },
    { value: "Phased", title: "Handover", body: "Discover, launch, then hand over" },
  ],
};

export const testimonial = {
  label: "Northwind",
  quote: "Marlo made running our online store easier, so we could focus on our customers and products.",
  name: "Alex",
  role: "CMO of Northwind Toys",
};

export const features = {
  title: "Found in search. Back for the next order.",
  sub: "Search setup, repeat orders, and local checkout live in the store — not in extra tools.",
  items: [
    { title: "Built-in search", body: "Titles, descriptions, and product indexing ship with the catalog." },
    { title: "Customers you can reach again", body: "Order history and who is ready to buy again feed email and retargeting." },
    { title: "Checkout people here already use", body: "Cards, BNPL, and courier delivery, with a price and tracking." },
  ],
  cardTitle: "The same catalog, on every shelf",
  cardBody: "Merchant feeds, analytics, and ads read from your store. Marketplace sync with four big platforms is on the roadmap.",
};

export const compare = {
  title: "Compare your sales channels",
  sub: "A shop ties up capital. A marketplace rents the customer. Your own store keeps the relationship.",
  closer: "Marketplaces can stay in the mix. Marlo is the channel you own.",
  columns: {
    physical: { name: "Physical store", verdict: "Ties up capital" },
    marketplace: { name: "Marketplace", verdict: "Rents the customer" },
    own: { name: "Marlo", verdict: "You keep the channel", badge: "Best fit" },
  },
  rows: [
    { label: "Customer ownership", physical: "Direct relationship", marketplace: "Platform-controlled", own: "First-party data" },
    { label: "Scalability", physical: "Another location", marketplace: "Platform rules", own: "Grows without a new shop" },
    { label: "Operating hours", physical: "10–12 hours a day", marketplace: "24/7", own: "24/7" },
    { label: "What you pay", physical: "Rent, staff, fit-out", marketplace: "A commission on every order", own: "Agreed in the proposal" },
  ],
};

export const blog = {
  title: "Blog",
  sub: "Catalog, channels, and orders for new and existing shops.",
  more: "See all posts",
  posts: [
    { title: "Building on rented land: who owns the customer in the e-commerce boom?", date: "08.11.2026", href: "#blog" },
  ],
};

export const faq = {
  title: "FAQs",
  openId: "go-live",
  items: [
    { id: "go-live", q: "When can I start selling?", a: "After a short discovery call you get a milestone plan. Implementation starts only once that plan is agreed. Most of the wait is your catalog and payments, not the storefront." },
    { id: "catalog", q: "What happens to my existing products?", a: "We move your products, prices, and photos. You do not re-enter them by hand. During discovery we check SKUs, variants, and image quality, then the proposal says exactly what can move." },
    { id: "payments", q: "Do I need to manage payments and taxes myself?", a: "No. Card acquiring and BNPL are built in, and we set up the payment and fiscalization providers in your scope. We confirm which providers and tax rules apply before the contract." },
    { id: "developer", q: "Do I need to hire a technical person?", a: "You do not hire a developer for this. Marlo does the implementation. You need one person who can answer questions about products, prices, and how you deliver." },
    { id: "data", q: "Who owns my customer data?", a: "Your business does. Orders from your storefront, social networks, and marketplaces sit in one queue, and the customer record stays with you. Where data is stored and who can access it is written into the solution." },
    { id: "fit", q: "Is Marlo a fit for a simple website?", a: "No. Marlo implements e-commerce systems for businesses that sell products. We do not take standalone branding, logo, portfolio, or brochure-website projects." },
  ],
};

export const cta = {
  title: "Get a plan for a store that takes real orders",
  sub: "In 30 minutes you get a written plan: channels, what we set up, and what it takes. No commitment.",
  company: "Company name",
  phone: "Phone number",
  phonePlaceholder: "+1 555 010 0123",
  submit: "Get my launch plan",
  note: "We'll call within one business day. No commitment.",
  privacy: "We'll use this number only to call you about this assessment.",
  privacyLink: "Privacy notice",
  thanks: "Thanks — we'll call you within one business day.",
};

export const consent = {
  ariaLabel: "Analytics and advertising choices",
  title: "Your privacy choices",
  body: "Optional analytics, advertising tools and session replay help us understand how people find Marlo, measure campaigns and improve the site. We do not send your form contact details to these tools.",
  link: "Read the privacy notice",
  deny: "Only necessary",
  allow: "Allow analytics",
};
