"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Unit = { label: string; factor?: number; offset?: number };
type Category = { label: string; units: Record<string, Unit>; convert?: (value: number, from: string, to: string) => number };

const linear = (units: Record<string, Unit>): Category => ({ label: "", units });
const DATA: Record<string, Category> = {
  length: linear({ mm: { label: "Millimetre", factor: 0.001 }, cm: { label: "Centimetre", factor: 0.01 }, m: { label: "Metre", factor: 1 }, km: { label: "Kilometre", factor: 1000 }, in: { label: "Inch", factor: 0.0254 }, ft: { label: "Foot", factor: 0.3048 }, yd: { label: "Yard", factor: 0.9144 }, mi: { label: "Mile", factor: 1609.344 } }),
  area: linear({ "mm²": { label: "Square millimetre", factor: 1e-6 }, "cm²": { label: "Square centimetre", factor: 1e-4 }, "m²": { label: "Square metre", factor: 1 }, "km²": { label: "Square kilometre", factor: 1e6 }, "in²": { label: "Square inch", factor: 0.00064516 }, "ft²": { label: "Square foot", factor: 0.092903 }, acre: { label: "Acre", factor: 4046.856422 }, hectare: { label: "Hectare", factor: 10000 } }),
  volume: linear({ mL: { label: "Millilitre", factor: 0.001 }, L: { label: "Litre", factor: 1 }, "m³": { label: "Cubic metre", factor: 1000 }, "cm³": { label: "Cubic centimetre", factor: 0.001 }, "ft³": { label: "Cubic foot", factor: 28.3168 }, gal: { label: "US gallon", factor: 3.78541 }, qt: { label: "US quart", factor: 0.946353 }, pint: { label: "US pint", factor: 0.473176 } }),
  mass: linear({ mg: { label: "Milligram", factor: 0.000001 }, g: { label: "Gram", factor: 0.001 }, kg: { label: "Kilogram", factor: 1 }, tonne: { label: "Tonne", factor: 1000 }, oz: { label: "Ounce", factor: 0.0283495 }, lb: { label: "Pound", factor: 0.453592 }, stone: { label: "Stone", factor: 6.35029 } }),
  speed: linear({ "m/s": { label: "Metre/second", factor: 1 }, "km/h": { label: "Kilometre/hour", factor: 0.277778 }, mph: { label: "Mile/hour", factor: 0.44704 }, knot: { label: "Knot", factor: 0.514444 }, "ft/s": { label: "Foot/second", factor: 0.3048 } }),
  time: linear({ ms: { label: "Millisecond", factor: 0.001 }, s: { label: "Second", factor: 1 }, min: { label: "Minute", factor: 60 }, h: { label: "Hour", factor: 3600 }, day: { label: "Day", factor: 86400 }, week: { label: "Week", factor: 604800 }, month: { label: "Month (30 days)", factor: 2592000 }, year: { label: "Year (365 days)", factor: 31536000 } }),
  pressure: linear({ Pa: { label: "Pascal", factor: 1 }, kPa: { label: "Kilopascal", factor: 1000 }, bar: { label: "Bar", factor: 100000 }, atm: { label: "Atmosphere", factor: 101325 }, psi: { label: "PSI", factor: 6894.757 }, mmHg: { label: "Millimetres of mercury", factor: 133.322 } }),
  energy: linear({ J: { label: "Joule", factor: 1 }, kJ: { label: "Kilojoule", factor: 1000 }, cal: { label: "Calorie", factor: 4.184 }, kcal: { label: "Kilocalorie", factor: 4184 }, Wh: { label: "Watt-hour", factor: 3600 }, kWh: { label: "Kilowatt-hour", factor: 3600000 }, eV: { label: "Electronvolt", factor: 1.602176634e-19 } }),
  power: linear({ W: { label: "Watt", factor: 1 }, kW: { label: "Kilowatt", factor: 1000 }, MW: { label: "Megawatt", factor: 1e6 }, hp: { label: "Horsepower", factor: 745.7 } }),
  force: linear({ N: { label: "Newton", factor: 1 }, kN: { label: "Kilonewton", factor: 1000 }, lbf: { label: "Pound-force", factor: 4.44822 } }),
  torque: linear({ "N·m": { label: "Newton-metre", factor: 1 }, "lb·ft": { label: "Pound-foot", factor: 1.35582 } }),
  data: linear({ bit: { label: "Bit", factor: 1 }, byte: { label: "Byte", factor: 8 }, KB: { label: "Kilobyte", factor: 8000 }, MB: { label: "Megabyte", factor: 8e6 }, GB: { label: "Gigabyte", factor: 8e9 }, TB: { label: "Terabyte", factor: 8e12 }, PB: { label: "Petabyte", factor: 8e15 } }),
  frequency: linear({ Hz: { label: "Hertz", factor: 1 }, kHz: { label: "Kilohertz", factor: 1000 }, MHz: { label: "Megahertz", factor: 1e6 }, GHz: { label: "Gigahertz", factor: 1e9 } }),
  angle: linear({ degree: { label: "Degree", factor: 1 }, radian: { label: "Radian", factor: 180 / Math.PI }, gradian: { label: "Gradian", factor: 0.9 } }),
  acceleration: linear({ "m/s²": { label: "Metre/second²", factor: 1 }, "ft/s²": { label: "Foot/second²", factor: 0.3048 }, g: { label: "Standard gravity", factor: 9.80665 } }),
  temperature: { label: "", units: { C: { label: "Celsius" }, F: { label: "Fahrenheit" }, K: { label: "Kelvin" } }, convert: (v, from, to) => { const c = from === "F" ? (v - 32) * 5 / 9 : from === "K" ? v - 273.15 : v; return to === "F" ? c * 9 / 5 + 32 : to === "K" ? c + 273.15 : c; } },
  "fuel-economy": { label: "", units: { "km/L": { label: "Kilometre/litre" }, mpg: { label: "Miles/gallon (US)" }, "L/100km": { label: "Litre/100 km" } }, convert: (v, from, to) => { const kpl = from === "km/L" ? v : from === "mpg" ? v * 0.425144 : 100 / v; return to === "km/L" ? kpl : to === "mpg" ? kpl / 0.425144 : 100 / kpl; } },
  density: linear({ "kg/m³": { label: "Kilogram/m³", factor: 1 }, "g/cm³": { label: "Gram/cm³", factor: 1000 }, "kg/L": { label: "Kilogram/litre", factor: 1000 }, "lb/ft³": { label: "Pound/ft³", factor: 16.0185 } }),
};

