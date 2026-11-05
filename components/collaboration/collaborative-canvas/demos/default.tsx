import { CollaborativeCanvas } from "../index";

const users = [
  { id: "sam", name: "Sam Lee", position: { x: 12, y: 18 } },
  { id: "ana", name: "Ana Kim", message: "Can we adjust the color?", position: { x: 36, y: 46 } },
  { id: "max", name: "Max Reed", position: { x: 58, y: 80 } },
];

export default function Demo() {
  return (
    <div className="w-full max-w-2xl rounded-lg border">
      <CollaborativeCanvas users={users} />
    </div>
  );
}
