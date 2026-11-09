import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, Check, ChevronDown, Mic, Plus, Sparkles, SignalHigh } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ExpandingPromptBarModel = { key: string; name: string; icon?: ReactNode };

export type ExpandingPromptBarColors = {
  /** Mic and send button fill. */
  accent?: string;
  /** Card surface. */
  surface?: string;
  /** Focus ring. */
  ring?: string;
};

export type ExpandingPromptBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  models?: readonly ExpandingPromptBarModel[];
  /** Model key. Omit to let the component keep its own selection. */
  model?: string;
  defaultModel?: string;
  onModelChange?: (key: string) => void;
  efforts?: readonly string[];
  /** Effort name. Omit to let the component keep its own selection. */
  effort?: string;
  defaultEffort?: string;
  onEffortChange?: (effort: string) => void;
  /** Chips tucked behind the card's top edge. Clicking one fills the field. */
  suggestions?: readonly string[];
  /** Called when the mic is pressed while the field is empty. */
  onVoice?: () => void;
  /** Called when the + button is pressed. */
  onAttach?: () => void;
  colors?: ExpandingPromptBarColors;
  className?: string;
};

const IDLE_HEIGHT = 46;
const EXPANDED_HEIGHT = 115;
const TEXT_HEIGHT_EXPANDED = 69;
const BUTTON = 32;
const EASE_BACK = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const EASE_CHIP = "cubic-bezier(.4,0,.2,1)";

const reduceMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades and zooms the icon in when it mounts. Used for the mic/send swap. */
function EnterIcon({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current || reduceMotion() || typeof ref.current.animate !== "function") return;
    ref.current.animate(
      [
        { opacity: 0, transform: "scale(0.95)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 300, easing: EASE_BACK },
    );
  }, []);
  return (
    <span ref={ref} className="absolute inset-0 grid place-items-center">
      {children}
    </span>
  );
}

/**
 * A prompt field that rests as a pill and opens into a card on focus or when it has text.
 * Clicking the placeholder focuses the field. Use `colors` to retheme it.
 */
