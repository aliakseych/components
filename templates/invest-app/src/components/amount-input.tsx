"use client";

export function AmountInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-baseline justify-center gap-2 py-4">
      <input
        aria-label="Сумма вложения"
        inputMode="numeric"
        className="w-full min-w-0 bg-transparent text-center text-4xl font-semibold tabular outline-none placeholder:text-muted-foreground/50"
        placeholder="0"
        value={value ? value.toLocaleString("ru-RU") : ""}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 13)))}
      />
      <span className="text-muted-foreground">сум</span>
    </div>
  );
}
