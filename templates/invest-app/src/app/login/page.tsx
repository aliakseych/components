import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-8 px-5 py-10">
      <div className="flex flex-col items-center text-center">
        <Logo className="scale-125 text-left" />
        <p className="mt-6 text-sm text-muted-foreground">Инвестиции в биржевые товары</p>
      </div>
      <div className="rounded-[28px] bg-card p-6">
        <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
          <LoginForm />
        </Suspense>
      </div>
      <Link href="/register" className="flex min-h-12 items-center justify-center rounded-full bg-card font-medium">
        Создать свой аккаунт
      </Link>
      <Link href="/" className="flex min-h-11 items-center justify-center font-medium text-muted-foreground">
        Смотреть без входа
      </Link>
    </main>
  );
}
