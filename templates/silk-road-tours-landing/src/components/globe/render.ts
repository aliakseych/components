// Builds the journey map's pins and panel views in the browser from the parsed places data. Strings come from the
// caller (see sample/content.ts); media and data paths resolve through RenderOptions so assets stay bundled.
import { textFor, type Journey, type Place, type MediaPhoto, type Leg, type Attraction } from './schema';

export interface Labels {
  stopOf: string; highlightsLabel: string; bestTime: string; highsLabel: string; goodMonth: string; source: string;
  legTime: string; hours: string; hoursMinutes: string; photos: string; enlarge: string; prev: string; next: string;
  hl: Record<string, string>; mode: Record<string, string>; kind: Record<string, string>;
}
export interface RenderOptions {
  locale: string;
  lang: string;
  /** URL of photo `key` at width `w`. */
  media: (key: string, w: number) => string;
  /** URL of a data path from the places file (craft cutouts). */
  asset: (path: string) => string;
  labels: Labels;
}

const WIDTHS = [640, 1280];
const icons = import.meta.glob<string>('/src/assets/icons/*.webp', { eager: true, query: '?url', import: 'default' });
const ICONS: Record<Attraction['kind'], string> = { historical: 'dome', natural: 'mountain', craft: 'rishtan-plate', food: 'kazan', modern: 'city' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
const ARROW_L = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7" /></svg>';
const ARROW_R = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>';


export function renderJourney(root: HTMLElement, j: Journey, o: RenderOptions) {
  const L = o.labels;
  const photo = (p: MediaPhoto, alt: string, sizes: string, cls: string, eager = false) => {
    const ws = WIDTHS.filter((w) => w <= p.w);
    const list = ws.length ? ws : [p.w];
    const set = list.map((w) => `${o.media(p.key, w)} ${w}w`).join(', ');
    return `<figure class="m-0 ${cls}"><picture><source type="image/webp" srcset="${set}" sizes="${sizes}" />`
      + `<img src="${o.media(p.key, list[list.length - 1])}" alt="${esc(alt)}" width="${p.w}" height="${p.h}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" class="h-auto w-full" /></picture></figure>`;
  };
  const stops = j.places.filter((p) => p.kind === 'stop');
  const names = new Map(j.places.map((p) => [p.id, textFor(p, o.locale).name]));

  const hours = (h: number) => {
    let hh = Math.floor(h), m = Math.round(((h - hh) * 60) / 10) * 10;
    if (m === 60) { hh += 1; m = 0; }
    return m ? fill(L.hoursMinutes, { h: hh, m }) : fill(L.hours, { h: hh });
  };
  const legText = (l: Leg) => fill(L.legTime, { time: hours(l.hours), mode: L.mode[l.mode] ?? l.mode });
  const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

  const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2025, i, 15)));
  const narrowFmt = new Intl.DateTimeFormat(o.lang, { month: 'narrow', timeZone: 'UTC' });
  // ja/ko narrow months carry a suffix ("10月"): keep the digits so 12 columns fit at 375px.
  const narrow = (d: Date) => { const s = narrowFmt.format(d); return /\d/.test(s) ? s.replace(/\D/g, '') : s; };
  const long = new Intl.DateTimeFormat(o.lang, { month: 'long', timeZone: 'UTC' });
  const deg = new Intl.NumberFormat(o.lang, { maximumFractionDigits: 0 });

  function pin(p: Place) {
    const t = textFor(p, o.locale);
    const label = t.craft ? `${t.name}. ${t.craft}` : t.name;
    return `<button type="button" class="j-pin j-city" data-j-city="${p.id}" data-kind="${p.kind}" aria-label="${esc(label)}" hidden>`
      + `<span class="j-pin-body" aria-hidden="true"><span class="j-disc">${photo(p.photos[0], '', '96px', 'j-disc-photo', true)}</span>`
      + (p.craft ? `<img src="${esc(o.asset(p.craft))}" alt="" width="128" height="128" loading="eager" decoding="async" class="j-craft" />` : '')
      + `</span><span class="j-name" aria-hidden="true">${esc(t.name)}</span>`
      + `<span class="j-tip" aria-hidden="true"><strong>${esc(t.name)}</strong>${t.craft ? `<span>${esc(t.craft)}</span>` : ''}</span></button>`;
  }
  function attrPin(p: Place, a: Attraction) {
    const name = textFor(p, o.locale).attractions?.[a.id]?.name ?? a.id;
    const disc = a.photo
      ? `<span class="j-disc">${photo(a.photo, '', '96px', 'j-disc-photo')}</span>`
      : `<span class="j-disc is-icon"><img src="${icons[`/src/assets/icons/${ICONS[a.kind]}.webp`]}" alt="" width="36" height="36" loading="lazy" decoding="async" /></span>`;
    return `<button type="button" class="j-pin j-attr" data-j-attr="${p.id}/${a.id}" aria-label="${esc(name)}" hidden>`
      + `<span class="j-pin-body" aria-hidden="true">${disc}</span><span class="j-tip" aria-hidden="true"><strong>${esc(name)}</strong></span></button>`;
  }
  function cityView(p: Place) {
    const t = textFor(p, o.locale);
    const leg = j.legs.find((l) => l.to === p.id);
    const kicker = p.kind === 'stop' ? fill(L.stopOf, { n: p.order ?? 0, total: stops.length }) : '';
    let h = `<div class="j-view" data-j-view="${p.id}" data-title="${esc(t.name)}" data-kicker="${esc(kicker)}" hidden>`
      + photo(p.photos[0], t.name, '(min-width: 1024px) 360px, 100vw', 'j-hero')
      + `<p class="text-sm text-ink-2">${esc(t.tagline)}</p>`
      + (leg ? `<p class="j-leg">${esc(names.get(leg.from) ?? leg.from)} → ${esc(t.name)} · ${esc(legText(leg))}</p>` : '')
      + `<dl class="j-highlights" aria-label="${esc(L.highlightsLabel)}">`
      + t.highlights.map((x) => `<div class="j-hl"><dt class="j-hl-label">${esc(L.hl[x.label] ?? x.label)}</dt><dd class="j-hl-text">${esc(x.text)}</dd></div>`).join('')
      + '</dl>';
    if (p.climate) {
      const c = p.climate;
      h += `<section class="mt-4"><h4 class="j-sub">${esc(L.bestTime)}</h4><ol class="j-months" aria-label="${esc(L.highsLabel)}">`
        + months.map((d, i) => {
          const good = p.bestMonths?.includes(i + 1);
          return `<li class="j-month${good ? ' is-good' : ''}"><span class="sr-only">${esc(long.format(d))}${good ? `, ${esc(L.goodMonth)}` : ''}: </span>`
            + `<span aria-hidden="true" class="j-month-l">${esc(narrow(d))}</span><span class="j-month-t">${deg.format(c.highC[i])}°</span></li>`;
        }).join('')
        + `</ol><p class="mt-2 text-xs text-ink-2">${esc(t.bestTimeNote ?? '')} <a href="${esc(c.source)}" target="_blank" rel="noopener" class="py-3 underline decoration-sand underline-offset-2">${esc(fill(L.source, { host: host(c.source) }))}</a></p></section>`;
    }
    if (t.body?.length) h += `<div class="j-text mt-4 text-sm leading-relaxed text-ink-2">${t.body.map((x) => `<p>${esc(x)}</p>`).join('')}</div>`;
    return `${h}</div>`;
  }
  function attrView(p: Place, a: Attraction) {
    const t = textFor(p, o.locale), copy = t.attractions ?? {}, c = copy[a.id];
    // Slides: the attraction's own photo first, then the place's other photos; each slide's note is its own blurb.
    const list = [a.photo, ...p.photos].filter((x): x is MediaPhoto => Boolean(x));
    const slides = list.filter((x, i) => list.findIndex((y) => y.key === x.key) === i).map((ph) => {
      const other = p.attractions.find((x) => x.photo?.key === ph.key), oc = other && copy[other.id];
      return { ph, title: oc ? oc.name : t.name, note: oc ? oc.blurb : t.tagline };
    });
    return `<div class="j-view" data-j-view="${p.id}/${a.id}" data-title="${esc(c?.name ?? a.id)}" data-kicker="${esc(`${t.name} · ${L.kind[a.kind] ?? a.kind}`)}" hidden>`
      + `<p class="j-desc" data-lenis-prevent>${esc(c?.blurb ?? '')}</p>`
      + (slides.length ? `<div class="j-slider" role="group" aria-label="${esc(L.photos)}"><ul class="j-slides" data-j-slides>`
        + slides.map((s) => `<li class="j-slide"><button type="button" class="j-slide-btn" data-j-slide data-title="${esc(s.title)}" data-note="${esc(s.note)}" aria-label="${esc(fill(L.enlarge, { name: s.title }))}">`
          + `${photo(s.ph, s.title, '(min-width: 1024px) 300px, 70vw', 'j-slide-photo')}</button></li>`).join('')
        + '</ul>'
        + (slides.length > 1 ? `<button type="button" class="j-arrow is-prev" data-j-prev aria-label="${esc(L.prev)}">${ARROW_L}</button><button type="button" class="j-arrow is-next" data-j-next aria-label="${esc(L.next)}">${ARROW_R}</button>` : '')
        + '</div>' : '')
      + '</div>';
  }

  root.querySelector('[data-j-pins]')!.innerHTML = j.places.map(pin).join('') + j.places.flatMap((p) => p.attractions.map((a) => attrPin(p, a))).join('');
  root.querySelector('[data-j-body]')!.innerHTML = j.places.map((p) => cityView(p) + p.attractions.map((a) => attrView(p, a)).join('')).join('');
}
