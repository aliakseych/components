// Renders one template screen on its own page, with the template's own stylesheet.
// URL: template.html?t=<slug>&path=<app path>&theme=light|dark
const entries = import.meta.glob<{
  mount: (element: HTMLElement, options: { path: string; theme: string }) => void;
}>("../templates/*/src/preview.tsx");

const params = new URLSearchParams(location.search);
const slug = params.get("t") ?? "";
const load = entries[`../templates/${slug}/src/preview.tsx`];
const root = document.getElementById("root")!;

if (!load) {
  root.textContent = `Template not found: ${slug}`;
} else {
  load().then(({ mount }) => {
    mount(root, { path: params.get("path") ?? "/", theme: params.get("theme") ?? "light" });
    // Screenshots wait for this marker, then for the network to settle.
    const ready = document.createElement("span");
    ready.hidden = true;
    ready.dataset.templateReady = "";
    document.body.append(ready);
  });
}
