# Cloudlet Toaster

Island-style notifications from [Cloudlet](https://cloudlet.dev/toaster) (`@cloudlet/toast`, MIT). Theme tokens are mapped in `toaster.css`; motion respects `prefers-reduced-motion` inside the package.

```tsx
const controller = useCloudletController();
controller?.show({ title: "Saved", kind: "success" });
{controller && <CloudletToaster controller={controller} position="top-center" />}
```

Props: `controller` plus all `@cloudlet/toast` `Toaster` props (`position`, `theme`, `container`, `offsets`, …).
