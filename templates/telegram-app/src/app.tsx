import { useRouter } from "@/lib/router";
import { ChatList } from "@/screens/chat-list";
import { ChatScreen } from "@/screens/chat";
import { Profile } from "@/screens/profile";
import { Settings } from "@/screens/settings";

export function App() {
  const { path } = useRouter();
  const [, section, id, sub] = path.split("/");
  let screen = <ChatList />;
  if (section === "settings") screen = <Settings />;
  else if (section === "chats" && id) screen = sub === "info" ? <Profile id={id} key={id} /> : <ChatScreen id={id} key={id} />;
  return <div className="relative mx-auto h-dvh max-w-md overflow-hidden bg-background">{screen}</div>;
}
