'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import './chapter-rail.css';

export type Chapter = { id: string; label: string };

export type ChapterRailProps = {
  /** Sections in page order: the element id and the label shown on hover and focus. */
  chapters: readonly Chapter[];
  /** Height of a fixed header in px; jumps land below it. */
  headerOffset?: number;
  /** Element id (e.g. a footer): the rail fades out as its top passes this share of the viewport. */
  hideBeforeId?: string;
  /** Position CSS: `fixed` to the viewport (default) or `absolute` inside a positioned container. */
  position?: 'fixed' | 'absolute';
  className?: string;
  style?: CSSProperties;
};

/** A chapter counts as reached when its start is this far into the viewport. */
const REACHED = 0.3;
const HIDE_BEFORE = 0.5;

/**
 * Where the reader is on the page, on the right edge: one dot per chapter. The current chapter's
 * dot morphs into a pill that fills as the chapter scrolls by. Clicking a dot jumps to its
 * chapter (smooth, instant under reduced motion). Visible from 80rem up.
 */
export function ChapterRail({ chapters, headerOffset = 0, hideBeforeId, position = 'fixed', className, style }: ChapterRailProps) {
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const starts = useRef<number[]>([]);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const measure = () => {
      starts.current = chapters.map(({ id }, index) => {
        const section = document.getElementById(id);
        if (!section || index === 0) return 0;
        return Math.max(0, Math.round(section.getBoundingClientRect().top + window.scrollY - headerOffset));
      });
      update();
    };
    const update = () => {
      const y = window.scrollY;
      const reach = y + window.innerHeight * REACHED;
      const list = starts.current;
      let current = 0;
      for (let index = 0; index < list.length; index += 1) if (list[index]! <= reach) current = index;
      const end = current + 1 < list.length ? list[current + 1]! : document.documentElement.scrollHeight - window.innerHeight;
      const from = current === 0 ? 0 : list[current]! - window.innerHeight * REACHED;
      const progress = Math.min(1, Math.max(0, (y - from) / Math.max(1, end - window.innerHeight * REACHED - from)));
      fills.current.forEach((fill, index) => {
        if (fill) fill.style.transform = `scaleY(${index < current ? 1 : index === current ? progress : 0})`;
      });
      setActive(current);
      const target = hideBeforeId ? document.getElementById(hideBeforeId) : null;
      setShown(target ? target.getBoundingClientRect().top > window.innerHeight * HIDE_BEFORE : true);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', update);
    };
  }, [chapters, headerOffset, hideBeforeId]);

  const jump = (index: number) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: starts.current[index] ?? 0, behavior: reduced ? 'instant' : 'smooth' });
  };

  return (
    <nav aria-label="Sections" className={cn('chapters', className)} data-position={position} data-shown={shown} inert={!shown} style={style}>
      <ol>
        {chapters.map(({ id, label }, index) => (
          <li key={id}>
            <button
              type="button"
              className="chapter"
              aria-label={label}
              aria-current={index === active ? 'location' : undefined}
              onClick={() => jump(index)}
            >
              <span className="chapter-dot" aria-hidden="true">
                <span className="chapter-fill" ref={(element) => void (fills.current[index] = element)} />
              </span>
              <span className="chapter-label" aria-hidden="true">
                {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
