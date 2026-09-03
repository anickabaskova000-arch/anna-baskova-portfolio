# Editace webu přes /admin

Web se dá upravovat na adrese **https://anna-baskova-portfolio.vercel.app/admin**
bez zásahu do kódu. Přihlášení je přes GitHub, změny se ukládají jako commit
do repozitáře a Vercel web sám znovu nasadí (do ~1 minuty).

Editor běží na [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (nástupce Netlify/Decap CMS).

---

## Jednorázové nastavení (cca 5 minut)

Aby přihlášení fungovalo, je potřeba jednou vytvořit „GitHub OAuth App" a přidat
dva klíče do Vercelu.

### 1) Vytvoř GitHub OAuth App

1. Otevři <https://github.com/settings/developers> → **OAuth Apps** → **New OAuth App**
2. Vyplň:
   - **Application name:** `Anna Bašková – web editor`
   - **Homepage URL:** `https://anna-baskova-portfolio.vercel.app`
   - **Authorization callback URL:** `https://anna-baskova-portfolio.vercel.app/api/callback`
3. **Register application**
4. Zkopíruj si **Client ID**
5. Klikni **Generate a new client secret** a zkopíruj si **Client secret**
   (ukáže se jen jednou)

### 2) Přidej klíče do Vercelu

1. Otevři projekt na <https://vercel.com> → **Settings** → **Environment Variables**
2. Přidej dvě proměnné (pro všechna prostředí – Production, Preview, Development):
   - `GITHUB_CLIENT_ID` = *(Client ID z kroku 1)*
   - `GITHUB_CLIENT_SECRET` = *(Client secret z kroku 1)*
3. **Save**
4. Vercel → záložka **Deployments** → u posledního deploymentu **⋯ → Redeploy**
   (aby se klíče načetly)

Hotovo. Od teď funguje `/admin`.

---

## Jak se to používá

1. Jdi na `…/admin`, přihlas se přes GitHub.
2. V levém menu vyber sekci:
   - **Galerie – Moje práce** – ukázky práce (fotky a videa). Přetažením měníš pořadí,
     tlačítkem přidáš/smažeš. U každé zvol typ (foto/video), kategorii a popisek.
   - **Ceník** – 3 bloky s cenou „od…" a jejich podbody + „Co ovlivňuje cenu".
   - **V číslech** – 4 čísla v tmavém pruhu.
   - **Profily (Instagram mockup)** – bio, počty sledujících, obrázek feedu.
   - **Texty webu** – podnadpis pod jménem, text „O mně", kontaktní e-mail atd.
3. Ulož (**Save**) → **Publish**. Web se sám aktualizuje.

### Fotky vs. videa
- **Fotky** nahraješ přímo v editoru (tlačítko u pole „Soubor"). Ideálně už
  zmenšené (max ~1200 px, do ~400 kB).
- **Videa** jsou velká – radši je pošli vývojáři, přidá je optimalizovaně.
  (Když video přesto nahraješ přes editor, bude funkční, ale web se zpomalí.)

### Dvojjazyčnost
U textů jsou pole „(CZ)" a „(EN)". Pokud EN necháš prázdné, použije se česká verze.

---

## Co CMS needí (dělá vývojář)

Rozložení stránek, barvy, sekce „Co dělám", „Jak to funguje", loga klientů,
SEO a struktura – tyhle věci se mění v kódu.

---

## Technické poznámky

- Obsah je v `content/*.json`, web si ho načítá při otevření (`js/content.js`).
- Když se JSON nenačte, zobrazí se záložní obsah z `index.html`.
- OAuth řeší serverless funkce `api/auth.js` a `api/callback.js` na Vercelu.
- Konfigurace editoru: `admin/config.yml`.
