import { getConfig } from "@/template.config";
// Глобальный «Спросить ИИ»: любой экран открывает общий чат с готовым вопросом.
// AiFab слушает событие, открывает шторку и сразу отправляет вопрос.
export interface AskAiDetail {
  question: string;
  deal_id?: number;
  company_id?: number;
  pool?: string;
  block?: string;
  filters?: string;
  title?: string;
}

export const askAiEvent = () => `${getConfig().brand.storageKey}:ask-ai`;

export function askAi(detail: AskAiDetail) {
  window.dispatchEvent(new CustomEvent<AskAiDetail>(askAiEvent(), { detail }));
}
