import {
  SandboxCodeEditor,
  SandboxLayout,
  SandboxPreview,
  SandboxProvider,
  SandboxTabs,
  SandboxTabsContent,
  SandboxTabsList,
  SandboxTabsTrigger,
} from "../index";

const files = {
  "/App.js": `export default function App() {
  return <h1>Hello from the sandbox</h1>;
}`,
};

export default function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <SandboxProvider
        files={files}
        template="react"
        theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
      >
        <SandboxLayout>
          <SandboxTabs defaultValue="code">
            <SandboxTabsList>
              <SandboxTabsTrigger value="code">Code</SandboxTabsTrigger>
              <SandboxTabsTrigger value="preview">Preview</SandboxTabsTrigger>
            </SandboxTabsList>
            <SandboxTabsContent value="code">
              <SandboxCodeEditor />
            </SandboxTabsContent>
            <SandboxTabsContent value="preview">
              <SandboxPreview />
            </SandboxTabsContent>
          </SandboxTabs>
        </SandboxLayout>
      </SandboxProvider>
    </div>
  );
}
