# Scroll Pill Header

Full header (82px, 76px under 800px) at the top; when the `boundary` element's bottom passes above the viewport (rAF-throttled scroll/resize), a fixed glass pill (blur 16px, radius 45px) slides in from `-110px` (transform 380ms `cubic-bezier(.4,0,.2,1)`, opacity 260ms). Hidden pill is `inert` and `aria-hidden`.

```tsx
const hero = useRef<HTMLDivElement>(null);
<div ref={hero}><ScrollPillHeader boundary={hero} onDark brand={<Logo />} links={[{ label: "Docs", href: "#docs" }]} cta={{ label: "Book a call", href: "#book" }} /></div>
```

- `boundary`: ref or CSS selector; defaults to the header itself.
- `forceShown` pins the pill for previews; `onDark` switches header text to white; `smoothAnchors` smooth-scrolls `#hash` links (instant under reduced motion).
- Header links hide under 800px; the pill keeps them. No transition under reduced motion.
