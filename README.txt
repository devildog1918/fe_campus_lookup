# Field Engineer Lookup PWA

This package is ready to host as a static website.

## Files included
- index.html
- styles.css
- app.js
- manifest.json
- service-worker.js
- field-engineers.csv
- icons/

## How to update the engineer list
1. Open your source spreadsheet.
2. Export or save the list as CSV.
3. Make sure the CSV columns are:
   - Campus
   - Campus Name
   - Field Engineer
4. Name the file exactly: `field-engineers.csv`
5. Replace the existing `field-engineers.csv` on the server.

## Hosting
You must host this over HTTPS for installability on iPhone and Android.

Good options:
- GitHub Pages
- Netlify
- Any internal web server with HTTPS enabled

## Install on phone
### iPhone
Open the site in Safari, tap Share, then Add to Home Screen.

### Android
Open the site in Chrome, then use Install App or Add to Home Screen.

## Data note
This package was built from your Excel file:
`Field Techs - Schools - Mar 2026.xlsx`

Loaded assignments: 90
