import { TestimonialImageWheel, type TestimonialReview } from "../index";

const reviews: TestimonialReview[] = [
  {
    id: "ines",
    name: "Ines Duarte",
    role: "Head of Support",
    country: "Portugal",
    quote: "Our support queue halved in the first month. The replies read like we wrote them.",
    initials: "ID",
    rating: 5,
  },
  {
    id: "kenji",
    name: "Kenji Mori",
    role: "Operations lead",
    country: "Japan",
    quote: "Setup took an afternoon, and the reporting view answered the questions our leads kept asking.",
    initials: "KM",
    rating: 5,
  },
  {
    id: "amara",
    name: "Amara Okafor",
    role: "Operations manager",
    country: "Nigeria",
    quote: "Works on a slow connection, and the offline notes saved us during a week of outages.",
    initials: "AO",
    rating: 4,
  },
  {
    id: "lucas",
    name: "Lucas Ferreira",
    role: "Shop owner",
    country: "Brazil",
    quote: "We run three shops on one workspace now. Permissions per store were the feature we needed.",
    initials: "LF",
    rating: 5,
  },
  {
    id: "hannah",
    name: "Hannah Weiss",
    role: "People lead",
    country: "Canada",
    quote: "The onboarding checklist got our new hires productive in days rather than weeks.",
    initials: "HW",
    rating: 5,
  },
  {
    id: "priya",
    name: "Priya Nair",
    role: "Field sales manager",
    country: "India",
    quote: "Fast to learn, and the mobile app is good enough that field teams stopped asking for a desktop.",
    initials: "PN",
    rating: 4,
  },
  {
    id: "oskar",
    name: "Oskar Lindqvist",
    role: "Product designer",
    country: "Sweden",
    quote: "The templates are sharp enough that we ship client work without a second design pass.",
    initials: "OL",
    rating: 5,
  },
  {
    id: "tane",
    name: "Tane Walker",
    role: "Founder",
    country: "Australia",
    quote: "I set it up between flights. Two weeks later the whole team was using it without me.",
    initials: "TW",
    rating: 5,
  },
  {
    id: "zanele",
    name: "Zanele Dube",
    role: "Clinic director",
    country: "South Africa",
    quote: "Appointment reminders cut our no-show rate by a third. Patients actually reply to them.",
    initials: "ZD",
    rating: 5,
  },
  {
    id: "mateo",
    name: "Mateo Ruiz",
    role: "Logistics coordinator",
    country: "Mexico",
    quote: "Dispatch and invoices live in one place now. The exports still need a little more polish.",
    initials: "MR",
    rating: 4,
  },
];

export default function Demo() {
  return (
    <div className="w-full bg-background px-4 py-12 sm:px-8">
      <TestimonialImageWheel reviews={reviews} href="/reviews" />
    </div>
  );
}
