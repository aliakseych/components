"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
  motion,
  type PanInfo,
  useMotionValue,
  useTransform,
} from "motion/react";
import { ShuffleIcon } from "lucide-react";
import {
  Children,
  cloneElement,
  createContext,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type DeckContextValue = {
  seed: number;
  shuffle: () => void;
};

const DeckContext = createContext<DeckContextValue>({ seed: 0, shuffle: () => {} });

export type DeckProps = HTMLAttributes<HTMLDivElement>;

export const Deck = ({ className, ...props }: DeckProps) => {
  const [seed, setSeed] = useState(0);
  const value = useMemo(
    () => ({ seed, shuffle: () => setSeed(Math.floor(Math.random() * 1_000_000) + 1) }),
    [seed]
  );

  return (
    <DeckContext.Provider value={value}>
      <div className={cn("relative isolate", className)} {...props} />
    </DeckContext.Provider>
  );
};

/** Reorders the cards randomly and starts again from the top. */
export const useDeckShuffle = () => useContext(DeckContext).shuffle;

export type DeckShuffleButtonProps = HTMLAttributes<HTMLButtonElement>;

export const DeckShuffleButton = ({
  className,
  children,
  ...props
}: DeckShuffleButtonProps) => {
  const shuffle = useDeckShuffle();

  return (
    <button
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring",
        className
      )}
      onClick={shuffle}
      type="button"
      {...props}
    >
      <ShuffleIcon className="size-4" />
      {children ?? "Shuffle"}
    </button>
  );
};

