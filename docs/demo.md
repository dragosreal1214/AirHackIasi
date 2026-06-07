# Fogora — Runbook de demo

Tot ce-ți trebuie ca să prezinți Fogora live, fără surprize. Calea recomandată e
**fără cont** (guest) — nu depinde de SMS, internet sau login.

---

## 0. Înainte de demo (checklist)

- [ ] Pornește serverele (vezi §1). Verifică `http://127.0.0.1:8000/health` → `{"status":"ok"}`.
- [ ] Deschide aplicația și fă **un tur complet** o dată (warmup cache + service worker).
- [ ] Dacă arăți **push pe telefon**: loghează-te pe telefon cu numărul, activează push din *Profil*, lasă telefonul vizibil (§4).
- [ ] Pune browserul pe **fullscreen** (F11). Închide extensiile (evită warning-uri în consolă).
- [ ] Ai pregătit comanda de alertă într-un terminal (vezi §3) — un Enter și pică notificarea.

---

## 1. Pornește serverele

```powershell
# tot, dintr-o comandă (pornește API + web în ferestre noi, afișează URL-urile)
powershell -ExecutionPolicy Bypass -File scripts\demo\start-demo.ps1
```

Sau manual:
```powershell
# API
cd apps\api; .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# Web (alt terminal)
pnpm --filter web dev
```

- Local: **http://localhost:3000**
- De pe telefon (același Wi-Fi): **http://<IP-ul-laptopului>:8000** pentru API +
  `NEXT_PUBLIC_API_URL` setat pe acel IP. `start-demo.ps1` îți afișează IP-ul.

---

## 2. Datele de demo (garantat)

Zborul-vedeta apare **automat**, fără setări:

| Zbor | Rută | Risc | Alternative |
|---|---|---|---|
| **RO 632** (TAROM) | IAS → OTP | **88% — ridicat** | tren CFR, RO 634, reroute via Bacău, FlixBus |

- E forțat la risc ridicat în cod (`store.FORCED_HIGH_NUMBERS`), deci **e high indiferent de vreme**.
- `disruptionId = d_001` → alternative curate, sortabile după **timp / preț**, cu linkuri reale de rezervare.
- Mesajul de pe Acasă („Cer senin azi" / „Risc de ceață azi") reflectă vremea **reală** la Iași — e ok să fie senin; riscul pe zbor e separat.

---

## 3. Declanșează alerta (momentul WOW)

### Cel mai simplu — din UI (fără terminal)
Deschide aplicația o dată cu **`?demo=1`** (ex. `http://localhost:3000/?demo=1`).
Atunci:
- mesajul de pe Acasă devine **„Risc de ceață azi"** (coerent cu povestea), și
- apare o pastilă plutitoare **„Declanșează alerta"** — un tap și alerta pleacă.

Dezactivezi cu `?demo=0`.

### Din terminal (alternativ)
Într-un terminal pregătit dinainte:

```powershell
# A) Scanarea proactiva completa (simuleaza ceata la IAS, alerteaza toti pasagerii la risc)
powershell -ExecutionPolicy Bypass -File scripts\demo\fire-alert.ps1

# B) O singura alerta tintita catre un numar (pentru push pe telefonul tau)
powershell -ExecutionPolicy Bypass -File scripts\demo\fire-alert.ps1 -Phone "+40770675731"
```

Echivalent direct:
```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8000/api/v1/dev/run-monitor?force_fog=IAS"
```

---

## 4. Push pe telefon (opțional, dar efectul e mare)

1. Pe telefon: deschide app-ul (HTTPS sau prin IP-ul din LAN), **Adaugă pe ecranul principal**.
2. Loghează-te cu numărul **+40770675731** (cod demo **000000** — vezi §6).
3. *Profil → Notificări push → Activează* (acceptă permisiunea).
4. La demo, rulează **3B** cu acel număr → notificarea pică pe telefon și, la tap, **deschide direct zborul**.

> Dacă push-ul e nesigur pe scenă, sari peste — restul poveștii nu depinde de el.

---

## 5. Firul demo-ului (povestea „Andrei")

1. **Intră fără cont** → „Verifică un zbor — fără cont". *(frecare zero)*
2. **Călătorii** → cardul **RO 632** cu „Risc de perturbare".
3. **Detalii zbor** → **88% risc de anulare**, gabaritele meteo, cardul **Aterizare la destinație (ILS)**.
4. **Alternative** → sortează după „Cel mai rapid" → apasă **Rezervă** → te duce pe site-ul furnizorului (CFR / Google Flights).
5. *(opțional)* declanșează **alerta** (§3) → notificarea pică pe telefon.
6. **Pivot business**: deschide **/ops/board** (tablou B2B per aeroport) și **/developers** (API-ul public).

---

## 6. Detalii utile

- **Cod OTP demo (fără SMS real):** `000000` (apare scris pe ecranul de verificare în mod demo).
- **Reset alerte** între repetiții: `run-monitor` resetează automat dedupe-ul la fiecare apel.
- **Cont de test:** `+40770675731`.
- **Pagini cheie:** `/` (acasă) · `/trips` · `/trips/<id>` · `/hotels` · `/developers` · `/ops/board`.

---

## 7. Troubleshooting

| Simptom | Fix |
|---|---|
| `/health` nu răspunde | API-ul nu rulează — repornește (§1). |
| Lista de zboruri goală | Backendul nu e pornit sau API URL greșit pe frontend; verifică `NEXT_PUBLIC_API_URL`. |
| Push „nu se poate activa" | Trebuie context securizat (localhost sau HTTPS); pe iOS trebuie întâi *Add to Home Screen*. |
| Notificarea nu pică | Telefonul trebuie să fi activat push pe **același cont** către care trimiți (§3B). |
| Pe telefon nu se încarcă | Același Wi-Fi + `NEXT_PUBLIC_API_URL` pe IP-ul laptopului, nu `localhost`. |
| Warning-uri roșii în consolă | Sunt de la extensii de browser — irelevante; folosește Incognito. |
