import { eachDayOfInterval, format, subDays } from "date-fns";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "../index";

const today = new Date();
const data = eachDayOfInterval({ start: subDays(today, 364), end: today }).map(
  (date, index) => {
    const count = (index * 7 + index ** 2) % 11;
    return {
      date: format(date, "yyyy-MM-dd"),
      count,
      level: Math.min(4, Math.ceil(count / 2.5)),
    };
  }
);

export default function Demo() {
  return (
    <div className="w-full max-w-4xl overflow-x-auto">
      <ContributionGraph data={data}>
        <ContributionGraphCalendar>
          {({ activity, dayIndex, weekIndex }) => (
            <ContributionGraphBlock
              activity={activity}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
            />
          )}
        </ContributionGraphCalendar>
        <ContributionGraphFooter>
          <ContributionGraphTotalCount />
          <ContributionGraphLegend />
        </ContributionGraphFooter>
      </ContributionGraph>
    </div>
  );
}
