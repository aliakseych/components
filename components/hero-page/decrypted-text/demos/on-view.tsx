import { DecryptedText } from "../index";

export default function Demo() {
  return (
    <h2 className="text-center text-3xl font-semibold text-balance">
      <DecryptedText
        text="Ask anything about your data"
        animateOn="view"
        sequential
        revealDirection="start"
        speed={35}
        characters="=+xX0S8#@"
      />
    </h2>
  );
}
