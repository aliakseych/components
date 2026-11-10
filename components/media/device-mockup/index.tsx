'use client';

import { Columns2, Laptop, Smartphone, Tablet, type LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { DEVICE_IDS, type DeviceId, type Finish, type FoldPose } from './devices';
import { DeviceStage, type DeviceScreens } from './device-stage';
import { FoldToggle } from './fold-toggle';
import { springEasing } from './spring';
import './device-mockup.css';

export type { DeviceId, FoldPose } from './devices';
export type { DeviceScreens } from './device-stage';

export type DeviceMockupProps = {
  /** Controlled device. Omit to let the switcher drive it. */
  device?: DeviceId;
  defaultDevice?: DeviceId;
  onDeviceChange?: (device: DeviceId) => void;
  /** Foldable pose: closed (phone) or open (tablet-sized, animated fold). */
  pose?: FoldPose;
  defaultPose?: FoldPose;
  onPoseChange?: (pose: FoldPose) => void;
  /** Titanium finish; `auto` follows the `.dark` class on <html>. */
  finish?: Finish | 'auto';
  /** Content drawn on each device's screen at its natural viewport; missing devices show a skeleton page. */
  screens?: DeviceScreens;
  /** Show the device switcher (and Fold/Unfold button for the foldable). */
  controls?: boolean;
  className?: string;
};

const OPTIONS: Record<DeviceId, { label: string; Icon: LucideIcon }> = {
  laptop: { label: 'Laptop', Icon: Laptop },
  phone: { label: 'Phone', Icon: Smartphone },
  foldable: { label: 'Foldable', Icon: Columns2 },
  tablet: { label: 'Tablet', Icon: Tablet },
};

const SEGMENT_SPRING = springEasing({ stiffness: 420, damping: 30 });
const SEGMENT_STYLE = {
  '--segment-ease': SEGMENT_SPRING.easing,
  '--segment-duration': `${SEGMENT_SPRING.duration}ms`,
} as CSSProperties;

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    setMatch(list.matches);
    const on = () => setMatch(list.matches);
    list.addEventListener('change', on);
    return () => list.removeEventListener('change', on);
  }, [query]);
  return match;
}

function useDarkRoot() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains('dark'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

export function DeviceMockup({
  device: deviceProp,
  defaultDevice = 'laptop',
  onDeviceChange,
  pose: poseProp,
  defaultPose = 'closed',
  onPoseChange,
  finish = 'auto',
  screens = {},
  controls = true,
  className,
}: DeviceMockupProps) {
  const [deviceState, setDeviceState] = useState<DeviceId>(defaultDevice);
  const [poseState, setPoseState] = useState<FoldPose>(defaultPose);
  const device = deviceProp ?? deviceState;
  const pose = poseProp ?? poseState;
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const dark = useDarkRoot();
  const resolved: Finish = finish === 'auto' ? (dark ? 'dark' : 'light') : finish;

  const group = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const active = DEVICE_IDS.indexOf(device);
  useLayoutEffect(() => {
    const root = group.current;
    const pill = indicator.current;
    if (!root || !pill) return;
    const place = () => {
      const target = root.querySelectorAll<HTMLElement>('[data-segment]')[active];
      if (!target) return;
      pill.style.translate = `${target.offsetLeft}px 0`;
      pill.style.width = `${target.offsetWidth}px`;
    };
    place();
    const frame = requestAnimationFrame(() => root.setAttribute('data-segment-ready', ''));
    const observer = new ResizeObserver(place);
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, controls]);

  const select = (next: DeviceId) => {
    setDeviceState(next);
    onDeviceChange?.(next);
  };
  const toggle = () => {
    const next: FoldPose = pose === 'open' ? 'closed' : 'open';
    setPoseState(next);
    onPoseChange?.(next);
  };

  return (
    <div className={cn('hero-demo', className)}>
      {controls && (
        <div className="hero-controls">
          <div ref={group} role="group" aria-label="Device" className="device-switch" style={SEGMENT_STYLE}>
            <span ref={indicator} aria-hidden="true" className="segment-indicator device-switch-indicator" />
            {DEVICE_IDS.map((id) => {
              const { label, Icon } = OPTIONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  data-segment=""
                  aria-pressed={device === id}
                  onClick={() => select(id)}
                  className={cn('device-switch-option', device === id && 'is-active')}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="max-sm:sr-only">{label}</span>
                </button>
              );
            })}
          </div>
          <FoldToggle shown={device === 'foldable'} pose={pose} onToggle={toggle} />
        </div>
      )}
      <div className="w-full">
        <DeviceStage device={device} pose={pose} finish={resolved} screens={screens} reduced={reduced} />
      </div>
    </div>
  );
}
