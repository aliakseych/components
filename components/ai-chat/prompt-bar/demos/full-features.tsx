import { PromptBar, midnightPreset } from "../index";

export default function Demo() {
  return (
    <div className="flex w-full justify-center rounded-2xl bg-[#07080d] p-4 pt-72 sm:p-10 sm:pt-72">
      <PromptBar
        {...midnightPreset}
        placeholder="Type @ for sources or / for commands"
        sources={[
          { key: "reports", name: "Reports", description: "Saved reports", icon: <span>R</span> },
          { key: "upload", name: "Upload file", icon: <span>+</span>, attach: true },
        ]}
        commands={[{ key: "chart", name: "/chart", description: "Draw a chart" }]}
        efforts={["Fast", "Normal", "Deep"]}
        onAttach={() => "sales-report.pdf"}
        onDictate={() => "Show this month's totals"}
      />
    </div>
  );
}
