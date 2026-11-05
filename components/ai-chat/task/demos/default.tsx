import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "../index";

export default function Demo() {
  return (
    <Task className="w-full max-w-xl">
      <TaskTrigger title="Updating the pricing page" />
      <TaskContent>
        <TaskItem>Found <TaskItemFile>pricing.tsx</TaskItemFile></TaskItem>
        <TaskItem>Changed the yearly discount</TaskItem>
      </TaskContent>
    </Task>
  );
}
