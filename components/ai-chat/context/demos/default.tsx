import { Context, ContextCacheUsage, ContextContent, ContextContentBody, ContextContentFooter, ContextContentHeader, ContextInputUsage, ContextOutputUsage, ContextReasoningUsage, ContextTrigger } from "../index";

// Input includes cached tokens and output includes reasoning tokens.
const usage = {
  inputTokens: 32000,
  inputTokenDetails: { noCacheTokens: 24000, cacheReadTokens: 8000, cacheWriteTokens: 0 },
  outputTokens: 8000,
  outputTokenDetails: { textTokens: 5000, reasoningTokens: 3000 },
  totalTokens: 40000,
};

export default function Demo() {
  return (
    <Context maxTokens={128000} modelId="openai:gpt-4o" usage={usage} usedTokens={40000}>
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody className="space-y-2">
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  );
}
