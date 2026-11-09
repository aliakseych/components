import { getConfig } from "@/template.config";

// Смена пользователя в этой вкладке (вход, регистрация, выход): убираем всё личное,
// что лежит на клиенте, — историю ИИ-чата.
export async function resetClientSession() {
  try {
    sessionStorage.removeItem(`${getConfig().brand.storageKey}-ai-chat`);
  } catch {
    // Без sessionStorage чат просто не помнит историю.
  }
}