/** A deterministic shuffle, so the same seed gives the same order. */
const shuffled = <T,>(items: T[], seed: number) => {
  if (!seed) return items;
  const result = [...items];
  let state = seed;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export type DeckCardsProps = HTMLAttributes<HTMLDivElement> & {
  onSwipe?: (index: number, direction: "left" | "right") => void;
  onSwipeEnd?: (index: number, direction: "left" | "right") => void;
  threshold?: number;
  stackSize?: number;
  perspective?: number;
  scale?: number;
  currentIndex?: number;
  defaultCurrentIndex?: number;
  onCurrentIndexChange?: (index: number) => void;
  animateOnIndexChange?: boolean;
  indexChangeDirection?: "left" | "right";
};

export const DeckCards = ({
  children,
  className,
  onSwipe,
  onSwipeEnd,
  threshold = 150,
  stackSize = 3,
  perspective = 1000,
  scale = 0.05,
  currentIndex: currentIndexProp,
  defaultCurrentIndex = 0,
  onCurrentIndexChange,
  animateOnIndexChange = true,
  indexChangeDirection = "left",
  ...props
}: DeckCardsProps) => {
  const { seed } = useContext(DeckContext);
  const childrenArray = useMemo(
    () => shuffled(Children.toArray(children) as ReactElement[], seed),
    [children, seed]
  );
  const [currentIndex, setCurrentIndex] = useControllableState({
    prop: currentIndexProp,
    defaultProp: defaultCurrentIndex,
    onChange: onCurrentIndexChange,
  });
  const lastSeed = useRef(seed);

  // A shuffle deals the whole deck again.
  useEffect(() => {
    if (lastSeed.current === seed) return;
    lastSeed.current = seed;
    isInternalChangeRef.current = true;
    setCurrentIndex(0);
    setDisplayIndex(0);
  }, [seed, setCurrentIndex]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null
  );
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const isInternalChangeRef = useRef(false);
  const prevIndexRef = useRef(currentIndex);

  // Detect external currentIndex changes and trigger animation
  useEffect(() => {
    const prevIndex = prevIndexRef.current;

    // Skip initial mount and internal changes
    if (prevIndex === currentIndex || isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      prevIndexRef.current = currentIndex;
      setDisplayIndex(currentIndex);
      return;
    }

    // Only animate if the option is enabled and we have cards to show
    if (animateOnIndexChange && prevIndex < childrenArray.length) {
      setExitDirection(indexChangeDirection);

      // Update display index after animation completes
      setTimeout(() => {
        setExitDirection(null);
        setDisplayIndex(currentIndex);
      }, 300);
    } else {
      // No animation, update display index immediately
      setDisplayIndex(currentIndex);
    }

    prevIndexRef.current = currentIndex;
  }, [
    currentIndex,
    animateOnIndexChange,
    indexChangeDirection,
    childrenArray.length,
  ]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (displayIndex >= childrenArray.length) {
        return;
      }

      setExitDirection(direction);

      if (direction === "left") {
        onSwipe?.(displayIndex, "left");
      } else {
        onSwipe?.(displayIndex, "right");
      }

      onSwipeEnd?.(displayIndex, direction);

      // Move to next card after animation
      setTimeout(() => {
        isInternalChangeRef.current = true;
        const newIndex = displayIndex + 1;
        setCurrentIndex(newIndex);
        setDisplayIndex(newIndex);
        setExitDirection(null);
      }, 300);
    },
    [displayIndex, childrenArray.length, onSwipe, onSwipeEnd, setCurrentIndex]
  );

  const visibleCards = childrenArray.slice(
    displayIndex,
    displayIndex + stackSize
  );

  if (displayIndex >= childrenArray.length) {
    return null;
  }

  return (
    <div
      className={cn("relative z-10 size-full", className)}
      style={{ perspective }}
      {...props}
    >
      {visibleCards.map((child, index) => {
        const isTopCard = !index;
        const zIndex = stackSize - index;
        const scaleValue = 1 - index * scale;
        const yOffset = index * 4;
        const cardKey = `${displayIndex}-${child.key ?? index}`;

        if (isTopCard) {
          return (
            <DeckCard
              exitDirection={exitDirection}
              key={cardKey}
              onSwipe={handleSwipe}
              style={{
                zIndex,
                scale: scaleValue,
                y: yOffset,
              }}
              threshold={threshold}
            >
              {child}
            </DeckCard>
          );
        }

        const nextCardScale = index === 1 && exitDirection ? 1 : scaleValue;
        const nextCardY = index === 1 && exitDirection ? 0 : yOffset;

        return (
          <motion.div
            animate={{
              scale: nextCardScale,
              y: nextCardY,
            }}
            className="absolute inset-0"
            key={cardKey}
            style={{
              zIndex,
              scale: scaleValue,
              y: yOffset,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
};

type DeckCardProps = {
  children: ReactElement;
  onSwipe: (direction: "left" | "right") => void;
  threshold: number;
  style?: object;
  exitDirection: "left" | "right" | null;
};

const DeckCard = ({
  children,
  onSwipe,
  threshold,
  style,
  exitDirection,
}: DeckCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(
    x,
    [-200, -threshold, 0, threshold, 200],
    [0, 1, 1, 1, 0]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipeThreshold = threshold;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? "right" : "left";
      onSwipe(direction);
    }
  };

  let exitX = 0;

  if (exitDirection === "left") {
    exitX = -500;
  } else if (exitDirection === "right") {
    exitX = 500;
  }

  const castedChildren = children as ReactElement<
    HTMLAttributes<HTMLDivElement>
  >;

  return (
    <motion.div
      animate={exitDirection ? { x: exitX, opacity: 0 } : undefined}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{
        x,
        rotate,
        opacity,
        ...style,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileDrag={{ scale: 1.05 }}
    >
      {cloneElement(castedChildren, {
        className: cn(
          "h-full w-full select-none rounded-xl shadow-sm",
          castedChildren.props.className
        ),
      })}
    </motion.div>
  );
};

export type DeckItemProps = HTMLAttributes<HTMLDivElement> & {
  /** The other side of the card. A click or Enter flips it. */
  back?: ReactNode;
  backClassName?: string;
};

const FACE =
  "absolute inset-0 flex h-full w-full items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm [backface-visibility:hidden]";

export const DeckItem = ({
  className,
  back,
  backClassName,
  children,
  onClick,
  onKeyDown,
  ...props
}: DeckItemProps) => {
  const [flipped, setFlipped] = useState(false);
  const [moved, setMoved] = useState(false);

  if (back === undefined) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm",
          className
        )}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      aria-pressed={flipped}
      className={cn("relative h-full w-full [perspective:1000px]", className)}
      onClick={(event) => {
        onClick?.(event);
        // A drag that ends over the card shouldn't flip it.
        if (!moved) setFlipped((value) => !value);
        setMoved(false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setFlipped((value) => !value);
        }
      }}
      onPointerDown={() => setMoved(false)}
      onPointerMove={(event) => {
        if (event.buttons) setMoved(true);
      }}
      role="button"
      tabIndex={0}
      {...props}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        <div className={FACE}>{children}</div>
        <div className={cn(FACE, "[transform:rotateY(180deg)]", backClassName)}>{back}</div>
      </div>
    </div>
  );
};

export type DeckEmptyProps = HTMLAttributes<HTMLDivElement>;

export const DeckEmpty = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "absolute inset-0 flex items-center justify-center rounded-xl border border-dashed text-muted-foreground",
      className
    )}
    {...props}
  >
    {children ?? <p className="text-sm">No more cards</p>}
  </div>
);
