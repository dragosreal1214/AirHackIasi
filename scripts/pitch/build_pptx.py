"""Generate Fogora pitch decks (.pptx) — business + technical — in the app style.

Run: apps/api/.venv/Scripts/python.exe scripts/pitch/build_pptx.py
Outputs into apps/web/public/pitch/ so they're downloadable from the app.
"""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[2]
CINE = ROOT / "apps" / "web" / "public" / "cine"
OUT = ROOT / "docs" / "pitch"
LOGO = str(CINE / "fogora-logo.png")
MARK = str(CINE / "fogora-mark-256.png")

ESPRESSO = RGBColor(0x2B, 0x22, 0x18)
DARKBG = RGBColor(0x20, 0x19, 0x10)
CARD_DARK = RGBColor(0x3A, 0x2E, 0x20)
GOLD = RGBColor(0xC8, 0xA2, 0x4E)
GOLD_DEEP = RGBColor(0xA8, 0x84, 0x3A)
GOLD_SOFT = RGBColor(0xE4, 0xCE, 0x92)
CREAM = RGBColor(0xFB, 0xF6, 0xEC)
IVORY = RGBColor(0xFF, 0xFD, 0xF8)
SAND = RGBColor(0xEB, 0xE0, 0xCB)
SKY = RGBColor(0x9C, 0xC4, 0xE4)
MUTED = RGBColor(0x7C, 0x71, 0x5C)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CREAM_MUTED = RGBColor(0xCF, 0xC6, 0xB4)

SERIF = "Georgia"
SANS = "Hanken Grotesk"
W, H = Inches(13.333), Inches(7.5)


def new_prs():
    p = Presentation()
    p.slide_width, p.slide_height = W, H
    return p


def add_slide(prs, dark):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = DARKBG if dark else CREAM
    return s


def textbox(slide, l, t, w, h, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    return tf


def run(p, text, *, size, color, bold=False, italic=False, font=SANS, spacing=None):
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.italic = italic
    r.font.name = font
    r.font.color.rgb = color
    return r


def footer(slide, dark, page):
    slide.shapes.add_picture(MARK, Inches(0.85), Inches(7.0), height=Inches(0.28))
    tf = textbox(slide, Inches(1.2), Inches(6.98), Inches(4), Inches(0.35))
    run(tf.paragraphs[0], "FOGORA", size=9, color=GOLD_SOFT if dark else GOLD_DEEP, bold=True)
    tf2 = textbox(slide, Inches(9.5), Inches(6.98), Inches(2.9), Inches(0.35))
    pr = tf2.paragraphs[0]
    pr.alignment = PP_ALIGN.RIGHT
    run(pr, f"{page:02d} / 10", size=9, color=MUTED if not dark else CREAM_MUTED, bold=True)


def kicker(slide, dark, text):
    tf = textbox(slide, Inches(0.85), Inches(1.0), Inches(11), Inches(0.4))
    run(tf.paragraphs[0], text.upper(), size=12, color=GOLD_SOFT if dark else GOLD_DEEP, bold=True)


def heading(slide, dark, text):
    tf = textbox(slide, Inches(0.85), Inches(1.45), Inches(11.6), Inches(1.7))
    p = tf.paragraphs[0]
    run(p, text, size=34, color=CREAM if dark else ESPRESSO, font=SERIF)


def bullets(slide, dark, items, top=3.3):
    tf = textbox(slide, Inches(0.95), Inches(top), Inches(10.8), Inches(3.2))
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(12)
        run(p, "•  ", size=18, color=GOLD)
        run(p, it, size=18, color=CREAM if dark else ESPRESSO)


def lead(slide, dark, text, top=5.7):
    tf = textbox(slide, Inches(0.95), Inches(top), Inches(10.5), Inches(1.0))
    run(tf.paragraphs[0], text, size=16, color=CREAM_MUTED if dark else MUTED)


def cards(slide, dark, items, top=3.4, height=2.4):
    n = len(items)
    gap = Inches(0.3)
    left0 = Inches(0.85)
    total = Inches(11.63)
    cw = (total - gap * (n - 1)) / n
    for i, (title, body) in enumerate(items):
        x = left0 + (cw + gap) * i
        shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(top), cw, Inches(height))
        shp.fill.solid()
        shp.fill.fore_color.rgb = CARD_DARK if dark else IVORY
        shp.line.color.rgb = GOLD_DEEP if not dark else GOLD
        shp.line.width = Pt(0.75)
        shp.shadow.inherit = False
        tf = shp.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.22)
        p = tf.paragraphs[0]
        run(p, title, size=17, color=CREAM if dark else ESPRESSO, bold=True)
        p2 = tf.add_paragraph()
        p2.space_before = Pt(6)
        run(p2, body, size=12.5, color=CREAM_MUTED if dark else MUTED)


