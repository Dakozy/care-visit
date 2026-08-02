import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar.jsx';
import StepNavigation from '../components/StepNavigation.jsx';
import SignaturePad from '../components/SignaturePad.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import { getAuth, saveDraft, getDraft, clearDraft } from '../services/localStorage.js';
import { captureLocation } from '../services/gps.js';
import { submitVisitReport, generateSubmissionId } from '../services/googleSheets.js';
import {
  MOOD_OPTIONS, ALERTNESS_OPTIONS, MOBILITY_OPTIONS, EMOTIONAL_OPTIONS,
  WATER_OPTIONS, APPETITE_OPTIONS, WEIGHT_CHANGE_OPTIONS, HYGIENE_QUALITY_OPTIONS,
  CONVERSATION_QUALITY_OPTIONS, YES_NO,
} from '../utils/options.js';
import {
  validateStep1, validateStep2, validateStep3, validateStep4,
  validateStep5Medical, validateStep6, validateStep8,
} from '../utils/validation.js';

const emptyForm = {
  visitDate: new Date().toISOString().slice(0, 10),
  visitTime: new Date().toTimeString().slice(0, 5),
  seniorId: '', seniorName: '', community: '', lga: '',
  latitude: null, longitude: null, deviceTime: '',

  generalMood: '', alertness: '', painLevel: 0, mobility: '',
  fallsSinceLastVisit: '', fallsDescription: '',
  emotionalState: '', emergency: '', emergencyDescription: '',

  breakfast: false, lunch: false, dinner: false,
  waterIntake: '', appetite: '', difficultySwallowing: '', vomiting: '', weightChange: '',

  bathTaken: '', oralHygiene: '', clothesClean: '', bedClean: '', roomClean: '',
  nailsTrimmed: '', hairGroomed: '', toiletHygiene: '',

  bloodPressure: '', pulse: '', temperature: '', bloodSugar: '', respiratoryRate: '', oxygenSaturation: '',
  medicationGiven: '', medicationName: '', dosage: '', adverseReaction: '',
  woundPresent: '', woundDescription: '', clinicalObservation: '',
  referralRequired: '', referralNotes: '',

  familyPresent: '', visitorReceived: '', conversationQuality: '', isolationObserved: '',
  abuseSuspected: '', financialConcern: '', homeSafetyConcern: '', socialNotes: '',

  photosSenior: [], photosEnvironment: [], photosMedication: [], photosWound: [],

  signature: '', signatureDate: new Date().toISOString().slice(0, 10),
};

