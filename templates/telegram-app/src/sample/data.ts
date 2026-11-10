// Neutral sample data: invented people, no real brands.
export type Reaction = { emoji: string; count: number; mine?: boolean };

export type Message = {
  id: string;
  /** "me" for outgoing, otherwise a member id. */
  from: string;
  kind: "text" | "voice" | "photo" | "service";
  text?: string;
  /** Voice length in seconds. */
  seconds?: number;
  /** Id of the message this one replies to. */
  replyTo?: string;
  time: string;
  /** Day label shown as a marker before this message. */
  day?: string;
  reactions?: Reaction[];
  read?: boolean;
};

export type Chat = {
  id: string;
  title: string;
  hue: number;
  group?: boolean;
  /** Folder ids it belongs to. */
  folders: string[];
  pinned?: boolean;
  muted?: boolean;
  unread: number;
  online?: boolean;
  status: string;
  members?: Record<string, { name: string; hue: number }>;
  bio?: string;
  username?: string;
  phone?: string;
  messages: Message[];
};

export const folders = [
  { id: "all", title: "All" },
  { id: "personal", title: "Personal" },
  { id: "work", title: "Work" },
  { id: "unread", title: "Unread" },
];

export const chats: Chat[] = [
  {
    id: "mia",
    title: "Mia Alvarez",
    hue: 340,
    folders: ["personal"],
    pinned: true,
    unread: 0,
    online: true,
    status: "online",
    username: "@mia",
    phone: "+1 555 010 0142",
    bio: "Climbing, coffee and bad puns.",
    messages: [
      { id: "m1", from: "mia", kind: "text", text: "Are we still on for Saturday?", time: "09:12", day: "Today" },
      { id: "m2", from: "me", kind: "text", text: "Yes! I booked the wall for 10:00.", time: "09:14", read: true, reactions: [{ emoji: "🔥", count: 1 }] },
      { id: "m3", from: "mia", kind: "photo", time: "09:20" },
      { id: "m4", from: "mia", kind: "text", text: "New shoes, finally. Wish me luck.", time: "09:20", reactions: [{ emoji: "👍", count: 2, mine: true }, { emoji: "❤️", count: 1 }] },
      { id: "m5", from: "me", kind: "text", text: "They look great. Don't forget the chalk this time.", time: "09:22", read: true, replyTo: "m4" },
      { id: "m6", from: "mia", kind: "voice", seconds: 14, time: "09:25" },
      { id: "m7", from: "me", kind: "text", text: "Ha, noted. See you at 9:45 outside.", time: "09:26", read: false },
    ],
  },
  {
    id: "crew",
    title: "Weekend Crew",
    hue: 150,
    group: true,
    folders: ["personal"],
    pinned: true,
    unread: 3,
    status: "5 members, 2 online",
    members: { sam: { name: "Sam Okafor", hue: 30 }, ivy: { name: "Ivy Chen", hue: 280 }, leo: { name: "Leo Novak", hue: 190 } },
    messages: [
      { id: "g0", from: "me", kind: "service", text: "You created the group", time: "Mon", day: "Monday" },
      { id: "g1", from: "sam", kind: "text", text: "Trail or lake this weekend?", time: "18:02", day: "Yesterday", reactions: [{ emoji: "🏔", count: 2 }] },
      { id: "g2", from: "ivy", kind: "text", text: "Lake. It's going to be 24 degrees.", time: "18:05", replyTo: "g1" },
      { id: "g3", from: "me", kind: "text", text: "Lake works. I can bring the speaker.", time: "18:11", read: true },
      { id: "g4", from: "leo", kind: "text", text: "I'll drive. Leaving at 8, pick-ups on the way.", time: "18:30", reactions: [{ emoji: "🙌", count: 3, mine: true }] },
      { id: "g5", from: "sam", kind: "voice", seconds: 9, time: "18:41" },
    ],
  },
  {
    id: "design",
    title: "Design Team",
    hue: 260,
    group: true,
    folders: ["work"],
    unread: 12,
    status: "8 members",
    members: { noa: { name: "Noa Berg", hue: 15 }, kai: { name: "Kai Mori", hue: 120 } },
    messages: [
      { id: "d1", from: "noa", kind: "text", text: "Updated the onboarding flow in the file.", time: "11:02", day: "Today" },
      { id: "d2", from: "kai", kind: "text", text: "Looks clean. Can we cut one step?", time: "11:08" },
    ],
  },
  {
    id: "ravi",
    title: "Ravi Patel",
    hue: 40,
    folders: ["work"],
    unread: 1,
    status: "last seen recently",
    username: "@ravi",
    phone: "+1 555 010 0177",
    messages: [{ id: "r1", from: "ravi", kind: "text", text: "Invoice is attached, thanks!", time: "10:48", day: "Today" }],
  },
  {
    id: "news",
    title: "Daily Brief",
    hue: 200,
    folders: [],
    muted: true,
    unread: 24,
    status: "12,480 subscribers",
    messages: [{ id: "n1", from: "news", kind: "text", text: "Morning brief: markets open flat, rain expected after noon.", time: "07:30", day: "Today" }],
  },
  {
    id: "dana",
    title: "Dana Whitfield",
    hue: 95,
    folders: ["personal"],
    unread: 0,
    status: "last seen yesterday",
    username: "@dana",
    phone: "+1 555 010 0113",
    messages: [{ id: "a1", from: "me", kind: "text", text: "Thanks for lending me the book!", time: "Mon", day: "Monday", read: true }],
  },
  {
    id: "owen",
    title: "Owen Park",
    hue: 0,
    folders: ["work"],
    unread: 0,
    status: "last seen 2 hours ago",
    username: "@owen",
    phone: "+1 555 010 0151",
    messages: [{ id: "o1", from: "owen", kind: "text", text: "Standup moved to 10:30.", time: "Sun", day: "Sunday" }],
  },
];

/** Last-message preview text for the chat list. */
export function preview(chat: Chat): string {
  const m = chat.messages[chat.messages.length - 1];
  if (!m) return "";
  if (m.kind === "voice") return "Voice message";
  if (m.kind === "photo") return "Photo";
  return m.text ?? "";
}

export const sharedMedia = [200, 20, 310, 120, 60, 250, 340, 170, 90];