def stats(slide, dark, items, top=3.3):
    n = len(items)
    gap = Inches(0.4)
    cw = (Inches(11.63) - gap * (n - 1)) / n
    for i, (num, label) in enumerate(items):
        x = Inches(0.85) + (cw + gap) * i
        tf = textbox(slide, x, Inches(top), cw, Inches(2.0))
        p = tf.paragraphs[0]
        run(p, num, size=54, color=GOLD_SOFT if dark else GOLD_DEEP, font=SERIF)
        p2 = tf.add_paragraph()
        p2.space_before = Pt(8)
        run(p2, label, size=14, color=CREAM_MUTED if dark else MUTED, bold=True)


def title_slide(prs, tagline_pre, tagline_em, subtitle):
    s = add_slide(prs, dark=True)
    s.shapes.add_picture(LOGO, Inches(4.27), Inches(1.4), width=Inches(4.8))
    tf = textbox(s, Inches(1.5), Inches(5.0), Inches(10.33), Inches(0.9))
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run(p, tagline_pre + " ", size=30, color=CREAM, font=SERIF)
    run(p, tagline_em, size=30, color=SKY, font=SERIF, italic=True)
    tf2 = textbox(s, Inches(2.0), Inches(5.95), Inches(9.33), Inches(0.7))
    p2 = tf2.paragraphs[0]
    p2.alignment = PP_ALIGN.CENTER
    run(p2, subtitle, size=15, color=CREAM_MUTED)
    footer(s, True, 1)


def close_slide(prs, line):
    s = add_slide(prs, dark=True)
    s.shapes.add_picture(MARK, Inches(5.9), Inches(2.1), width=Inches(1.5))
    tf = textbox(s, Inches(1.5), Inches(3.7), Inches(10.33), Inches(0.9))
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run(p, "Fogora", size=46, color=CREAM, font=SERIF)
    tf2 = textbox(s, Inches(1.5), Inches(4.7), Inches(10.33), Inches(0.6))
    p2 = tf2.paragraphs[0]
    p2.alignment = PP_ALIGN.CENTER
    run(p2, "Cu un pas înaintea ceții.", size=22, color=GOLD_SOFT, font=SERIF, italic=True)
    tf3 = textbox(s, Inches(2.0), Inches(5.4), Inches(9.33), Inches(0.7))
    p3 = tf3.paragraphs[0]
    p3.alignment = PP_ALIGN.CENTER
    run(p3, line, size=15, color=CREAM_MUTED)
    footer(s, True, 10)


def content(prs, dark, page, kick, head, *, items_bullets=None, items_cards=None,
            items_stats=None, lead_text=None, card_h=2.4):
    s = add_slide(prs, dark)
    kicker(s, dark, kick)
    heading(s, dark, head)
    if items_cards:
        cards(s, dark, items_cards, height=card_h)
        if lead_text:
            lead(s, dark, lead_text, top=3.5 + card_h + 0.3)
    elif items_stats:
        stats(s, dark, items_stats)
        if lead_text:
            lead(s, dark, lead_text, top=5.6)
    elif items_bullets:
        bullets(s, dark, items_bullets)
    footer(s, dark, page)
    return s