function OptionPills({ options, value, onChange, alertValues = [] }) {
  return (
    <div className="option-grid">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          className={`option-pill ${value === opt ? 'selected' : ''} ${alertValues.includes(opt) && value === opt ? 'alert' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function YesNoPills({ value, onChange }) {
  return (
    <div className="yesno">
      {YES_NO.map((opt) => (
        <button
          type="button"
          key={opt}
          className={`option-pill ${value === opt ? 'selected' : ''} ${opt === 'Yes' && value === 'Yes' ? '' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function VisitForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useMemo(() => getAuth(), []);
  const isMedical = auth?.category === 'Medical';

  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [seniors, setSeniors] = useState([]);
  const [seniorQuery, setSeniorQuery] = useState('');
  const [visitStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('Locating...');
  const autosaveTimer = useRef(null);

  const totalSteps = isMedical ? 8 : 7;

  useEffect(() => {
    if (!auth) {
      navigate('/');
      return;
    }
    // Resume draft if requested
    if (searchParams.get('resume')) {
      const draft = getDraft();
      if (draft) setForm((f) => ({ ...f, ...draft }));
    }
    // Load seniors list for search/auto-fill
    fetch(`${import.meta.env.BASE_URL}seniors.json`).then((r) => r.json()).then(setSeniors).catch(() => {});

    // Capture GPS + device time once on mount
    captureLocation().then((loc) => {
      setForm((f) => ({ ...f, latitude: loc.latitude, longitude: loc.longitude, deviceTime: new Date().toISOString() }));
      setGpsStatus(loc.error ? `Unavailable (${loc.error})` : `Captured (±${Math.round(loc.accuracy || 0)}m)`);
    });

    // Warn before leaving page
    const beforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);

    // Visit duration timer
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - visitStart) / 1000)), 1000);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      clearInterval(interval);
    };
  }, []);

  // Autosave draft every 10 seconds
  useEffect(() => {
    autosaveTimer.current = setInterval(() => {
      saveDraft(form);
    }, 10000);
    return () => clearInterval(autosaveTimer.current);
  }, [form]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const durationLabel = () => {
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const applySeniorSearch = () => {
    const q = seniorQuery.trim().toLowerCase();
    if (!q) return;
    const match = seniors.find(
      (s) => s.seniorId.toLowerCase() === q || s.name.toLowerCase().includes(q)
    );
    if (match) {
      update({ seniorId: match.seniorId, seniorName: match.name, community: match.community, lga: match.lga });
    }
  };

  const validateCurrentStep = () => {
    let e = {};
    if (step === 1) e = validateStep1(form);
    else if (step === 2) e = validateStep2(form);
    else if (step === 3) e = validateStep3(form);
    else if (step === 4) e = validateStep4(form);
    else if (step === 5 && isMedical) e = validateStep5Medical(form);
    else if ((step === 5 && !isMedical) || (step === 6 && isMedical)) e = validateStep6(form);
    else if ((step === 7 && !isMedical) || (step === 8 && isMedical)) e = validateStep8(form);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = async () => {
    if (!validateCurrentStep()) return;
    if (step < totalSteps) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
      return;
    }
    // Final step -> submit
    setSubmitting(true);
    setSubmitError('');
    const submissionId = generateSubmissionId();
    const payload = {
      ...form,
      submissionId,
      caregiverId: auth.caregiverId,
      caregiverName: auth.name,
      caregiverCategory: auth.category,
    };
    const result = await submitVisitReport(payload);
    setSubmitting(false);
    if (result.ok) {
      clearDraft();
      navigate('/success', { state: { submissionId: result.submissionId, form: payload } });
    } else if (result.offline) {
      setSubmitError('You are offline. Your report has been saved as a draft — please retry once you have a connection.');
      saveDraft(payload);
    } else {
      setSubmitError(`Submission failed: ${result.error}. Your draft has been preserved — you can retry.`);
      saveDraft(payload);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo(0, 0);
    }
  };

  const stepLabels = isMedical
    ? ['Visit Info', 'Wellbeing', 'Nutrition', 'Hygiene', 'Medical', 'Social', 'Photos', 'Signature']
    : ['Visit Info', 'Wellbeing', 'Nutrition', 'Hygiene', 'Social', 'Photos', 'Signature'];

  return (
    <div className="app-shell">
      <div className="topbar">
        <h1>Visit Report</h1>
        <span style={{ fontSize: '0.85rem' }}>⏱ {durationLabel()}</span>
      </div>
      <ProgressBar current={step} total={totalSteps} stepLabel={stepLabels[step - 1]} />
      <div className="container">
        {!navigator.onLine && <div className="banner offline">⚠ Offline — draft is saving locally.</div>}
        {submitError && <div className="banner warning">{submitError}</div>}

        {step === 1 && (
          <div className="card">
            <h2>Section 1: Visit Information</h2>
            <div className="field">
              <label>Search Senior (by ID or Name)</label>
              <div className="search-box">
                <input type="text" placeholder="e.g. SC-1001 or name" value={seniorQuery} onChange={(e) => setSeniorQuery(e.target.value)} />
                <button type="button" className="btn btn-outline" style={{ width: 'auto', padding: '0 16px' }} onClick={applySeniorSearch}>Find</button>
              </div>
              <p className="hint">Auto-fills senior details below when found.</p>
            </div>
            <div className="field">
              <label>Visit Date *</label>
              <input type="date" value={form.visitDate} onChange={(e) => update({ visitDate: e.target.value })} />
              {errors.visitDate && <p className="error-text">{errors.visitDate}</p>}
            </div>
            <div className="field">
              <label>Visit Time *</label>
              <input type="time" value={form.visitTime} onChange={(e) => update({ visitTime: e.target.value })} />
              {errors.visitTime && <p className="error-text">{errors.visitTime}</p>}
            </div>
            <div className="field">
              <label>Caregiver Name</label>
              <input type="text" value={auth.name} disabled />
            </div>
            <div className="field">
              <label>Caregiver ID</label>
              <input type="text" value={auth.caregiverId} disabled />
            </div>
            <div className="field">
              <label>Caregiver Category</label>
              <input type="text" value={auth.category} disabled />
            </div>
            <div className="field">
              <label>Senior Citizen ID *</label>
              <input type="text" value={form.seniorId} onChange={(e) => update({ seniorId: e.target.value })} />
              {errors.seniorId && <p className="error-text">{errors.seniorId}</p>}
            </div>
            <div className="field">
              <label>Senior Citizen Name *</label>
              <input type="text" value={form.seniorName} onChange={(e) => update({ seniorName: e.target.value })} />
              {errors.seniorName && <p className="error-text">{errors.seniorName}</p>}
            </div>
            <div className="field">
              <label>Community *</label>
              <input type="text" value={form.community} onChange={(e) => update({ community: e.target.value })} />
              {errors.community && <p className="error-text">{errors.community}</p>}
            </div>
            <div className="field">
              <label>LGA *</label>
              <input type="text" value={form.lga} onChange={(e) => update({ lga: e.target.value })} />
              {errors.lga && <p className="error-text">{errors.lga}</p>}
            </div>
            <div className="field">
              <label>GPS Location</label>
              <p className="hint">{gpsStatus}{form.latitude ? ` — ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}` : ''}</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2>Section 2: Senior Wellbeing Assessment</h2>
            <div className="field">
              <label>General Mood *</label>
              <OptionPills options={MOOD_OPTIONS} value={form.generalMood} onChange={(v) => update({ generalMood: v })} />
              {errors.generalMood && <p className="error-text">{errors.generalMood}</p>}
            </div>
            <div className="field">
              <label>Alertness *</label>
              <OptionPills options={ALERTNESS_OPTIONS} value={form.alertness} onChange={(v) => update({ alertness: v })} alertValues={['Confused', 'Disoriented']} />
              {errors.alertness && <p className="error-text">{errors.alertness}</p>}
            </div>
            <div className="field">
              <label>Pain Level (0–10) *</label>
              <div className="range-value">{form.painLevel}</div>
              <input type="range" min="0" max="10" value={form.painLevel} onChange={(e) => update({ painLevel: Number(e.target.value) })} />
              {errors.painLevel && <p className="error-text">{errors.painLevel}</p>}
            </div>
            <div className="field">
              <label>Mobility *</label>
              <OptionPills options={MOBILITY_OPTIONS} value={form.mobility} onChange={(v) => update({ mobility: v })} />
              {errors.mobility && <p className="error-text">{errors.mobility}</p>}
            </div>
            <div className="field">
              <label>Falls Since Last Visit? *</label>
              <YesNoPills value={form.fallsSinceLastVisit} onChange={(v) => update({ fallsSinceLastVisit: v })} />
              {errors.fallsSinceLastVisit && <p className="error-text">{errors.fallsSinceLastVisit}</p>}
            </div>
            {form.fallsSinceLastVisit === 'Yes' && (
              <div className="field">
                <label>Describe the Fall *</label>
                <textarea maxLength={500} value={form.fallsDescription} onChange={(e) => update({ fallsDescription: e.target.value })} />
                <div className="char-counter">{form.fallsDescription.length}/500</div>
                {errors.fallsDescription && <p className="error-text">{errors.fallsDescription}</p>}
              </div>
            )}
            <div className="field">
              <label>Emotional State *</label>
              <OptionPills options={EMOTIONAL_OPTIONS} value={form.emotionalState} onChange={(v) => update({ emotionalState: v })} alertValues={['Depressed', 'Agitated']} />
              {errors.emotionalState && <p className="error-text">{errors.emotionalState}</p>}
            </div>
            <div className="field">
              <label>Any Emergency? *</label>
              <YesNoPills value={form.emergency} onChange={(v) => update({ emergency: v })} />
              {errors.emergency && <p className="error-text">{errors.emergency}</p>}
            </div>
            {form.emergency === 'Yes' && (
              <div className="field">
                <label>Describe Emergency Immediately *</label>
                <textarea maxLength={500} value={form.emergencyDescription} onChange={(e) => update({ emergencyDescription: e.target.value })} />
                <div className="char-counter">{form.emergencyDescription.length}/500</div>
                {errors.emergencyDescription && <p className="error-text">{errors.emergencyDescription}</p>}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <h2>Section 3: Nutrition Assessment</h2>
            <div className="field">
              <label>Meals Taken Today</label>
              <div className="option-grid">
                {['breakfast', 'lunch', 'dinner'].map((meal) => (
                  <button
                    type="button"
                    key={meal}
                    className={`option-pill ${form[meal] ? 'selected' : ''}`}
                    onClick={() => update({ [meal]: !form[meal] })}
                  >
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Water Intake *</label>
              <OptionPills options={WATER_OPTIONS} value={form.waterIntake} onChange={(v) => update({ waterIntake: v })} />
              {errors.waterIntake && <p className="error-text">{errors.waterIntake}</p>}
            </div>
            <div className="field">
              <label>Appetite *</label>
              <OptionPills options={APPETITE_OPTIONS} value={form.appetite} onChange={(v) => update({ appetite: v })} alertValues={['None']} />
              {errors.appetite && <p className="error-text">{errors.appetite}</p>}
            </div>
            <div className="field">
              <label>Difficulty Swallowing? *</label>
              <YesNoPills value={form.difficultySwallowing} onChange={(v) => update({ difficultySwallowing: v })} />
              {errors.difficultySwallowing && <p className="error-text">{errors.difficultySwallowing}</p>}
            </div>
            <div className="field">
              <label>Vomiting? *</label>
              <YesNoPills value={form.vomiting} onChange={(v) => update({ vomiting: v })} />
              {errors.vomiting && <p className="error-text">{errors.vomiting}</p>}
            </div>
            <div className="field">
              <label>Weight Change *</label>
              <OptionPills options={WEIGHT_CHANGE_OPTIONS} value={form.weightChange} onChange={(v) => update({ weightChange: v })} />
              {errors.weightChange && <p className="error-text">{errors.weightChange}</p>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card">
            <h2>Section 4: Hygiene Assessment</h2>
            <div className="field">
              <label>Bath Taken? *</label>
              <YesNoPills value={form.bathTaken} onChange={(v) => update({ bathTaken: v })} />
              {errors.bathTaken && <p className="error-text">{errors.bathTaken}</p>}
            </div>
            <div className="field">
              <label>Oral Hygiene *</label>
              <OptionPills options={HYGIENE_QUALITY_OPTIONS} value={form.oralHygiene} onChange={(v) => update({ oralHygiene: v })} alertValues={['Poor']} />
              {errors.oralHygiene && <p className="error-text">{errors.oralHygiene}</p>}
            </div>
            <div className="field">
              <label>Clothes Clean? *</label>
              <YesNoPills value={form.clothesClean} onChange={(v) => update({ clothesClean: v })} />
              {errors.clothesClean && <p className="error-text">{errors.clothesClean}</p>}
            </div>
            <div className="field">
              <label>Bed Clean? *</label>
              <YesNoPills value={form.bedClean} onChange={(v) => update({ bedClean: v })} />
              {errors.bedClean && <p className="error-text">{errors.bedClean}</p>}
            </div>
            <div className="field">
              <label>Room Clean? *</label>
              <YesNoPills value={form.roomClean} onChange={(v) => update({ roomClean: v })} />
              {errors.roomClean && <p className="error-text">{errors.roomClean}</p>}
            </div>
            <div className="field">
              <label>Nails Trimmed? *</label>
              <YesNoPills value={form.nailsTrimmed} onChange={(v) => update({ nailsTrimmed: v })} />
              {errors.nailsTrimmed && <p className="error-text">{errors.nailsTrimmed}</p>}
            </div>
            <div className="field">
              <label>Hair Groomed? *</label>
              <YesNoPills value={form.hairGroomed} onChange={(v) => update({ hairGroomed: v })} />
              {errors.hairGroomed && <p className="error-text">{errors.hairGroomed}</p>}
            </div>
            <div className="field">
              <label>Toilet Hygiene *</label>
              <OptionPills options={HYGIENE_QUALITY_OPTIONS} value={form.toiletHygiene} onChange={(v) => update({ toiletHygiene: v })} alertValues={['Poor']} />
              {errors.toiletHygiene && <p className="error-text">{errors.toiletHygiene}</p>}
            </div>
          </div>
        )}

        {step === 5 && isMedical && (
          <div className="card">
            <h2>Section 5: Medical Assessment</h2>
            <p className="hint">Visible to Medical Caregivers only.</p>
            <div className="field">
              <label>Blood Pressure *</label>
              <input type="text" placeholder="e.g. 120/80" value={form.bloodPressure} onChange={(e) => update({ bloodPressure: e.target.value })} />
              {errors.bloodPressure && <p className="error-text">{errors.bloodPressure}</p>}
            </div>
            <div className="field">
              <label>Pulse (bpm) *</label>
              <input type="number" value={form.pulse} onChange={(e) => update({ pulse: e.target.value })} />
              {errors.pulse && <p className="error-text">{errors.pulse}</p>}
            </div>
            <div className="field">
              <label>Temperature (°C) *</label>
              <input type="number" step="0.1" value={form.temperature} onChange={(e) => update({ temperature: e.target.value })} />
              {errors.temperature && <p className="error-text">{errors.temperature}</p>}
            </div>
            <div className="field">
              <label>Blood Sugar (mg/dL)</label>
              <input type="number" value={form.bloodSugar} onChange={(e) => update({ bloodSugar: e.target.value })} />
            </div>
            <div className="field">
              <label>Respiratory Rate (breaths/min)</label>
              <input type="number" value={form.respiratoryRate} onChange={(e) => update({ respiratoryRate: e.target.value })} />
            </div>
            <div className="field">
              <label>Oxygen Saturation (%)</label>
              <input type="number" value={form.oxygenSaturation} onChange={(e) => update({ oxygenSaturation: e.target.value })} />
            </div>
            <div className="field">
              <label>Medication Given? *</label>
              <YesNoPills value={form.medicationGiven} onChange={(v) => update({ medicationGiven: v })} />
              {errors.medicationGiven && <p className="error-text">{errors.medicationGiven}</p>}
            </div>
            {form.medicationGiven === 'Yes' && (
              <>
                <div className="field">
                  <label>Medication Name *</label>
                  <input type="text" value={form.medicationName} onChange={(e) => update({ medicationName: e.target.value })} />
                  {errors.medicationName && <p className="error-text">{errors.medicationName}</p>}
                </div>
                <div className="field">
                  <label>Dosage</label>
                  <input type="text" value={form.dosage} onChange={(e) => update({ dosage: e.target.value })} />
                </div>
                <div className="field">
                  <label>Adverse Reaction</label>
                  <input type="text" value={form.adverseReaction} onChange={(e) => update({ adverseReaction: e.target.value })} />
                </div>
              </>
            )}
            <div className="field">
              <label>Wound Present? *</label>
              <YesNoPills value={form.woundPresent} onChange={(v) => update({ woundPresent: v })} />
              {errors.woundPresent && <p className="error-text">{errors.woundPresent}</p>}
            </div>
            {form.woundPresent === 'Yes' && (
              <div className="field">
                <label>Describe Wound *</label>
                <textarea maxLength={500} value={form.woundDescription} onChange={(e) => update({ woundDescription: e.target.value })} />
                <div className="char-counter">{form.woundDescription.length}/500</div>
                {errors.woundDescription && <p className="error-text">{errors.woundDescription}</p>}
              </div>
            )}
            <div className="field">
              <label>Clinical Observation</label>
              <textarea maxLength={1000} value={form.clinicalObservation} onChange={(e) => update({ clinicalObservation: e.target.value })} />
              <div className="char-counter">{form.clinicalObservation.length}/1000</div>
            </div>
            <div className="field">
              <label>Referral Required? *</label>
              <YesNoPills value={form.referralRequired} onChange={(v) => update({ referralRequired: v })} />
              {errors.referralRequired && <p className="error-text">{errors.referralRequired}</p>}
            </div>
            {form.referralRequired === 'Yes' && (
              <div className="field">
                <label>Referral Notes</label>
                <textarea maxLength={500} value={form.referralNotes} onChange={(e) => update({ referralNotes: e.target.value })} />
              </div>
            )}
          </div>
        )}

        {((step === 5 && !isMedical) || (step === 6 && isMedical)) && (
          <div className="card">
            <h2>Section 6: Social Interaction</h2>
            <div className="field">
              <label>Family Present? *</label>
              <YesNoPills value={form.familyPresent} onChange={(v) => update({ familyPresent: v })} />
              {errors.familyPresent && <p className="error-text">{errors.familyPresent}</p>}
            </div>
            <div className="field">
              <label>Visitor Received? *</label>
              <YesNoPills value={form.visitorReceived} onChange={(v) => update({ visitorReceived: v })} />
              {errors.visitorReceived && <p className="error-text">{errors.visitorReceived}</p>}
            </div>
            <div className="field">
              <label>Conversation Quality *</label>
              <OptionPills options={CONVERSATION_QUALITY_OPTIONS} value={form.conversationQuality} onChange={(v) => update({ conversationQuality: v })} alertValues={['Poor']} />
              {errors.conversationQuality && <p className="error-text">{errors.conversationQuality}</p>}
            </div>
            <div className="field">
              <label>Isolation Observed? *</label>
              <YesNoPills value={form.isolationObserved} onChange={(v) => update({ isolationObserved: v })} />
              {errors.isolationObserved && <p className="error-text">{errors.isolationObserved}</p>}
            </div>
            <div className="field">
              <label>Abuse Suspected? *</label>
              <YesNoPills value={form.abuseSuspected} onChange={(v) => update({ abuseSuspected: v })} />
              {errors.abuseSuspected && <p className="error-text">{errors.abuseSuspected}</p>}
            </div>
            <div className="field">
              <label>Financial Concern? *</label>
              <YesNoPills value={form.financialConcern} onChange={(v) => update({ financialConcern: v })} />
              {errors.financialConcern && <p className="error-text">{errors.financialConcern}</p>}
            </div>
            <div className="field">
              <label>Home Safety Concern? *</label>
              <YesNoPills value={form.homeSafetyConcern} onChange={(v) => update({ homeSafetyConcern: v })} />
              {errors.homeSafetyConcern && <p className="error-text">{errors.homeSafetyConcern}</p>}
            </div>
            <div className="field">
              <label>Additional Notes</label>
              <textarea maxLength={1000} value={form.socialNotes} onChange={(e) => update({ socialNotes: e.target.value })} />
              <div className="char-counter">{form.socialNotes.length}/1000</div>
            </div>
          </div>
        )}

        {((step === 6 && !isMedical) || (step === 7 && isMedical)) && (
          <div className="card">
            <h2>Section 7: Photo Upload</h2>
            <ImageUpload label="Senior Photograph" images={form.photosSenior} onChange={(v) => update({ photosSenior: v })} />
            <ImageUpload label="Living Environment" images={form.photosEnvironment} onChange={(v) => update({ photosEnvironment: v })} />
            <ImageUpload label="Medication" images={form.photosMedication} onChange={(v) => update({ photosMedication: v })} />
            {isMedical && (
              <ImageUpload label="Wound (Medical only)" images={form.photosWound} onChange={(v) => update({ photosWound: v })} />
            )}
            <p className="hint">Photos are compressed automatically before submission.</p>
          </div>
        )}

        {((step === 7 && !isMedical) || (step === 8 && isMedical)) && (
          <div className="card">
            <h2>Section 8: Digital Signature</h2>
            <div className="field">
              <label>Caregiver Signature *</label>
              <SignaturePad value={form.signature} onChange={(v) => update({ signature: v })} />
              {errors.signature && <p className="error-text">{errors.signature}</p>}
            </div>
            <div className="field">
              <label>Date *</label>
              <input type="date" value={form.signatureDate} onChange={(e) => update({ signatureDate: e.target.value })} />
              {errors.signatureDate && <p className="error-text">{errors.signatureDate}</p>}
            </div>
          </div>
        )}

        <StepNavigation
          onBack={goBack}
          onNext={goNext}
          isFirst={step === 1}
          isLast={step === totalSteps}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
