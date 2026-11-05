import { PhoneMissedIcon, UserPlusIcon } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "../index";

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
      <Marker variant="border"><MarkerContent>Earlier messages</MarkerContent></Marker>
      <Marker variant="separator"><MarkerContent>Today, 5 November</MarkerContent></Marker>
      <Marker>
        <MarkerIcon><UserPlusIcon /></MarkerIcon>
        <MarkerContent>Ana Kim joined the conversation at 10:38</MarkerContent>
      </Marker>
      <Marker className="text-destructive">
        <MarkerIcon><PhoneMissedIcon /></MarkerIcon>
        <MarkerContent>Missed call from Ana Kim at 10:44</MarkerContent>
      </Marker>
    </div>
  );
}
