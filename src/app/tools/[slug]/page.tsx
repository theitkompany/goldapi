import Link from "next/link";
import SilverCalculator from "./SilverCalculator";
import InterestCalculator from "./InterestCalculator";
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
  if (slug === "silver-precious-metals") return <SilverCalculator />;
  if (slug === "interest-calculator") return <InterestCalculator />;
  if (slug === "unit-converter") return <UnitConverter />;
  const tool = TITLES[slug] ?? { title: "Calculator", category: "Coming soon" };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090c] px-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#101318] p-8 text-center">
        <span className="inline-flex rounded-full bg-[#1b3020] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b7f34b]">{tool.category}</span>
        <h1 className="mt-5 text-2xl font-bold">{tool.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#7b8493]">This utility is on its way. Check back soon for the full calculator experience.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-[#b7f34b] px-5 py-3 text-sm font-bold text-[#101318] transition hover:bg-[#cdf878]">Back to tools</Link>
      </section>
    </main>
  );
}
