import { FaqStack } from "../index";

const items = [
  { question: "How is pricing structured?", answer: "One monthly plan covers the whole workspace, with no per-user fees and no lock-in. Pricing is shared during your first demo." },
  { question: "Will everyone need training?", answer: "Not really. Teammates keep using their usual channels and the assistant posts updates there on your behalf." },
  { question: "How does it learn about payments?", answer: "It reads notification emails you forward to it. It never signs in to a financial account or moves funds." },
  { question: "What if a flag turns out to be mistaken?", answer: "Each flag cites the records behind it and the time it was raised. Nobody else is notified until you approve." },
  { question: "Who has access to my information?", answer: "Just a small support group, and only on request. Your content is never used to improve other customers’ models." },
  { question: "Can I take my data back and cancel?", answer: "Access is read-only, so cancelling is simple: we cut the links and erase stored copies after a short confirmation." },
  { question: "We already employ a scheduler and a bookkeeper.", answer: "They stay in their roles. The assistant simply saves you from asking for status and brings it to you instead." },
  { question: "Our team uses another messaging tool.", answer: "Describe your setup during the demo and we’ll confirm which integrations exist and how the assistant would slot in." },
];

export default function Demo() {
  return <FaqStack title="Common questions from managers" items={items} />;
}
