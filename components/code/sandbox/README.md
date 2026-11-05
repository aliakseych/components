# Sandbox

A live browser code playground with an editor, file tree, console and preview, powered by Sandpack.

## Exports

`SandboxProvider`, `SandboxLayout`, `SandboxTabs`, `SandboxTabsList`, `SandboxTabsTrigger`, `SandboxTabsContent`, `SandboxCodeEditor`, `SandboxConsole`, `SandboxPreview`, `SandboxFileExplorer`

Props are typed in `index.tsx`. See `demos/` for a complete example.

## Caveats

- Sandpack loads its bundler from a remote service, so the preview needs internet access.
- It does not follow your app theme automatically. Pass `theme="dark"` or `theme="light"` to `SandboxProvider`.

## Origin

From [Kibo UI](https://www.kibo-ui.com) (MIT). Copy this folder with the `use-component` skill, which also installs its dependencies.
