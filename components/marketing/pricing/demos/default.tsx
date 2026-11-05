import { PricingTiers } from "../index";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "For personal projects.",
    price: { monthly: "Free", yearly: "Free" },
    features: ["5 projects", "Email support"],
    cta: "Get started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams.",
    price: { monthly: 90, yearly: 75 },
    features: ["Unlimited projects", "Priority support", "Team roles"],
    cta: "Choose Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For larger companies.",
    price: { monthly: "Contact us", yearly: "Contact us" },
    features: ["Single sign-on", "Audit logs", "Dedicated support"],
    cta: "Contact sales",
  },
];

export default function Demo() {
  return <PricingTiers className="max-w-4xl pt-3" plans={plans} />;
}