# ---------------- BUSINESS ----------------
def build_business():
    prs = new_prs()
    title_slide(prs, "Cu un pas", "înaintea ceții.",
                "Copilotul calm pentru perturbările de zbor — pitch de business")
    content(prs, False, 2, "Problema",
            "Ceața oprește zborurile — și nimeni nu te avertizează din timp.",
            items_bullets=[
                "Aeroporturile regionale (ex. Iași / LRIA) au capacitate redusă de aterizare pe ceață (ILS CAT I, RVR 550 m).",
                "Pasagerul află că zborul e anulat la aeroport, prea târziu ca să reacționeze.",
                "Rezultă deviere, nopți pierdute, costuri și stres — fără un plan B la îndemână.",
            ])
    content(prs, True, 3, "Soluția",
            "Fogora prezice ceața cu 3–5 ore înainte și îți dă un plan.",
            items_cards=[
                ("Prezice", "Model ML pe date METAR — riscul de ceață pe ore, per aeroport."),
                ("Alertează", "Notificare proactivă pe WhatsApp / SMS / push, doar la risc ridicat."),
                ("Rerutează", "Alternative reale — tren, autocar, alt zbor, reroute prin aeroport vecin."),
            ])
    content(prs, False, 4, "Produsul", "O aplicație calmă, telefon-first.",
            items_cards=[
                ("Verifică un zbor", "Status + risc în timp real, fără cont. Telefon doar pentru alerte."),
                ("Detalii de zbor", "% risc de anulare, gabarit meteo, terminal & itinerariu."),
                ("Alternative", "Sortabile după timp/preț, linkuri directe de rezervare."),
                ("Drepturi & cazare", "Compensație EU261 (AirHelp), hoteluri lângă aeroport."),
            ], card_h=2.5)
    content(prs, True, 5, "Piața", "Doi clienți, un singur model.",
            items_cards=[
                ("B2C — pasageri", "Milioane de pasageri pe aeroporturi regionale expuse la ceață."),
                ("B2B — companii & aeroporturi", "Predicția de ceață prin API: tablou de risc per zbor, prognoză per aeroport."),
            ],
            lead_text="Aceeași infrastructură de predicție alimentează aplicația și API-ul comercial.")
    content(prs, False, 6, "Model de venituri", "Trei fluxuri.",
            items_cards=[
                ("Freemium B2C", "Gratuit la verificare; abonament pentru alerte premium, multi-zbor."),
                ("API B2B", "Plan pe chei API + cote pentru companii & aeroporturi."),
                ("Afiliere", "Comision din rezervări — hoteluri, AirHelp, transport alternativ."),
            ])
    content(prs, True, 7, "De ce Fogora", "Proactiv, nu reactiv.",
            items_bullets=[
                "Predicție, nu raportare — te anunțăm înainte, nu după anulare.",
                "Risc real de aterizare — ponderăm ceața cu capacitatea aeroportului (ILS CAT I → III).",
                "Alternative care chiar funcționează — orar real + tren/autocar + reroute, scorate.",
                "Securitate la nivel de operator — Orange CAMARA (SIM-swap, KYC) + Twilio OTP.",
            ])
    content(prs, False, 8, "Tracțiune / MVP", "Funcțional, azi.",
            items_stats=[
                ("0.99", "ROC-AUC al modelului de ceață (~2 ani METAR LRIA)"),
                ("3–5h", "avans al predicției înainte de plecare"),
                ("4", "API-uri Orange CAMARA + Twilio + Web Push"),
            ],
            lead_text="Aplicație PWA instalabilă + backend live + API public — construite și testate.")
    content(prs, True, 9, "Viziune",
            "De la Iași, la fiecare aeroport regional cu ceață din Europa.",
            items_bullets=[
                "Modelul generalizează — features meteo generice, aplicabile oricărui aeroport.",
                "Parteneriate cu aeroporturi & companii pentru date live de zbor.",
                "Extindere: status live, capacitate per aeronavă, multi-limbă, push nativ.",
            ])
    close_slide(prs, "Hai să ducem calmul la fiecare poartă de îmbarcare.")
    prs.save(str(OUT / "Fogora-Business.pptx"))


