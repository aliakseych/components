# Telegram-style Messenger

A mobile messenger UI modelled on Telegram's open-source clients, rewritten compactly in React. It runs entirely on sample data, with no server.

```bash
pnpm install
pnpm dev
```

## Screens

- `/` chat list with folder tabs (All, Personal, Work, Unread), pinned and muted chats, unread badges, read ticks and search
- `/chats/:id` chat with date markers, incoming and outgoing bubbles, replies, reactions (tap a bubble's reaction to toggle), voice and photo messages, typing state and a composer that sends
- `/chats/:id/info` profile with actions, details and shared media
- `/settings` account card and settings groups

## Change it

- Brand, name and current user: `src/template.config.tsx`
- Chats, messages and folders: `src/sample/data.ts`
- Theme: CSS variables in `src/index.css` (`--tg-*`)

## Limits

No network, accounts, media upload or encryption: sent messages live in memory. Nothing from Telegram's brand, logos or assets is included; names and content are invented.
