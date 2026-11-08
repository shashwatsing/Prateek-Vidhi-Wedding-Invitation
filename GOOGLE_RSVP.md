# Save wedding RSVPs in Google Sheets / Drive

Recommended arrangement:

**Local preview or GitHub Pages invitation → Google Form → private response Sheet in your Drive.**

Google Forms provides submission handling and the confirmation screen. The RSVP area uses Google’s own form styling. The custom door animation, portraits, wedding details, and directions stay as they are. No Apps Script deployment or secret browser key is needed for this option.

## Set up the blank form you already created

Your current responder link is https://forms.gle/z28YHsrQX9MKb6Fv5. It currently opens an untitled form with Google's starter question. Keep RSVP closed on the invitation until the wedding questions are ready.

1. Open that form from [Google Forms](https://forms.google.com) in **editing mode**, using the account that owns it.
2. In the form editor, choose **More (three dots) → Apps Script**.
3. Replace the example code in `Code.gs` with [setup/create-google-rsvp.gs](./setup/create-google-rsvp.gs).
4. Save, select **createWeddingRsvp**, then click **Run**. Complete Google's authorization prompt yourself.
5. Return to the form editor and refresh. The script fills in the wedding details, adds the RSVP questions, reuses the untouched starter question, and creates or reuses a linked response Sheet.
6. Review/publish the form with responder access for **Anyone with the link**. Keep the Sheet private, and leave **Limit to 1 response** and **View results summary** off.
7. Test one RSVP in a signed-out/private browser window and confirm the row appears in the response Sheet. Then the responder link can be connected to the invitation.

Run the script from the form's own **Apps Script** menu to use this existing form. Opening a separate script project will create a different form.

Full responder URL, for connecting after setup:

```text
https://docs.google.com/forms/d/e/1FAIpQLSfuakTW1kegGtd_JqsysRevkk8D5BXd_G0_ngxDkEBleAj3hw/viewform
```

## Alternative: create a new form and Sheet together

The optional [setup script](./setup/create-google-rsvp.gs) creates both files in your Google account. This is a one-time setup helper; RSVP submissions go directly through Google Forms, without a deployed script backend.

1. Open [a new Google Apps Script project](https://script.google.com/home/start) using the personal Google account that should own the guest list.
2. Replace the example code in `Code.gs` with the full contents of `setup/create-google-rsvp.gs`.
3. Save, select **createWeddingRsvp**, then click **Run**. Google will ask you to authorize this script to create/access Forms and Sheets in your account. Complete that account authorization yourself.
4. The **Execution log** will show an **EDIT FORM** link, a **PRIVATE RESPONSE SHEET** link, and a **RESPONDER LINK**. Open **EDIT FORM** and review the questions.
5. Click **Publish**, set responder access to **Anyone with the link**, and publish. Keep **Limit to 1 response** and **View results summary** off. Leave the response Sheet private.
6. Test the responder link in a signed-out/private browser window. Submit an identifiable test RSVP and check that it appears in the Sheet.
7. Send the full **RESPONDER LINK** to connect the invitation, or paste it into `googleFormUrl` in `settings.js`.

The script is prepared but has not been run in your account. In a standalone project it creates a draft form; publishing it is a separate step. Re-running it in the same Apps Script project reuses the existing form and Sheet. If an account policy or authorization screen blocks you, use the manual steps below instead.

## 1. Create the form

Open Google Forms and create a form titled **Prateek & Vidhi — Wedding RSVP**.

Suggested description:

> We look forward to celebrating with you on 1 March 2027 at Govind Dham Resort, Prayagraj. Kindly let us know whether you will join us.

Add these questions:

| Question | Type | Required |
| --- | --- | --- |
| Your full name | Short answer | Yes |
| Email address | Short answer, email validation | Yes |
| Will you attend? | Multiple choice: Joyfully accepts / Regretfully declines | Yes |
| Number of guests, including you | Dropdown: 0 (not attending), 1–10 | Yes |
| A note for us / dietary needs | Paragraph | No |

Set the confirmation text to **Thank you! Your RSVP has been recorded. With love, Prateek & Vidhi.** Enable response editing if you want guests to revise their answers; Google supplies the response editing link.

## 2. Link a response Sheet

In the form’s **Responses** section, choose **Link to Sheets** (or **Select destination for responses**) and create a spreadsheet named **Prateek & Vidhi — Guest RSVPs**. New replies will appear there, and you can find the spreadsheet in Drive.

Keep the response spreadsheet private to you and the family members helping plan the wedding. Guests need responder access to the form, not access to the spreadsheet. Keep **View results summary** turned off so respondents cannot view other guests’ answers.

## 3. Make the form available to guests

Publish the form and choose the responder audience you want. For guests without Google accounts, do not enable **Limit to 1 response** or any account-only/domain restriction; use an ordinary email question instead of verified email collection. Organizational account policies can restrict these options. Test the responder link in a signed-out/private browser window before sharing.

Copy the **full responder link**, shaped like:

```text
https://docs.google.com/forms/d/e/FORM_ID/viewform
```

Use the responder link, not the `/edit` link. If Google gives you a short `forms.gle` link, open it and copy the full `docs.google.com` URL from the address bar.

## 4. Connect it to the local invitation

In `settings.js`, set:

```js
rsvp: {
  mode: 'google-forms',
  formspreeEndpoint: '',
  googleFormUrl: 'https://docs.google.com/forms/d/e/YOUR_ACTUAL_FORM_ID/viewform',
},
```

Refresh Live Server. The RSVP section will show the embedded form and a link to open it in a separate tab. Google handles its own submission confirmation; the invitation never assumes an iframe load means a reply was saved.

Submit one identifiable test reply, then confirm that it appears in the linked Sheet. Once that works, the same files can be published on GitHub Pages. Existing browser-only preview replies are not transferred to Google automatically.

No Google account or backend has been connected by these file changes. No test reply has been sent to Google. The invitation is configured for Google Forms but shows that RSVP is not open until a valid responder URL is added.

## If you want to keep the current custom-styled RSVP form

A Google Apps Script web app can accept a submission and write a row to a Sheet. That preserves the custom fields but requires deployment, server-side validation, spam handling, and a reliable submission acknowledgement across origins. The embedded Google Form is the simpler option for this wedding. This project does not use an opaque `no-cors` request and pretend that it proves a reply was saved.

## Official instructions

- Publish, share, or embed a form: https://support.google.com/docs/answer/2839588
- Choose a response Sheet: https://support.google.com/docs/answer/2917686
- View responses and export CSV: https://support.google.com/docs/answer/139706
- Apps Script web apps, if choosing the custom route later: https://developers.google.com/apps-script/guides/web
