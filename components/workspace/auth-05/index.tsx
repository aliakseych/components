import { Auth5, type Auth5Props } from "@/components/dashboardblocks/auth/auth-05";

export * from "@/components/dashboardblocks/auth/auth-05";

export type Auth5FormProps = Auth5Props & {
  /** Fit a column of a split layout instead of a full viewport. Default `false`. */
  embedded?: boolean;
};

/** Auth5, optionally sized to a column. The default output matches Auth5 exactly. */
export function Auth5Form({ embedded = false, ...props }: Auth5FormProps) {
  return (
    <div className={embedded ? "w-full [&>div]:min-h-0" : undefined}>
      <Auth5 {...props} />
    </div>
  );
}
