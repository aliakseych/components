import { useChatStream } from "@/components/dashboardblocks/ai-assistant";
import {
  type AIChat,
  type AIMessage,
  type AIReply,
  getMessageText,
  replyFromText,
} from "@/components/dashboardblocks/ai-message";

const REPLY =
  "This is a demo assistant, so I can't look anything up. " +
  "In a real app this reply would stream from your model. ";

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

/** Streams a fixed reply word by word, after a short pause. No network. */
async function* demoReply(
  messages: AIMessage[],
  signal: AbortSignal,
): AsyncIterable<AIReply> {
  const question = [...messages].reverse().find((m) => m.role === "user");
  const asked = question ? getMessageText(question).trim() : "";
  const text = asked ? `You asked: "${asked}". ${REPLY}` : REPLY;
  await sleep(600, signal);
  async function* words() {
    for (const word of text.split(" ")) {
      await sleep(40, signal);
      yield `${word} `;
    }
  }
  yield* replyFromText(words());
}

/** A deterministic `AIChat` for gallery demos: answers every message with a fixed reply. */
export function useDemoChat(initialMessages?: AIMessage[]): AIChat {
  return useChatStream({ initialMessages, onSend: demoReply });
}
