import type { RiskLevel } from "@aerly/shared";

const riskDot: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  moderate: "bg-risk-moderate",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
          <span className={`h-2 w-2 rounded-full ${riskDot.high}`} />
          Aerly · placeholder frontend
        </span>

        <h1 className="mt-8 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Cu un <span className="text-primary">aer</span> înainte.
        </h1>

        <p className="mt-5 text-lg text-slate-600">
          Aerly îți spune din timp când zborul tău e la risc de ceață la Iași și
          îți trimite alternative — tren, alt zbor, reroute — direct pe WhatsApp.
        </p>

        <ul className="mt-8 space-y-2 text-left text-sm text-slate-600">
          <li>✓ Predicție cu până la 5 ore în avans</li>
          <li>✓ Alternative pe WhatsApp, un tap</li>
          <li>✓ Zero instalare. Zero cont.</li>
        </ul>

        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          Acesta este un placeholder. Designul final va înlocui acest ecran.
        </div>
      </div>
    </main>
  );
}
