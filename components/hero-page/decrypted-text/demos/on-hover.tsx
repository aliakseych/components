import { DecryptedText } from "../index";

export default function Demo() {
  return (
    <p className="text-lg">
      <DecryptedText text="Hover to scramble this line" animateOn="hover" characters="=+xX0S8#@" />
    </p>
  );
}