# ---------------- TECHNICAL ----------------
def build_technical():
    prs = new_prs()
    title_slide(prs, "Arhitectură &", "model",
                "Cum prezicem ceața și transformăm riscul în acțiune — pitch tehnic")
    content(prs, False, 2, "Arhitectura", "Monorepo, stack modern, totul async.",
            items_cards=[
                ("Frontend", "Next.js 14 PWA, TanStack Query, Tailwind, push instalabil."),
                ("Backend", "FastAPI + Pydantic v2, SQLAlchemy 2.0 async, slowapi."),
                ("ML", "XGBoost + scikit-learn, Open-Meteo live, fallback pe reguli."),
                ("Date", "Supabase Postgres (RLS), Alembic, Twilio & Orange."),
            ], card_h=2.3)
    content(prs, True, 3, "Modelul de ceață", "XGBoost pe ~2 ani de METAR la Iași.",
            items_stats=[
                ("0.99", "ROC-AUC (test ținut deoparte)"),
                ("6", "features: temp, dewpoint depression, vânt, umiditate, oră, lună"),
                ("84%", "recall pe evenimentele de ceață"),
            ],
            lead_text="Praguri: low <0.25 · moderate 0.25–0.55 · high 0.55–0.90 · critical ≥0.90. Fallback pe reguli.")
    content(prs, False, 4, "Pipeline de date", "De la observație, la predicție pe ore.",
            items_bullets=[
                "Scrape METAR → feature engineering → train XGBoost → serve (.pkl).",
                "Live: Open-Meteo per lat/lon → model → timeline + ferestre de ceață + vârf.",
                "Replay: rejucăm zile reale cu ceață pentru a demonstra detecția.",
                "Modelul se încarcă o singură dată la pornire, niciodată per-request.",
            ])
    content(prs, True, 5, "Straturi de risc", "Ceața nu e totuna cu perturbarea.",
            items_cards=[
                ("Ceață la origine", "Probabilitatea de ceață la plecare (modelul, pe prognoza live)."),
                ("Aterizare destinație", "Ceața × capacitatea aeroportului (ILS CAT I…IIIb, autoland)."),
                ("Vreme rea", "Al doilea model: furtuni/precipitații/vânt din METAR, calibrat."),
                ("Risc de anulare", "Derivat din toate → % afișat + prag de alertă."),
            ], card_h=2.4)
    content(prs, False, 6, "Motorul de alternative", "Scorate, reale, acționabile.",
            items_bullets=[
                "Scor = 0.40·timp + 0.30·fiabilitate + 0.20·cost + 0.10·conveniență.",
                "Zboruri alternative din orarul real (aceeași rută, mai târziu).",
                "Tren + autocar pe perechile de orașe (CFR, FlixBus).",
                "Reroute prin aeroport vecin: autocar + zbor, cu pașii și linkurile fiecărui segment.",
            ])
    content(prs, True, 7, "Integrări", "Operator-grade.",
            items_cards=[
                ("Twilio", "OTP Verify (login pe telefon) + WhatsApp/SMS pentru alerte."),
                ("Orange CAMARA", "SIM-Swap & KYC, Device Reachability, Location (geofencing)."),
                ("Web Push", "Notificări native în PWA (VAPID), deep-link la zbor."),
            ],
            lead_text="Alertele pleacă doar la risc ridicat; canalul e ales după cum e dispozitivul accesibil.")
    content(prs, False, 8, "API public & B2B", "Același model, deschis dezvoltatorilor.",
            items_bullets=[
                "GET /api/public/v1/predict — probabilitatea de ceață din features meteo.",
                "GET /api/public/v1/forecast?airport=IAS — timeline live pe ore.",
                "GET /api/public/v1/airports/{iata}/risc — tablou per-zbor (B2B).",
                "Auth prin X-API-Key, rate-limit, docs OpenAPI (/docs) + /developers.",
            ])
    content(prs, True, 9, "Infra & securitate", "Pregătit de producție.",
            items_cards=[
                ("Hosting", "Frontend pe Vercel, API pe Railway (Docker), Postgres pe Supabase."),
                ("Securitate", "JWT + bcrypt, RLS pe PII, rate limiting, boot refuzat cu secret slab."),
                ("Calitate", "18 teste backend, typecheck strict, migrări Alembic reversibile."),
                ("PWA", "Instalabilă, service worker, layout desktop dedicat."),
            ], card_h=2.5)
    close_slide(prs, "Status live · capacitate per aeronavă · multi-aeroport · chei API self-serve · i18n.")
    prs.save(str(OUT / "Fogora-Technical.pptx"))


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    build_business()
    build_technical()
    print("Saved:", OUT / "Fogora-Business.pptx", "+", OUT / "Fogora-Technical.pptx")
