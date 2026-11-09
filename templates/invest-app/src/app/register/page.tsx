import Link from "next/link";
import { Logo } from "@/components/logo";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-8 px-5 py-10">
      <div className="flex flex-col items-center text-center">
        <Logo className="scale-125 text-left" />
        <p className="mt-6 text-sm text-muted-foreground">Инвестиции в биржевые товары</p>
      </div>
      <div className="rounded-[28px] bg-card p-6">
        <h1 className="mb-5 text-2xl font-semibold">Создать аккаунт</h1>
        <RegisterForm />
      </div>
      <Link href="/login" className="flex min-h-12 items-center justify-center rounded-full bg-card font-medium">
        Уже есть аккаунт
      </Link>
    </main>
  );
}
