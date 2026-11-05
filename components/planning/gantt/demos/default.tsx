import { addDays } from "date-fns";
import {
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
} from "../index";

const today = new Date();
const status = { id: "active", name: "In progress", color: "var(--chart-3)" };
const features = [
  { id: "research", name: "Research", startAt: addDays(today, -20), endAt: addDays(today, 5), status },
  { id: "design", name: "Design", startAt: addDays(today, -5), endAt: addDays(today, 25), status },
  { id: "build", name: "Build", startAt: addDays(today, 10), endAt: addDays(today, 50), status },
];

export default function Demo() {
  return (
    <div className="h-96 w-full overflow-hidden rounded-lg border">
      <GanttProvider range="monthly" zoom={100}>
        <GanttSidebar collapsible>
          <GanttSidebarGroup name="Launch">
            {features.map((feature) => (
              <GanttSidebarItem feature={feature} key={feature.id} />
            ))}
          </GanttSidebarGroup>
        </GanttSidebar>
        <GanttTimeline>
          <GanttHeader />
          <GanttFeatureList>
            <GanttFeatureListGroup>
              {features.map((feature) => (
                <GanttFeatureItem key={feature.id} {...feature}>
                  <p className="flex-1 truncate text-xs">{feature.name}</p>
                </GanttFeatureItem>
              ))}
            </GanttFeatureListGroup>
          </GanttFeatureList>
          <GanttToday />
        </GanttTimeline>
      </GanttProvider>
    </div>
  );
}
