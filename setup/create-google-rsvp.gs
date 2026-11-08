/**
 * To use an existing form: open its editor, choose More > Apps Script, paste
 * this code there, then run createWeddingRsvp. The bound form is used first.
 * A standalone Apps Script project creates a new draft form instead.
 * Creates or reuses a linked response spreadsheet in your account.
 * Review the form, then publish it for anyone with the link.
 * No emails are sent. No guest responses or access keys belong in this file.
 * Re-running in the SAME Apps Script project reuses the saved form and sheet.
 */
function createWeddingRsvp() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const saved = PropertiesService.getScriptProperties();
    const activeForm = FormApp.getActiveForm();
    const formId = saved.getProperty('WEDDING_FORM_ID');
    if (activeForm && formId && formId !== activeForm.getId()) {
      throw new Error('This script was already used for a different form. Open Apps Script from the intended form and use a fresh project.');
    }
    const form = activeForm || (formId
      ? FormApp.openById(formId)
      : FormApp.create('Prateek & Vidhi — Wedding RSVP', false));
    if (!formId) saved.setProperty('WEDDING_FORM_ID', form.getId());

    const sheetId = saved.getProperty('WEDDING_SHEET_ID') || form.getDestinationId();
    const sheet = sheetId
      ? SpreadsheetApp.openById(sheetId)
      : SpreadsheetApp.create('Prateek & Vidhi — Guest RSVPs');
    saved.setProperty('WEDDING_SHEET_ID', sheet.getId());

    if (saved.getProperty('WEDDING_SETUP_COMPLETE') !== 'yes') {
      form.setTitle('Prateek & Vidhi — Wedding RSVP');
      form.setDescription(
        'With our families, we invite you to celebrate the wedding of Prateek Singh and Vidhi Singh.\n\n' +
        'Monday, 1 March 2027\nGovind Dham Resort, Prayagraj\n' +
        'CXG6+2Q4, Sarai Inayat, Nasirapur, Andawa, Uttar Pradesh 221505, India\n\n' +
        'Please submit one reply per family or group. Your answers are for the wedding hosts.'
      );
      form.setConfirmationMessage(
        'Thank you! Your RSVP has been recorded. With love, Prateek & Vidhi.'
      );
      form.setCollectEmail(false);
      form.setLimitOneResponsePerUser(false);
      form.setAllowResponseEdits(true);
      form.setPublishingSummary(false);
      form.setShowLinkToRespondAgain(false);
      form.setShuffleQuestions(false);

      // Turn Google's untouched starter question into the attendance question.
      // Existing custom questions are kept, and no response data is deleted.
      let starter = null;
      const initialItems = form.getItems();
      if (initialItems.length === 1 && initialItems[0].getType() === FormApp.ItemType.MULTIPLE_CHOICE) {
        const item = initialItems[0].asMultipleChoiceItem();
        const choices = item.getChoices();
        if (item.getTitle() === 'Untitled Question' && choices.length === 1 && choices[0].getValue() === 'Option 1' && form.getResponses().length === 0) {
          starter = item;
          starter.setTitle('Will you attend?').setRequired(true)
            .setChoiceValues(['Joyfully accepts', 'Regretfully declines']);
        }
      }

      // Reuse any questions created before an interrupted setup.
      const titles = new Set(form.getItems().map(function (item) { return item.getTitle(); }));
      if (!titles.has('Your full name')) {
        form.addTextItem().setTitle('Your full name').setRequired(true);
      }
      if (!titles.has('Email address')) {
        form.addTextItem().setTitle('Email address').setRequired(true)
          .setHelpText('Enter your email address. Google sign-in is not required by this question.')
          .setValidation(FormApp.createTextValidation().requireTextIsEmail()
            .setHelpText('Please enter a valid email address.').build());
      }
      if (!titles.has('Will you attend?')) {
        form.addMultipleChoiceItem().setTitle('Will you attend?').setRequired(true)
          .setChoiceValues(['Joyfully accepts', 'Regretfully declines']);
      }
      if (starter) form.moveItem(starter.getIndex(), 2);
      if (!titles.has('Number of guests, including you')) {
        form.addListItem().setTitle('Number of guests, including you').setRequired(true)
          .setHelpText('Choose 0 if you are unable to attend.')
          .setChoiceValues(['0 (not attending)', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
      }
      if (!titles.has('A note for us / dietary needs')) {
        form.addParagraphTextItem().setTitle('A note for us / dietary needs').setRequired(false);
      }
      if (form.getDestinationId() !== sheet.getId()) {
        form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
      }
      saved.setProperty('WEDDING_SETUP_COMPLETE', 'yes');
    }

    console.log('EDIT FORM: ' + form.getEditUrl());
    console.log('PRIVATE RESPONSE SHEET: ' + sheet.getUrl());
    console.log('RESPONDER LINK (send this to connect the invitation): ' + form.getPublishedUrl());
    console.log('Next: review the form, publish with responder access for anyone with the link, then test the responder link while signed out. Keep the response Sheet private.');
  } finally {
    lock.releaseLock();
  }
}
