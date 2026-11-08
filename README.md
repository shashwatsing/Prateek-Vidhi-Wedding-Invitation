# Prateek & Vidhi — wedding invitation

This is the standalone version for VS Code Live Server and GitHub Pages. It includes the opening doors, personalized couple illustration, venue directions, and an RSVP form. It needs no npm installation or build step.

Repository: https://github.com/shashwatsing/Wedding_bhaiya

Website address once GitHub Pages is enabled: https://shashwatsing.github.io/Wedding_bhaiya/

RSVP is configured for Google Forms. Add the published responder link to `googleFormUrl` in `settings.js` to open collection. Until then, visitors see that RSVP is not open. The response Sheet stays in the owner's Google Drive and is never stored in this repository.

## Preview with Live Server

1. Open **this `local-invitation` folder** in VS Code.
2. Right-click `index.html` and select **Open with Live Server**.
3. Tap the **P & V** seal to open the invitation.

Use a URL such as `http://127.0.0.1:5500/` or `http://localhost:5500/`. If you opened the whole parent workspace, the URL may end in `/local-invitation/index.html`; that also works. JavaScript modules need an HTTP server, so use Live Server rather than double-clicking the HTML file.

The fonts use Google Fonts when online; local serif and sans-serif fonts are used as fallbacks. The illustrations are included in `assets/`.

## What is saved locally

If you change RSVP mode to `preview` for local testing, a reply is saved **only in this browser’s local storage**, survives a refresh, and can be edited or downloaded as a JSON file. It is not sent to the hosts or shared with another phone/computer. Clearing browser storage removes it. Replies are scoped to the local server address and port.

On a public host such as GitHub Pages, preview-mode submissions are disabled. The page displays “RSVP collection is not open yet” until you configure real collection. This prevents guests from being told they submitted a reply that the hosts cannot receive.

## Publish and update on GitHub

1. Use the repository at https://github.com/shashwatsing/Wedding_bhaiya.
2. Upload the **contents of this folder** to the repository root. Keep `index.html`, `styles.css`, `app.js`, `settings.js`, `rsvp-store.js`, `assets/`, and `.nojekyll` together.
3. In **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/(root)`.
4. Open the Pages URL GitHub provides. Relative asset paths also work under `https://USERNAME.github.io/REPOSITORY/`.

Keep guest lists and response exports in Google Drive, outside this public repository. Only the three active artwork files in `assets/` are needed for the published invitation.

The local `local-invitation` folder is connected to this repository over HTTPS. For future updates, edit the files, check the Live Server preview, then commit and push to `main`. GitHub Pages republishes the selected branch automatically.

GitHub Pages serves static files; it does not run an RSVP database. Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Collect RSVPs in Google Drive (recommended simple option)

Use a Google Form linked to a Google Sheet. The invitation stays local or on GitHub Pages; the Google Form collects replies into the Sheet in your Drive. The RSVP area uses Google's form styling while the invitation keeps its artwork and animation.

Follow [GOOGLE_RSVP.md](./GOOGLE_RSVP.md). Google Forms mode is already selected. Create and publish the form, then paste its full responder URL into `googleFormUrl` in `settings.js`. No Google form or sheet has been created or connected yet; RSVP stays closed until the link is configured.

## Alternative: collect real guest RSVPs with Formspree

The optional integration is ready, but no Formspree account/form has been created or contacted by this project.

1. Create a form in your own Formspree account.
2. Copy its public submission endpoint, shaped like `https://formspree.io/f/abcdefgh`.
3. Edit `settings.js`:

   ```js
   rsvp: {
     mode: 'formspree',
     formspreeEndpoint: 'https://formspree.io/f/YOUR_ACTUAL_FORM_ID',
   },
   ```

4. Commit/publish those files. Submit one test RSVP and confirm it appears in your Formspree dashboard before sharing the invitation with guests.
5. Review your form’s submission limits, spam controls, and domain restrictions in Formspree.

The endpoint is meant to be public. No secret API key belongs in this project. The browser sends the guest’s name, email, attendance, guest count, optional note, event ID, wedding date, and submission time. The form only reports success after the service accepts the reply. A network failure stays an error and is never silently treated as a local success.

Revised replies are **new submissions**, not database updates. Use the latest reply per email when preparing your guest list. Cached local copies only remember that visitor’s confirmation on their device. Earlier local preview replies are not uploaded automatically. This project never exposes the full guest list to visitors.

Formspree documentation:

- JavaScript forms: https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax
- CSV/JSON export (plan-dependent): https://help.formspree.io/articles/form-and-project-settings/exporting-submissions/

## Edit the invitation

- `index.html`: names, displayed date, venue, directions, invitation wording, and form labels.
- `styles.css`: colors, layout, and animations.
- `settings.js`: countdown date and RSVP mode/endpoint.
- `assets/`: palace artwork, personalized couple illustration, and favicon.
- `setup/create-google-rsvp.gs`: optional one-time Google Form and response Sheet creator.

Current details: Prateek Singh & Vidhi Singh; 1 March 2027; Govind Dham Resort, Prayagraj; CXG6+2Q4, Sarai Inayat, Nasirapur, Andawa, Uttar Pradesh 221505, India. Ceremony time has not been supplied. Ivory and maroon wedding outfits are illustrative design choices.

## Optional checks

If Node.js is installed, run `npm test` in this folder. The tests use mocked storage/network calls and do not send any RSVPs externally. No dependencies are needed.

Edits stay local until committed and pushed to GitHub.
