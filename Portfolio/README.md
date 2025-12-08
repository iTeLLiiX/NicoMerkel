# Nico Merkel Portfolio

Portfolio-Website für Nico Merkel - Anwendungsentwickler in Ausbildung bei Läpple.

## 🚀 Deployment auf Netlify

Diese Website ist für das Deployment auf Netlify konfiguriert.

### GitHub zu Netlify Setup

1. **Repository auf GitHub erstellen/pushen:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git
   git push -u origin main
   ```

2. **Netlify mit GitHub verbinden:**
   - Gehe zu [netlify.com](https://www.netlify.com)
   - Klicke auf "Add new site" → "Import an existing project"
   - Wähle "GitHub" und verbinde dein Repository
   - Netlify erkennt automatisch die `netlify.toml` Konfiguration

3. **Build-Einstellungen (automatisch erkannt):**
   - **Build command:** (leer - statische Site)
   - **Publish directory:** `.` (Root-Verzeichnis)

4. **Deployment:**
   - Netlify deployt automatisch bei jedem Push zu `main`
   - Du erhältst eine URL wie: `https://dein-site-name.netlify.app`

### Lokale Entwicklung

1. **Live Server verwenden:**
   - VS Code: Live Server Extension
   - Oder: `python -m http.server 8000`
   - Oder: `npx serve .`

2. **Netlify CLI (optional):**
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```

## 📁 Projektstruktur

```
NicoMerkelPort-main/
├── index.html          # Hauptseite
├── kontakt.html        # Kontaktseite
├── netlify.toml        # Netlify Konfiguration
├── .gitignore          # Git Ignore Datei
├── assets/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript Dateien
│   ├── fonts/         # Schriftarten
│   ├── icons/         # Icon-SVGs
│   └── *.jpg/png      # Bilder
└── README.md          # Diese Datei
```

## 🛠️ Technologien

- **HTML5** - Struktur
- **CSS3** - Styling (Custom CSS, Glassmorphism)
- **Vanilla JavaScript** - Interaktivität
- **Locomotive Scroll** - Smooth Scrolling
- **Netlify** - Hosting & Deployment

## 📝 Features

- ✅ Responsive Design
- ✅ Moderne Animationen
- ✅ Glassmorphism-Effekte
- ✅ Performance-optimiert
- ✅ SEO-freundlich
- ✅ Accessibility (WCAG)

## 🔧 Konfiguration

Die `netlify.toml` Datei enthält:
- Build-Konfiguration
- Redirect-Regeln für SPA-Routing
- Security Headers
- Cache-Einstellungen für optimale Performance

## 📧 Kontakt

Nico Merkel
- GitHub: [@iTeLLiiX](https://github.com/iTeLLiiX)
- LinkedIn: [Nico Merkel](https://www.linkedin.com/in/nico-merkel-20044b334/)

---

**Hinweis:** Diese Website wurde für das Deployment auf Netlify optimiert. Alle Vercel-Referenzen wurden durch Netlify ersetzt.




