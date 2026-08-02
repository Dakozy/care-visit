# Google Sheet Column Template

Running `setupSheet()` (see Apps Script guide) creates a "Visit Reports" tab with these columns, in order:

| # | Column | Notes |
|---|--------|-------|
| 1 | Timestamp | Server-side receipt time |
| 2 | Submission ID | Unique per report; used to prevent duplicates |
| 3 | Device Time | Caregiver's device clock at capture |
| 4 | Latitude | GPS |
| 5 | Longitude | GPS |
| 6 | Browser | Detected from User-Agent |
| 7 | Operating System | Detected from User-Agent |
| 8 | Submission Status | "Received" on success |
| 9 | Visit Date | |
| 10 | Visit Time | |
| 11 | Caregiver Name | |
| 12 | Caregiver ID | |
| 13 | Caregiver Category | Medical / Non-Medical |
| 14 | Senior Citizen ID | |
| 15 | Senior Citizen Name | |
| 16 | Community | |
| 17 | LGA | |
| 18 | General Mood | |
| 19 | Alertness | |
| 20 | Pain Level | 0–10 |
| 21 | Mobility | |
| 22 | Falls Since Last Visit | Yes/No |
| 23 | Falls Description | |
| 24 | Emotional State | |
| 25 | Emergency | Yes/No |
| 26 | Emergency Description | |
| 27 | Breakfast | Yes/No |
| 28 | Lunch | Yes/No |
| 29 | Dinner | Yes/No |
| 30 | Water Intake | |
| 31 | Appetite | |
| 32 | Difficulty Swallowing | Yes/No |
| 33 | Vomiting | Yes/No |
| 34 | Weight Change | |
| 35 | Bath Taken | Yes/No |
| 36 | Oral Hygiene | |
| 37 | Clothes Clean | Yes/No |
| 38 | Bed Clean | Yes/No |
| 39 | Room Clean | Yes/No |
| 40 | Nails Trimmed | Yes/No |
| 41 | Hair Groomed | Yes/No |
| 42 | Toilet Hygiene | |
| 43 | Blood Pressure | Medical only |
| 44 | Pulse | Medical only |
| 45 | Temperature | Medical only |
| 46 | Blood Sugar | Medical only |
| 47 | Respiratory Rate | Medical only |
| 48 | Oxygen Saturation | Medical only |
| 49 | Medication Given | Medical only |
| 50 | Medication Name | Medical only |
| 51 | Dosage | Medical only |
| 52 | Adverse Reaction | Medical only |
| 53 | Wound Present | Medical only |
| 54 | Wound Description | Medical only |
| 55 | Clinical Observation | Medical only |
| 56 | Referral Required | Medical only |
| 57 | Referral Notes | Medical only |
| 58 | Family Present | Yes/No |
| 59 | Visitor Received | Yes/No |
| 60 | Conversation Quality | |
| 61 | Isolation Observed | Yes/No |
| 62 | Abuse Suspected | Yes/No |
| 63 | Financial Concern | Yes/No |
| 64 | Home Safety Concern | Yes/No |
| 65 | Social Notes | |
| 66 | Photo - Senior | Count by default, or Drive link (see Apps Script guide) |
| 67 | Photo - Environment | Count by default, or Drive link |
| 68 | Photo - Medication | Count by default, or Drive link |
| 69 | Photo - Wound | Count by default, or Drive link |
| 70 | Signature | "Signed" if a signature was captured |
| 71 | Signature Date | |

Non-Medical caregiver submissions will leave columns 43–57 blank.
