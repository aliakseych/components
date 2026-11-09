import { auth5ExampleProps } from "@/components/workspace/auth-05";
import { SignInSplit } from "../index";

export default function Demo() {
  return (
    <SignInSplit form={{ ...auth5ExampleProps, productName: "Acme Analytics" }}>
      <blockquote className="text-sm leading-relaxed">
        Signing in is quick now. The team stopped asking for password resets the week we switched.
      </blockquote>
      <figcaption className="mt-3 text-sm">
        <span className="font-medium">Sarah Chen</span>
        <span className="text-muted-foreground"> · Operations lead, Northwind</span>
      </figcaption>
    </SignInSplit>
  );
}
