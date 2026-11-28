import Link from "next/link";
import ToolShell from "@/components/ToolShell";
import CurrencyConverter from "./CurrencyConverter";
import SilverCalculator from "./SilverCalculator";
import InterestCalculator from "./InterestCalculator";
import LoanEmiCalculator from "./LoanEmiCalculator";
import UnitConverter from "./UnitConverter";

const TITLES: Record<string, { title: string; category: string }> = {
  "currency-converter": { title: "Currency Converter", category: "Financial" },
  "silver-precious-metals": { title: "Silver & Precious Metals", category: "Precious Metals" },
  "interest-calculator": { title: "Interest Calculator", category: "Financial" },
  "loan-emi-calculator": { title: "Loan & EMI Calculator", category: "Financial" },
  "unit-converter": { title: "Unit Converter", category: "Utilities" },
};

export default async function PlaceholderTool({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "currency-converter") return <CurrencyConverter />;
  if (slug === "silver-precious-metals") return <SilverCalculator />;
  if (slug === "interest-calculator") return <InterestCalculator />;
  if (slug === "loan-emi-calculator") return <LoanEmiCalculator />;
  if (slug === "unit-converter") return <UnitConverter />;
  const tool = TITLES[slug] ?? { title: "Calculator", category: "Coming soon" };

  return (
    <ToolShell subtitle={tool.title} accent="green">
      <div className="py-6 text-center">
        <span className="bg-accent-badge text-accent-primary inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          {tool.category}
        </span>
        <h1 className="mt-5 text-2xl font-bold text-foreground">{tool.title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          This utility is on its way. Check back soon for the full calculator experience.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-[#b7f34b] px-5 py-3 text-sm font-bold text-[#101318] transition hover:bg-[#cdf878]"
        >
          Back to tools
        </Link>
      </div>
    </ToolShell>
  );
}
