"use client";

import { resetClientSession } from "@/lib/client-session";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      className="h-12 w-full rounded-full"
      onClick={async () => {
        await api("/auth/logout/", { method: "POST" });
        // Главная в кэше могла сохраниться с балансом — убираем перед уходом.
        await resetClientSession();
        router.push("/login");
        router.refresh();
      }}
    >
      <LogOut />
      Выйти
    </Button>
  );
}
