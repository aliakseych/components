# Device Mockup

Laptop, phone, foldable and tablet in one parametric shell. Switching devices morphs the geometry on a spring (CSS `linear()` easing); the foldable folds and unfolds with two 3D leaves; a pill indicator slides under the active switch segment.

```tsx
<DeviceMockup defaultDevice="phone" screens={{ phone: <MyApp /> }} />
```

Props: `device`/`defaultDevice`/`onDeviceChange`, `pose`/`defaultPose`/`onPoseChange` (foldable `closed|open`), `finish` (`light|dark|auto`, auto follows `.dark` on `<html>`), `screens` (React node per device, rendered at the device's natural viewport and scaled to cover the glass; skeleton page otherwise), `controls`.

Reduced motion: the morph and fold are replaced by a fade-through swap.

Device colors are physical material gradients, converted to oklch. Anatomy credit: react-mockframe and Marvel devices.css (MIT).
