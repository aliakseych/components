import { BackButton } from "@/components/back-button";

export function PageHeader({ title, back, children }: { title?: string; back?: string; children?: React.ReactNode }) {
  return (
    <header className="relative flex min-h-14 items-center gap-3 px-4 pt-2">
      {back && (
        <BackButton fallback={back} />
      )}
      {title && (
        <h1 className={back ? "absolute inset-x-16 text-center text-base font-semibold" : "text-3xl font-semibold"}>
          {title}
        </h1>
      )}
      {children && <div className="relative ml-auto flex items-center">{children}</div>}
    </header>
  );
}
