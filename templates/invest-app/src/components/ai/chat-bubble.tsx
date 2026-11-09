import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useScrollEdges } from "@/lib/motion";
import { cn } from "@/lib/utils";

function EdgeScroll({ children }: { children: React.ReactNode }) {
  const edges = useScrollEdges();
  return <div ref={edges} className="edge-fade-x overflow-x-auto">{children}</div>;
}

export function ChatBubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <div className={cn("flex items-end gap-2", mine && "justify-end")}>
      {!mine && <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sparkles className="size-4" /></span>}
      <div className={cn("min-w-0 rounded-[20px] px-4 py-2.5 text-[15px] leading-snug", mine ? "max-w-[80%] whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground" : "flex-1 rounded-bl-md bg-card")}>
        {children}
      </div>
    </div>
  );
}

export function ChatTyping() {
  return <ChatBubble role="assistant"><span className="flex gap-1 py-1">{[0, 150, 300].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: `${d}ms` }} />)}</span></ChatBubble>;
}

// Плагины и компоненты на уровне модуля, иначе ReactMarkdown перемонтирует таблицы.
const REMARK_PLUGINS = [remarkGfm];
const MD_COMPONENTS = {
  table: ({ children }: { children?: React.ReactNode }) => <div className="my-2 overflow-hidden rounded-[14px] border border-border [contain:paint]"><EdgeScroll><table className="w-max min-w-full border-collapse text-[13px]">{children}</table></EdgeScroll></div>,
};

// Одиночный перевод строки модели — это перенос, а не пробел (иначе Markdown склеивает строки в абзац).
const softBreaks = (text: string) => text.replace(/([^\n|])\n(?![\n|]|\s*(?:[-*+]|\d+\.)\s)/g, "$1  \n");

export function RichText({ text }: { text: string }) {
  return <div className="break-words [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ol]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-1 [&_li::marker]:text-muted-foreground [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_td]:border-t [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:whitespace-nowrap [&_td:not(:first-child)]:text-right [&_th:not(:first-child)]:text-right [&_td]:tabular-nums [&_a]:underline"><ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={MD_COMPONENTS}>{softBreaks(text)}</ReactMarkdown></div>;
}
