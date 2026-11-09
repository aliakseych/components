import { NotebookCell } from "../index";

export default function Demo() {
  return (
    <div className="w-full max-w-2xl bg-background p-4 text-foreground">
      <NotebookCell
        status="error"
        durationMs={38}
        output={
          <pre className="font-mono text-xs leading-5 whitespace-pre-wrap break-words text-destructive">
            {`Traceback (most recent call last):
  File "cell 2", line 1, in <module>
KeyError: 'region'`}
          </pre>
        }
      />
    </div>
  );
}
