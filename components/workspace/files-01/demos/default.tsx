import { Files1, files1ExampleProps } from "../index";

const UPLOAD_MS = 1500;
const STEPS = 15;

/** Fake upload: reports progress over ~1.5 s, resolves with a demo URL, aborts on cancel. No network. */
function demoUpload(
  file: File,
  { onProgress, signal }: { onProgress: (progress: number) => void; signal: AbortSignal },
) {
  return new Promise<{ url: string }>((resolve, reject) => {
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      onProgress(Math.min(step / STEPS, 1));
      if (step >= STEPS) {
        clearInterval(timer);
        resolve({ url: `https://example.com/uploads/${encodeURIComponent(file.name)}` });
      }
    }, UPLOAD_MS / STEPS);
    signal.addEventListener(
      "abort",
      () => {
        clearInterval(timer);
        reject(signal.reason ?? new DOMException("Upload canceled", "AbortError"));
      },
      { once: true },
    );
  });
}

export default function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <Files1 {...files1ExampleProps} upload={demoUpload} />
    </div>
  );
}