export function ExpandingPromptBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything…",
  models = [],
  model: modelProp,
  defaultModel,
  onModelChange,
  efforts = [],
  effort: effortProp,
  defaultEffort,
  onEffortChange,
  suggestions = [],
  onVoice,
  onAttach,
  colors,
  className,
}: ExpandingPromptBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [innerModel, setInnerModel] = useState(defaultModel ?? models[0]?.key ?? "");
  const [innerEffort, setInnerEffort] = useState(defaultEffort ?? efforts[0] ?? "");

  const modelKey = modelProp ?? innerModel;
  const model = models.find((m) => m.key === modelKey) ?? models[0];
  const effort = effortProp ?? innerEffort;

  const expanded = value.length > 0 || focused || menuOpen;
  const hasValue = value.trim().length > 0;

  const focusField = () => textareaRef.current?.focus();

  const selectModel = (key: string) => {
    if (modelProp === undefined) setInnerModel(key);
    onModelChange?.(key);
    setMenuOpen(false);
  };

  const cycleEffort = () => {
    if (efforts.length === 0) return;
    const next = efforts[(efforts.indexOf(effort) + 1) % efforts.length];
    if (effortProp === undefined) setInnerEffort(next);
    onEffortChange?.(next);
  };

  const submit = () => {
    if (!hasValue) return;
    onSubmit?.(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
    if (event.key === "Escape") textareaRef.current?.blur();
  };

  const style = {
    "--pb-accent": colors?.accent ?? "var(--primary)",
    "--pb-surface": colors?.surface ?? "var(--card)",
    "--pb-ring": colors?.ring ?? "var(--ring)",
  } as CSSProperties;

  const motionStyle = (transition: string): CSSProperties => ({ transition });

  return (
    <div
      className={cn("flex w-full justify-center", className)}
      style={style}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* Sized box. Its width and height animate between pill and card. */}
      <div
        className="relative"
        style={{
          width: expanded ? "min(480px, 100%)" : "min(320px, 100%)",
          height: expanded ? EXPANDED_HEIGHT : IDLE_HEIGHT,
          ...motionStyle(`all 0.4s ${EASE_BACK}`),
        }}
      >
      {/* Suggestions sit behind the card and slide up from under its top edge. */}
      {suggestions.length > 0 && (
        <div
          aria-hidden={!expanded}
          inert={!expanded}
          className={cn(
            "absolute inset-x-3 bottom-full z-0 flex gap-1 overflow-x-auto rounded-t-2xl border border-b-0 bg-muted px-2 pt-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:!transition-none",
          )}
          style={{
            transform: expanded ? "translateY(0)" : "translateY(100%)",
            opacity: expanded ? 1 : 0,
            transition: `transform 0.4s ${EASE_BACK}, opacity 0.3s ease-out`,
          }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              tabIndex={expanded ? 0 : -1}
              onClick={() => {
                onChange(suggestion);
                focusField();
              }}
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-sm whitespace-nowrap text-foreground/50 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--pb-ring)] motion-reduce:!transition-none",
              )}
              style={{ transition: `all 200ms ${EASE_CHIP}` }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* The card. Its corner radius animates between pill and card. */}
      <div
        className="absolute inset-0 z-10 border bg-[var(--pb-surface)] shadow-sm motion-reduce:!transition-none"
        style={{
          borderRadius: expanded ? 16 : IDLE_HEIGHT / 2,
          ...motionStyle(`border-radius 0.4s ${EASE_BACK}`),
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          aria-label={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="absolute inset-x-0 top-0 resize-none bg-transparent px-5 pt-3 pb-0 text-base leading-6 text-foreground outline-none"
          style={{
            height: expanded ? TEXT_HEIGHT_EXPANDED : IDLE_HEIGHT,
            paddingRight: expanded ? 20 : 56,
            ...motionStyle(`height 0.4s ${EASE_BACK}, padding 0.4s ${EASE_BACK}`),
          }}
        />

        {!hasValue && (
          <div
            onClick={focusField}
            className="absolute inset-x-0 top-0 cursor-text px-5 pt-3 text-base leading-6 text-muted-foreground select-none"
            style={{ height: expanded ? TEXT_HEIGHT_EXPANDED : IDLE_HEIGHT, ...motionStyle(`height 0.4s ${EASE_BACK}`) }}
          >
            {placeholder}
          </div>
        )}

        {/* Bottom toolbar, shown when expanded. */}
        <div
          inert={!expanded}
          className="absolute inset-x-0 bottom-0 flex h-[46px] items-center justify-between pr-20 pl-2"
          style={{
            opacity: expanded ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--pb-ring)] motion-reduce:!transition-none [&>svg]:shrink-0"
                style={{ transition: `all 200ms ${EASE_CHIP}` }}
              >
                {model?.icon ?? <Sparkles className="size-4" aria-hidden />}
                <span className="truncate">{model?.name ?? "Model"}</span>
                <ChevronDown className="size-3.5 opacity-60" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-[175px] rounded-xl p-1 shadow-lg duration-150"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              {models.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => selectModel(item.key)}
                  className="flex h-[34px] w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-accent"
                >
                  {item.icon ?? <Sparkles className="size-4" aria-hidden />}
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.key === model?.key && <Check className="size-4" aria-hidden />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {efforts.length > 0 && (
            <button
              type="button"
              onClick={cycleEffort}
              aria-label={`Effort: ${effort}. Change effort`}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--pb-ring)] motion-reduce:!transition-none"
              style={{ transition: `all 200ms ${EASE_CHIP}` }}
            >
              <SignalHigh className="size-4" aria-hidden />
              <span className="whitespace-nowrap">{effort}</span>
            </button>
          )}

          {/* Leaves room on the right for the mic button. */}
          <button
            type="button"
            onClick={onAttach}
            aria-label="Attach"
            className="absolute right-[43px] grid size-8 place-items-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--pb-ring)] motion-reduce:!transition-none"
            style={{ transition: `all 200ms ${EASE_CHIP}` }}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        {/* Round mic/send button. It moves from the pill's right edge to the toolbar. */}
        <div className="absolute right-[7px] z-20" style={{ top: expanded ? EXPANDED_HEIGHT - 8 - BUTTON : 7, ...motionStyle(`top 0.4s ${EASE_BACK}`) }}>
          <button
            type="button"
            onClick={hasValue ? submit : onVoice}
            aria-label={hasValue ? "Send" : "Voice input"}
            className="relative size-8 overflow-hidden rounded-full bg-[var(--pb-accent)] text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-ring)] motion-reduce:!transition-none"
          >
            {hasValue ? (
              <EnterIcon key="send">
                <ArrowUp className="size-4" aria-hidden />
              </EnterIcon>
            ) : (
              <EnterIcon key="mic">
                <Mic className="size-4" aria-hidden />
              </EnterIcon>
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
