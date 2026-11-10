# Chapter Rail

A fixed rail on the right edge with one dot per page section. The current dot morphs into a pill (spring-like cubic-bezier) whose fill follows scroll progress through the chapter; hovering or focusing a dot shows its label; clicking jumps to the section.

```tsx
<ChapterRail chapters={[{ id: 'intro', label: 'Intro' }, { id: 'faq', label: 'FAQ' }]} hideBeforeId="footer" />
```

Props: `chapters`, `headerOffset` (px), `hideBeforeId` (rail fades out when that element nears the top), `position` (`fixed` or `absolute`). Shown from 80rem wide. Under `prefers-reduced-motion` transitions are off and jumps are instant.
