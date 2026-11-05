import { SearchIcon } from "lucide-react";
import { ChainOfThought, ChainOfThoughtContent, ChainOfThoughtHeader, ChainOfThoughtSearchResult, ChainOfThoughtSearchResults, ChainOfThoughtStep } from "../index";

export default function Demo() {
  return (
    <ChainOfThought className="w-full max-w-xl" defaultOpen>
      <ChainOfThoughtHeader />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep icon={SearchIcon} label="Searching export data" status="complete">
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult>trade.gov</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>stat.uz</ChainOfThoughtSearchResult>
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep label="Comparing the last two years" status="active" />
        <ChainOfThoughtStep label="Writing the answer" status="pending" />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