const TITLES: Record<string, string> = { "fuel-economy": "Fuel economy", length: "Length", area: "Area", volume: "Volume", mass: "Mass", temperature: "Temperature", speed: "Speed", time: "Time", pressure: "Pressure", energy: "Energy", power: "Power", force: "Force", torque: "Torque", data: "Data", frequency: "Frequency", angle: "Angle", acceleration: "Acceleration", density: "Density" };
const format = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 8 });

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const units = DATA[category].units;
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const [value, setValue] = useState("1");
  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isFinite(DATA[category].convert ? DATA[category].convert!(n, from, to) : n * (units[from].factor! / units[to].factor!))) return "—";
    const converted = DATA[category].convert ? DATA[category].convert(n, from, to) : n * (units[from].factor! / units[to].factor!);
    return format.format(converted);
  }, [category, from, to, value, units]);
  const changeCategory = (next: string) => { setCategory(next); const nextUnits = Object.keys(DATA[next].units); setFrom(nextUnits[0]); setTo(nextUnits[1] ?? nextUnits[0]); };
  const swap = () => { setFrom(to); setTo(from); };
  const clear = () => setValue("");

  return <main className="flex min-h-screen items-center justify-center bg-[#07090c] px-5 py-10 text-white"><section className="w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-[#101318] p-6 sm:p-8">
    <Link href="/" className="text-sm text-[#b7f34b] hover:underline">← All tools</Link><span className="mt-8 inline-flex rounded-full bg-[#1b3020] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b7f34b]">Utilities</span><h1 className="mt-4 text-3xl font-bold">Unit Converter</h1><p className="mt-2 text-sm text-[#7b8493]">Convert instantly between compatible units.</p>
    <label className="mt-8 block text-sm text-[#d9dee7]">Category<select value={category} onChange={(e) => changeCategory(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-white">{Object.keys(DATA).map((key) => <option key={key} value={key}>{TITLES[key]}</option>)}</select></label>
    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end"><label className="text-sm text-[#d9dee7]">From<select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-3 py-3 text-white">{Object.entries(units).map(([key, unit]) => <option key={key} value={key}>{unit.label} ({key})</option>)}</select></label><button type="button" onClick={swap} className="rounded-xl border border-white/10 px-4 py-3 text-[#b7f34b] hover:bg-white/5" aria-label="Swap units">⇄</button><label className="text-sm text-[#d9dee7]">To<select value={to} onChange={(e) => setTo(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-3 py-3 text-white">{Object.entries(units).map(([key, unit]) => <option key={key} value={key}>{unit.label} ({key})</option>)}</select></label></div>
    <label className="mt-5 block text-sm text-[#d9dee7]">Value<input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#161a20] px-4 py-3 text-lg text-white outline-none focus:border-[#b7f34b]" /></label><div className="mt-5 rounded-2xl border border-white/10 bg-[#0b0d10] p-5"><p className="text-sm text-[#7b8493]">Result</p><p className="mt-2 break-words text-3xl font-bold text-[#b7f34b]">{result} <span className="text-base font-medium text-[#9ba3af]">{to}</span></p></div><button type="button" onClick={clear} className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm text-[#d9dee7] hover:bg-white/5">Clear</button>
  </section></main>;
}
