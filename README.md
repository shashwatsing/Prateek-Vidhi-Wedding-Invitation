# Prateek & Vidhi — wedding invitation

A tap-to-open wedding invitation with animated doors, personalized couple artwork, a wedding countdown, venue details, and directions. The site has no forms or guest-data storage.

Website: https://shashwatsing.github.io/Wedding_bhaiya/

Repository: https://github.com/shashwatsing/Wedding_bhaiya

## Preview locally

1. Open this `local-invitation` folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.
3. Tap the **P & V** seal to open the invitation.

No npm installation or build step is required. Use Live Server instead of opening the HTML file directly, because the page uses JavaScript modules. Google Fonts load when online; local fonts are used as fallbacks.

## Edit the invitation

- `index.html`: names, wording, displayed date, venue, and directions.
- `styles.css`: colors, layout, opening doors, and animations.
- `app.js`: opening/replay controls and countdown.
- `settings.js`: wedding date used by the countdown.
- `assets/`: palace artwork, couple illustration, and favicon.

Wedding: Prateek Singh & Vidhi Singh, 1 March 2027, Govind Dham Resort, Prayagraj. Ceremony time remains “Ceremony time to follow.”

## Publish updates

This folder is connected to the repository over HTTPS. Commit and push changes to `main`; GitHub Pages publishes from the repository root. Keep `.nojekyll` with the other website files.

Only the active artwork files are published. Local artwork notes and unused portrait alternatives are ignored by Git.

## Check the files

If Node.js is installed, run `npm test`. The check verifies the local resource paths used on GitHub Pages. No dependencies are needed.
