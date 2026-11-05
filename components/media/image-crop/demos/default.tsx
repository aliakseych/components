import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CropIcon, ImageIcon, RotateCcwIcon } from "lucide-react";
import { ImageCrop, ImageCropApply, ImageCropContent, ImageCropReset } from "../index";

// A sample photo: its colors are image data rather than theme tokens.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><defs><linearGradient id="s" x2="0" y2="1"><stop stop-color="#27272a"/><stop offset="1" stop-color="#a1a1aa"/></linearGradient></defs><rect width="640" height="400" fill="url(#s)"/><circle cx="470" cy="120" r="42" fill="#f4f4f5"/><path d="M0 300 170 150l120 110 90-70 260 170v40H0z" fill="#52525b"/><path d="M0 400v-50l210-90 170 70 90-40 170 60v50z" fill="#18181b"/></svg>`;
const file = new File([svg], "cover.svg", { type: "image/svg+xml" });

export default function Demo() {
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [result, setResult] = useState<string>();

  return (
    <Card className="w-full max-w-md gap-4 p-4">
      <header className="flex flex-col gap-0.5">
        <h2 className="font-semibold tracking-tight">Crop cover image</h2>
        <p className="text-muted-foreground text-sm">Drag the selection to choose what shows.</p>
      </header>
      <ImageCrop
        aspect={1}
        file={file}
        onChange={(pixel) => setSize({ width: pixel.width, height: pixel.height })}
        onComplete={(pixel) => setSize({ width: pixel.width, height: pixel.height })}
        onCrop={setResult}
        ruleOfThirds
      >
        <ImageCropContent />
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50 text-muted-foreground">
            {result ? (
              <img alt="Cropped result" className="size-full object-cover" src={result} />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </span>
          <div className="min-w-36 flex-1">
            <p className="truncate font-mono text-xs">{file.name}</p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {size ? `${Math.round(size.width)} × ${Math.round(size.height)} px` : "Loading"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ImageCropReset asChild>
              <Button size="sm" type="button" variant="ghost">
                <RotateCcwIcon />
                Reset
              </Button>
            </ImageCropReset>
            <ImageCropApply asChild>
              <Button size="sm" type="button">
                <CropIcon />
                Apply
              </Button>
            </ImageCropApply>
          </div>
        </div>
      </ImageCrop>
    </Card>
  );
}
