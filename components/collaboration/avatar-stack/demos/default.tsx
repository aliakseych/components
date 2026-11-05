import { AvatarStack } from "../index";

const people = ["SL", "AK", "MR", "JD"];

export default function Demo() {
  return (
    <AvatarStack animate size={40}>
      {people.map((initials, index) => (
        <span
          className="flex size-full items-center justify-center rounded-full bg-muted font-medium text-xs"
          key={initials}
          style={{ zIndex: people.length - index }}
        >
          {initials}
        </span>
      ))}
    </AvatarStack>
  );
}
