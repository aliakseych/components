"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getConfig } from "@/template.config";

const navKey = () => `${getConfig().brand.storageKey}-nav-stack`;

// Стек экранов внутри приложения (sessionStorage вкладки). Переход на предыдущий адрес
// стека считаем шагом назад и снимаем верх, иначе кладём новый. BackButton делает
// router.back() только когда под текущим экраном есть свой экран.
export function readNavStack(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(navKey()) ?? "[]");
  } catch {
    return [];
  }
}

export function NavDepth() {
  const pathname = usePathname();
  useEffect(() => {
    const stack = readNavStack();
    if (stack[stack.length - 1] === pathname) return;
    if (stack[stack.length - 2] === pathname) stack.pop();
    else stack.push(pathname);
    sessionStorage.setItem(navKey(), JSON.stringify(stack.slice(-50)));
  }, [pathname]);
  return null;
}
