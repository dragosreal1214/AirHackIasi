"use client";

import {
  CloudFog,
  Gauge,
  MessageCircle,
  Plane,
  Banknote,
  ShieldCheck,
  Bell,
  ChevronDown,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { AppBar } from "@/components/passenger/app-bar";
import { CButton } from "@/components/ui/button";
import { GoldCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SUPPORT_TEL = "+40312295500";
const SUPPORT_TEL_LABEL = "+40 31 229 5500";

type Faq = {
  icon: LucideIcon;
  q: string;
  a: string;
};

const FAQS: Faq[] = [
  {
    icon: CloudFog,
    q: "Ce sunt alertele de ceață?",
    a: "Monitorizăm condițiile de ceață și vizibilitatea redusă pe aeroportul tău de plecare cu până la 24 de ore înainte. Când prognoza indică un risc real de întârzieri sau anulări, primești o alertă din timp — ca să poți acționa înainte ca operatorul să anunțe oficial.",
  },
  {
    icon: Gauge,
    q: "Cum se calculează riscul zborului?",
    a: "Combinăm prognoza meteo orară (vizibilitate, plafon de nori, vânt) cu istoricul de operare al aeroportului și statusul live al zborului. Rezultatul este un nivel de risc — scăzut, moderat, ridicat sau critic — actualizat pe măsură ce condițiile se schimbă.",
  },
  {
    icon: MessageCircle,
    q: "Cum primesc alertele pe WhatsApp?",
    a: "Activează WhatsApp ca și canal preferat în Profil. Îți trimitem un mesaj imediat ce riscul zborului tău crește și un al doilea când situația se confirmă sau se rezolvă. Poți răspunde direct în conversație pentru ajutor.",
  },
  {
    icon: Plane,
    q: "Ce fac dacă zborul e anulat?",
    a: "Îți propunem automat alternative — zboruri ulterioare, rute alternative sau alte mijloace de transport — ordonate după timpul de sosire. Alegi varianta dorită cu un singur tap, iar noi te ghidăm prin pașii de rezervare.",
  },
  {
    icon: Banknote,
    q: "Am dreptul la compensație?",
    a: "Pentru întârzieri mari și anulări, regulamentul UE 261 îți poate da dreptul la o compensație de până la 600 EUR. Verificăm eligibilitatea zborului tău și îți spunem dacă merită să depui o cerere și ce documente îți trebuie.",
  },
  {
    icon: ShieldCheck,
    q: "Ce date colectați și de ce SIM check?",
    a: "Folosim doar numărul de telefon și detaliile zborurilor pe care le adaugi. Verificarea SIM confirmă că numărul îți aparține cu adevărat, ca să prevenim fraudele și să livrăm alertele pe canalul corect. Nu vindem datele tale.",
  },
  {
    icon: Bell,
    q: "Pot opri sau ajusta notificările?",
    a: "Da. În Profil controlezi fiecare canal — WhatsApp, SMS și push în aplicație — independent. Recomandăm să păstrezi cel puțin un canal activ ca să nu ratezi alertele critice de ultim moment.",
  },
];

function FaqRow({ faq, open, onToggle }: { faq: Faq; open: boolean; onToggle: () => void }) {
  const { icon: Icon, q, a } = faq;
  return (
    <GoldCard active={open} className="overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-transform duration-120 ease-cinematic active:scale-[0.99]"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-icon border border-[var(--gold-border)] bg-accent/[0.12] text-accent-deep shadow-glass">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-tight text-espresso">
          {q}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-accent-deep transition-transform duration-180 ease-cinematic",
            open && "rotate-180",
          )}
          strokeWidth={2.2}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-180 ease-cinematic",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="border-t border-[var(--gold-border)] px-4 py-3.5 text-sm leading-relaxed text-warm-muted">
            {a}
          </p>
        </div>
      </div>
    </GoldCard>
  );
}

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <AppBar title="Ajutor" subtitle="Întrebări frecvente" backHref="/" />
      <div className="px-4 pb-12 pt-5">
        <h2 className="animate-c-fade-up font-display text-[28px] leading-tight tracking-tight text-espresso">
          Ajutor &amp; întrebări
        </h2>
        <p
          className="mt-1.5 animate-c-fade-up text-sm font-medium leading-relaxed text-warm-muted"
          style={{ animationDelay: "60ms" }}
        >
          Tot ce trebuie să știi despre alerte, risc și ce faci când zborul tău e
          în pericol.
        </p>

        <div className="mt-6 space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={faq.q}
              className="animate-c-fade-up"
              style={{ animationDelay: `${120 + i * 60}ms` }}
            >
              <FaqRow
                faq={faq}
                open={openIndex === i}
                onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
              />
            </div>
          ))}
        </div>

        {/* Contact suport */}
        <GoldCard
          elevated
          className="mt-7 animate-c-fade-up p-5 text-center"
          style={{ animationDelay: `${120 + FAQS.length * 60}ms` }}
        >
          <h3 className="font-display text-xl leading-tight tracking-tight text-espresso">
            Tot blocat?
          </h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-warm-muted">
            Echipa noastră de suport îți răspunde non-stop, în limba română.
          </p>
          <a
            href={`tel:${SUPPORT_TEL}`}
            className="mt-4 block transition-transform duration-120 ease-cinematic active:scale-[0.98]"
          >
            <CButton variant="gold" full rightIcon={<Phone className="h-[18px] w-[18px]" strokeWidth={2.2} />}>
              Contact suport
            </CButton>
          </a>
          <p className="mt-3 text-xs font-medium text-warm-faint">{SUPPORT_TEL_LABEL}</p>
        </GoldCard>

        <p className="mt-7 px-1 text-center text-xs font-medium text-warm-faint">
          Aerly · Cu un aer înainte.
        </p>
      </div>
    </>
  );
}
