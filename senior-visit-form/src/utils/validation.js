// Returns an object of { fieldName: 'error message' } — empty object means valid.

export function validateStep1(d) {
  const e = {};
  if (!d.visitDate) e.visitDate = 'Visit date is required.';
  if (!d.visitTime) e.visitTime = 'Visit time is required.';
  if (!d.seniorId) e.seniorId = 'Senior citizen ID is required.';
  if (!d.seniorName) e.seniorName = 'Senior citizen name is required.';
  if (!d.community) e.community = 'Community is required.';
  if (!d.lga) e.lga = 'LGA is required.';
  return e;
}

export function validateStep2(d) {
  const e = {};
  if (!d.generalMood) e.generalMood = 'Please select the general mood.';
  if (!d.alertness) e.alertness = 'Please select alertness.';
  if (d.painLevel === undefined || d.painLevel === null || d.painLevel === '') e.painLevel = 'Please set the pain level.';
  if (!d.mobility) e.mobility = 'Please select mobility.';
  if (!d.fallsSinceLastVisit) e.fallsSinceLastVisit = 'Please answer this question.';
  if (d.fallsSinceLastVisit === 'Yes' && !d.fallsDescription) e.fallsDescription = 'Please describe the fall.';
  if (!d.emotionalState) e.emotionalState = 'Please select emotional state.';
  if (!d.emergency) e.emergency = 'Please answer this question.';
  if (d.emergency === 'Yes' && !d.emergencyDescription) e.emergencyDescription = 'Please describe the emergency.';
  return e;
}

export function validateStep3(d) {
  const e = {};
  if (!d.waterIntake) e.waterIntake = 'Please select water intake.';
  if (!d.appetite) e.appetite = 'Please select appetite.';
  if (!d.difficultySwallowing) e.difficultySwallowing = 'Please answer this question.';
  if (!d.vomiting) e.vomiting = 'Please answer this question.';
  if (!d.weightChange) e.weightChange = 'Please select weight change.';
  return e;
}

export function validateStep4(d) {
  const e = {};
  if (!d.bathTaken) e.bathTaken = 'Required.';
  if (!d.oralHygiene) e.oralHygiene = 'Required.';
  if (!d.clothesClean) e.clothesClean = 'Required.';
  if (!d.bedClean) e.bedClean = 'Required.';
  if (!d.roomClean) e.roomClean = 'Required.';
  if (!d.nailsTrimmed) e.nailsTrimmed = 'Required.';
  if (!d.hairGroomed) e.hairGroomed = 'Required.';
  if (!d.toiletHygiene) e.toiletHygiene = 'Required.';
  return e;
}

export function validateStep5Medical(d) {
  const e = {};
  if (!d.bloodPressure) e.bloodPressure = 'Blood pressure is required.';
  if (!d.pulse) e.pulse = 'Pulse is required.';
  if (!d.temperature) e.temperature = 'Temperature is required.';
  if (!d.medicationGiven) e.medicationGiven = 'Please answer this question.';
  if (d.medicationGiven === 'Yes' && !d.medicationName) e.medicationName = 'Medication name is required.';
  if (!d.woundPresent) e.woundPresent = 'Please answer this question.';
  if (d.woundPresent === 'Yes' && !d.woundDescription) e.woundDescription = 'Please describe the wound.';
  if (!d.referralRequired) e.referralRequired = 'Please answer this question.';
  return e;
}

export function validateStep6(d) {
  const e = {};
  if (!d.familyPresent) e.familyPresent = 'Required.';
  if (!d.visitorReceived) e.visitorReceived = 'Required.';
  if (!d.conversationQuality) e.conversationQuality = 'Required.';
  if (!d.isolationObserved) e.isolationObserved = 'Required.';
  if (!d.abuseSuspected) e.abuseSuspected = 'Required.';
  if (!d.financialConcern) e.financialConcern = 'Required.';
  if (!d.homeSafetyConcern) e.homeSafetyConcern = 'Required.';
  return e;
}

export function validateStep8(d) {
  const e = {};
  if (!d.signature) e.signature = 'Caregiver signature is required.';
  if (!d.signatureDate) e.signatureDate = 'Signature date is required.';
  return e;
}
