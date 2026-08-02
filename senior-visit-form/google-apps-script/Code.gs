/**
 * O. B. Lulu-Briggs Foundation
 * Senior Citizen Daily Care Visit Reporting System — Apps Script Backend
 *
 * SETUP:
 * 1. Create a new Google Sheet.
 * 2. Extensions > Apps Script, paste this file's contents as Code.gs.
 * 3. Run `setupSheet` once from the Apps Script editor to create headers.
 * 4. Deploy > New deployment > Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the Web App URL into src/services/googleSheets.js (WEB_APP_URL).
 *
 * See docs/APPS_SCRIPT_DEPLOYMENT_GUIDE.md for full step-by-step instructions.
 */

const SHEET_NAME = 'Visit Reports';

const HEADERS = [
  'Timestamp', 'Submission ID', 'Device Time', 'Latitude', 'Longitude',
  'Browser', 'Operating System', 'Submission Status',

  // Section 1
  'Visit Date', 'Visit Time', 'Caregiver Name', 'Caregiver ID', 'Caregiver Category',
  'Senior Citizen ID', 'Senior Citizen Name', 'Community', 'LGA',

  // Section 2
  'General Mood', 'Alertness', 'Pain Level', 'Mobility',
  'Falls Since Last Visit', 'Falls Description',
  'Emotional State', 'Emergency', 'Emergency Description',

  // Section 3
  'Breakfast', 'Lunch', 'Dinner', 'Water Intake', 'Appetite',
  'Difficulty Swallowing', 'Vomiting', 'Weight Change',

  // Section 4
  'Bath Taken', 'Oral Hygiene', 'Clothes Clean', 'Bed Clean', 'Room Clean',
  'Nails Trimmed', 'Hair Groomed', 'Toilet Hygiene',

  // Section 5 (Medical)
  'Blood Pressure', 'Pulse', 'Temperature', 'Blood Sugar', 'Respiratory Rate',
  'Oxygen Saturation', 'Medication Given', 'Medication Name', 'Dosage',
  'Adverse Reaction', 'Wound Present', 'Wound Description', 'Clinical Observation',
  'Referral Required', 'Referral Notes',

  // Section 6
  'Family Present', 'Visitor Received', 'Conversation Quality', 'Isolation Observed',
  'Abuse Suspected', 'Financial Concern', 'Home Safety Concern', 'Social Notes',

  // Section 7 (photos stored as Base64 or Drive links — see note below)
  'Photo - Senior', 'Photo - Environment', 'Photo - Medication', 'Photo - Wound',

  // Section 8
  'Signature', 'Signature Date',
];

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.clear();
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1f6feb').setFontColor('#ffffff');
  sheet.autoResizeColumns(1, HEADERS.length);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'No data received.' });
    }

    const data = JSON.parse(e.postData.contents);

    const validationError = validatePayload(data);
    if (validationError) {
      return jsonResponse({ status: 'error', message: validationError });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || (() => { setupSheet(); return ss.getSheetByName(SHEET_NAME); })();

    // Prevent duplicate submissions: check if this Submission ID already exists.
    const existingIds = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 0), 1).getValues().flat();
    if (existingIds.includes(data.submissionId)) {
      return jsonResponse({ status: 'success', message: 'Duplicate submission ignored.', submissionId: data.submissionId });
    }

    // Store photos: Google Sheets cells have a 50,000 character limit, so
    // storing full Base64 images directly in cells is not recommended at
    // scale. By default this script records only a photo count per section.
    // For production use, see saveImageToDrive() below and call it here to
    // upload each Base64 image to a Drive folder and store the file link
    // instead.
    const row = [
      new Date(),                                  // Timestamp
      data.submissionId || '',
      data.deviceTime || '',
      data.latitude || '',
      data.longitude || '',
      data.browser || '',
      data.operatingSystem || '',
      'Received',

      data.visitDate || '', data.visitTime || '', data.caregiverName || '',
      data.caregiverId || '', data.caregiverCategory || '',
      data.seniorId || '', data.seniorName || '', data.community || '', data.lga || '',

      data.generalMood || '', data.alertness || '', data.painLevel ?? '', data.mobility || '',
      data.fallsSinceLastVisit || '', data.fallsDescription || '',
      data.emotionalState || '', data.emergency || '', data.emergencyDescription || '',

      boolText(data.breakfast), boolText(data.lunch), boolText(data.dinner),
      data.waterIntake || '', data.appetite || '',
      data.difficultySwallowing || '', data.vomiting || '', data.weightChange || '',

      data.bathTaken || '', data.oralHygiene || '', data.clothesClean || '', data.bedClean || '',
      data.roomClean || '', data.nailsTrimmed || '', data.hairGroomed || '', data.toiletHygiene || '',

      data.bloodPressure || '', data.pulse || '', data.temperature || '', data.bloodSugar || '',
      data.respiratoryRate || '', data.oxygenSaturation || '', data.medicationGiven || '',
      data.medicationName || '', data.dosage || '', data.adverseReaction || '',
      data.woundPresent || '', data.woundDescription || '', data.clinicalObservation || '',
      data.referralRequired || '', data.referralNotes || '',

      data.familyPresent || '', data.visitorReceived || '', data.conversationQuality || '',
      data.isolationObserved || '', data.abuseSuspected || '', data.financialConcern || '',
      data.homeSafetyConcern || '', data.socialNotes || '',

      imageCellValue(data.photosSenior),
      imageCellValue(data.photosEnvironment),
      imageCellValue(data.photosMedication),
      imageCellValue(data.photosWound),

      data.signature ? 'Signed' : '', data.signatureDate || '',
    ];

    sheet.appendRow(row);

    return jsonResponse({ status: 'success', message: 'Report saved.', submissionId: data.submissionId });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse({ status: 'ok', message: 'Senior Care Visit API is running.' });
}

function validatePayload(data) {
  const required = ['submissionId', 'visitDate', 'seniorId', 'seniorName', 'caregiverId'];
  for (const field of required) {
    if (!data[field]) return `Missing required field: ${field}`;
  }
  return null;
}

function boolText(v) {
  return v ? 'Yes' : 'No';
}

// Store a count/placeholder instead of full Base64 to keep cells manageable;
// swap this for a Drive-upload implementation for production scale.
function imageCellValue(photosArray) {
  if (!photosArray || !photosArray.length) return '';
  return `${photosArray.length} photo(s) attached`;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * OPTIONAL: Uploads a single Base64 data URL to a Google Drive folder and
 * returns a shareable link. To use this, create a Drive folder, put its ID
 * in DRIVE_FOLDER_ID below, and call this function for each photo in
 * doPost() instead of using imageCellValue().
 */
const DRIVE_FOLDER_ID = 'REPLACE_WITH_YOUR_DRIVE_FOLDER_ID';

function saveImageToDrive(dataUrl, fileNamePrefix) {
  if (!dataUrl || !dataUrl.startsWith('data:image')) return '';
  const parts = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!parts) return '';
  const contentType = parts[1];
  const bytes = Utilities.base64Decode(parts[2]);
  const blob = Utilities.newBlob(bytes, contentType, `${fileNamePrefix}-${Date.now()}.jpg`);
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}
