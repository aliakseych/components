"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AvatarStack } from "@/components/collaboration/avatar-stack";
import {
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from "@/components/collaboration/cursor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type CanvasUser = {
  id: string;
  name: string;
  avatar?: string;
  message?: string;
  /** Cursor position as a percentage of the canvas. */
  position: { x: number; y: number };
};

export type CollaborativeCanvasProps = {
  users: CanvasUser[];
  /** Moves cursors randomly. For demos and marketing pages, not live data. */
  simulate?: boolean;
  children?: ReactNode;
  className?: string;
};

const colors = [
  { foreground: "text-chart-4", background: "border bg-card" },
  { foreground: "text-chart-1", background: "border bg-card" },
  { foreground: "text-chart-2", background: "border bg-card" },
];

const randomPosition = () => ({
  x: Math.floor(Math.random() * 80) + 10,
  y: Math.floor(Math.random() * 80) + 10,
});

export const CollaborativeCanvas = ({
  users,
  simulate = false,
  children,
  className,
}: CollaborativeCanvasProps) => {
  const [simulated, setSimulated] = useState<
    Record<string, CanvasUser["position"]>
  >({});

  useEffect(() => {
    if (
      !simulate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setSimulated(
        Object.fromEntries(users.map((user) => [user.id, randomPosition()]))
      );
    }, 3000);
    return () => window.clearInterval(id);
  }, [simulate, users]);

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(var(--color-border),transparent_1px)] [background-size:16px_16px]",
        className
      )}
    >
      {children}
      <div className="absolute top-4 right-4">
        <AvatarStack animate size={32}>
          {users.map((user) => (
            <Avatar key={user.id}>
              <AvatarImage alt={user.name} src={user.avatar} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarStack>
      </div>
      {users.map((user, index) => {
        const color = colors[index % colors.length];
        const position = simulated[user.id] ?? user.position;

        return (
          <Cursor
            className="absolute transition-all duration-1000 motion-reduce:transition-none"
            key={user.id}
            style={{ top: `${position.y}%`, left: `${position.x}%` }}
          >
            <CursorPointer className={color.foreground} />
            <CursorBody
              className={cn(
                color.background,
                color.foreground,
                "gap-1 px-3 py-2"
              )}
            >
              <CursorName>{user.name}</CursorName>
              {user.message && <CursorMessage>{user.message}</CursorMessage>}
            </CursorBody>
          </Cursor>
        );
      })}
    </div>
  );
};
