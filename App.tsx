// IMPORTANT: Ce fichier est en TypeScript avec JSX (.tsx).
// Pour qu'il s'exécute correctement dans un navigateur, il DOIT être transpilé en JavaScript standard (par exemple, via un processus de build avec Vite, Parcel, Webpack, ou Next.js).
// L'erreur "Invalid or unexpected token" se produit souvent si le navigateur reçoit directement du code TSX/JSX.

import React, { useState, useCallback, useMemo, useTransition, useDeferredValue, useEffect } from 'react';
import { PatientData, ValidationErrors, CATQuestion, StepDefinition as StepDefinitionType, TreatmentRecommendation, CATScoreFields } from './types'; // Renamed StepDefinition to StepDefinitionType to avoid conflict
import { 
    ChevronRight, ChevronDown, AlertTriangle, CheckCircle, Info, Calculator, FileText, Activity, Users, Settings, Printer, User, LucideProps, X, Hospital, Stethoscope, Pill, AirVent, AlertOctagon, Repeat, Home, HelpCircle, GitFork,
    CalendarClock, ClipboardList, Baseline, Bike, HeartPulse, FilePenLine, HandHeart, Scissors, Layers, Slice, Recycle
} from 'lucide-react';

// Helper to type Lucide icons more strictly if needed, otherwise React.ElementType is fine
type IconComponent = React.FC<LucideProps>;

// Props for ExpandableSection (externalized)
interface ExternalExpandableSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const ExternalExpandableSection: React.FC<ExternalExpandableSectionProps> = React.memo(({
  title,
  icon: Icon,
  children,
  sectionKey,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 shadow-sm">
      <button
        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`section-content-${sectionKey}`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-left text-gray-700">{title}</span>
        </div>
        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
      </button>
      {isExpanded && (
        <div id={`section-content-${sectionKey}`} className="p-4 border-t border-gray-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
});
ExternalExpandableSection.displayName = 'ExternalExpandableSection';


// Props for PatientInfoStep (externalized)
interface PatientInfoStepProps {
  patientData: PatientData;
  handleFieldChange: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  validationErrors: ValidationErrors;
}

const PatientInfoStep: React.FC<PatientInfoStepProps> = React.memo(({
  patientData,
  handleFieldChange,
  validationErrors
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Informations du patient</h3>
        <p className="text-blue-700 text-base">Saisissez les informations de base du patient pour commencer l'évaluation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="patientName" className="block text-base font-medium text-gray-700 mb-1">Nom et prénom du patient *</label>
          <input
            id="patientName"
            type="text"
            value={patientData.patientName}
            onChange={(e) => handleFieldChange('patientName', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.patientName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nom Prénom"
            autoComplete="name"
          />
          {validationErrors.patientName && (
            <p className="text-red-600 text-sm mt-1" role="alert">{validationErrors.patientName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="patientAge" className="block text-base font-medium text-gray-700 mb-1">Âge *</label>
          <input
            id="patientAge"
            type="number"
            min="18"
            max="120"
            value={patientData.patientAge}
            onChange={(e) => handleFieldChange('patientAge', e.target.value)}
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationErrors.patientAge ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="65"
            autoComplete="age"
          />
          {validationErrors.patientAge && (
            <p className="text-red-600 text-sm mt-1" role="alert">{validationErrors.patientAge}</p>
          )}
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <span className="font-semibold text-green-800">Prêt à commencer</span>
        </div>
        <p className="text-green-700 text-base">
          Une fois les informations saisies, vous pourrez procéder à l'évaluation diagnostique selon les critères GOLD 2025.
        </p>
      </div>
    </div>
  );
});
PatientInfoStep.displayName = 'PatientInfoStep';


const initialPatientData: PatientData = {
  patientName: '',
  patientAge: '',
  gender: '',
  
  dyspnea: false,
  chronicCough: false,
  sputumProduction: false,
  recurrentInfections: false,
  
  smokingHistory: false,
  occupationalExposure: false,
  biomassExposure: false,
  airPollution: false,
  
  preBronchodilatorFEV1FVC: '',
  postBronchodilatorFEV1FVC: '',
  fev1Predicted: '',
  
  mmrcScore: '',
  
  catCough: '',
  catPhlegm: '',  
  catChestTightness: '',
  catBreathlessness: '',
  catActivityLimitation: '',
  catConfidenceLeaving: '',
  catSleep: '',
  catEnergy: '',
  
  exacerbationsLastYear: '',
  hospitalizationsLastYear: '',
  
  bloodEosinophils: '',
  
  currentTreatment: [],
  comorbidities: []
};

interface CATScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (catScores: CATScoreFields) => void;
  initialData: CATScoreFields;
  catQuestions: CATQuestion[];
}

const CATScoreModal: React.FC<CATScoreModalProps> = ({ isOpen, onClose, onSubmit, initialData, catQuestions }) => {
  const [localCatScores, setLocalCatScores] = useState<CATScoreFields>(initialData);

  useEffect(() => {
    if (isOpen) {
      setLocalCatScores(initialData);
    }
  }, [initialData, isOpen]);

  const handleScoreChange = (field: keyof CATScoreFields, value: string) => {
    setLocalCatScores(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const allFilled = catQuestions.every(q => {
      const fieldValue = localCatScores[q.field as keyof CATScoreFields];
      return fieldValue !== '' && fieldValue !== undefined && fieldValue !== null;
    });

    if (allFilled) {
      onSubmit(localCatScores);
    } else {
      alert("Veuillez répondre à toutes les questions du score CAT pour valider.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="cat-modal-title">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 id="cat-modal-title" className="text-xl font-semibold text-gray-800">Test d'évaluation de la BPCO (CAT)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-base">
              Pour chaque item, cochez la case qui décrit le mieux votre état actuel (0 = pas du tout, 5 = extrêmement).
            </p>
          </div>
          {catQuestions.map((q, index) => (
            <div key={q.field} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-2">Question {index + 1}: {q.description}</h5>
              <div className="mb-3 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>0: {q.question}</span>
                  <span>5: {q.opposite}</span>
                </div>
              </div>
              <fieldset className="flex justify-between items-center space-x-1 sm:space-x-2">
                <legend className="sr-only">{q.description}</legend>
                {[0, 1, 2, 3, 4, 5].map(score => (
                  <label key={score} className="flex flex-col items-center space-y-1 cursor-pointer p-1 hover:bg-blue-50 rounded-md">
                    <input
                      type="radio"
                      name={q.field}
                      value={score.toString()}
                      checked={localCatScores[q.field as keyof CATScoreFields] === score.toString()}
                      onChange={(e) => handleScoreChange(q.field as keyof CATScoreFields, e.target.value)}
                      className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-base font-medium text-gray-700">{score}</span>
                  </label>
                ))}
              </fieldset>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Valider et Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
CATScoreModal.displayName = 'CATScoreModal';

// Common props for all step components
interface StepComponentCommonProps {
  patientData: PatientData;
  handleFieldChange: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  validationErrors: ValidationErrors;
  expandedSections: Record<string, boolean>;
  onToggleSection: (sectionKey: string) => void;
  // Add other common props if needed by most steps
}


export const COPDDecisionSupport: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string>('patient-info');
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);
  
  const [isPending, startTransition] = useTransition();
  
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const deferredPatientData = useDeferredValue(patientData);

  const calculateCATScore = useMemo(() => {
    const catFields: (keyof CATScoreFields)[] = ['catCough', 'catPhlegm', 'catChestTightness', 'catBreathlessness', 
                      'catActivityLimitation', 'catConfidenceLeaving', 'catSleep', 'catEnergy'];
    let total = 0;
    let completedFields = 0;
    catFields.forEach(field => {
      const valueStr = deferredPatientData[field] as string;
      if (valueStr && valueStr.trim() !== '') {
        const value = parseInt(valueStr);
        if (!isNaN(value)) {
          total += value;
        }
        completedFields++;
      }
    });
    return completedFields === catFields.length ? total : null;
  }, [deferredPatientData]);

  const clearValidationError = useCallback((field: keyof ValidationErrors) => {
    setValidationErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleFieldChange = useCallback(<K extends keyof PatientData>(field: K, value: PatientData[K]) => {
    setPatientData(prevData => ({ ...prevData, [field]: value }));
    setValidationErrors(prevErrors => {
        const fieldName = field as keyof ValidationErrors;
        if (prevErrors[fieldName]) {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
        }
        return prevErrors;
    });
  }, []);

  const validateCurrentStep = useCallback(() => {
    const errors: ValidationErrors = {};
    switch(currentStep) {
      case 'patient-info':
        if (!patientData.patientName.trim()) errors.patientName = 'Nom requis';
        if (!patientData.patientAge.trim()) errors.patientAge = 'Âge requis';
        else if (isNaN(parseInt(patientData.patientAge)) || parseInt(patientData.patientAge) < 18 || parseInt(patientData.patientAge) > 120) {
          errors.patientAge = 'Âge doit être entre 18 et 120';
        }
        break;
      case 'diagnostic':
        if (!patientData.postBronchodilatorFEV1FVC) {
          errors.postBronchodilatorFEV1FVC = 'VEMS/CVF post-bronchodilatateur requis pour le diagnostic';
        } else if (isNaN(parseFloat(patientData.postBronchodilatorFEV1FVC)) || parseFloat(patientData.postBronchodilatorFEV1FVC) < 0 || parseFloat(patientData.postBronchodilatorFEV1FVC) > 1) {
          errors.postBronchodilatorFEV1FVC = 'VEMS/CVF doit être entre 0 et 1';
        }
        break;
      case 'assessment':
        if (!patientData.fev1Predicted) errors.fev1Predicted = 'VEMS % prédit requis';
        else if (isNaN(parseInt(patientData.fev1Predicted)) || parseInt(patientData.fev1Predicted) < 0 || parseInt(patientData.fev1Predicted) > 100) {
          errors.fev1Predicted = 'VEMS % prédit doit être entre 0 et 100';
        }
        if (!patientData.mmrcScore) errors.mmrcScore = 'Score mMRC requis';
        if (calculateCATScore === null) errors.catScore = 'Score CAT incomplet. Veuillez répondre à toutes les questions dans la fenêtre dédiée.';
        break;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, patientData, calculateCATScore]);

  const handleToggleSection = useCallback((sectionKey: string) => {
    startTransition(() => {
      setExpandedSections(prev => ({
        ...prev,
        [sectionKey]: !prev[sectionKey]
      }));
    });
  }, [startTransition]); // setExpandedSections is stable


  const DiagnosticStep = React.memo((props: StepComponentCommonProps) => {
    const { patientData, handleFieldChange, validationErrors, expandedSections, onToggleSection } = props;
    return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Indicateurs cliniques pour considérer un diagnostic de BPCO</h3>
        <p className="text-blue-700 text-base">Cochez les éléments présents chez votre patient :</p>
      </div>

      <ExternalExpandableSection 
        title="Symptômes" 
        icon={Activity as IconComponent} 
        sectionKey="symptoms"
        isExpanded={!!expandedSections["symptoms"]}
        onToggle={() => onToggleSection("symptoms")}
      >
        <div className="space-y-3" role="group" aria-labelledby="symptoms-heading">
          <h4 id="symptoms-heading" className="sr-only">Liste des symptômes à évaluer</h4>
          {[
            { field: 'dyspnea', label: 'Dyspnée progressive dans le temps, aggravée à l\'effort, persistante' },
            { field: 'chronicCough', label: 'Toux chronique (peut être intermittente et non productive)' },
            { field: 'sputumProduction', label: 'Production d\'expectorations chroniques' },
            { field: 'recurrentInfections', label: 'Infections respiratoires basses récurrentes' }
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={patientData[field as keyof Pick<PatientData, 'dyspnea'|'chronicCough'|'sputumProduction'|'recurrentInfections'>]}
                onChange={(e) => handleFieldChange(field as keyof PatientData, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </ExternalExpandableSection>

      <ExternalExpandableSection 
        title="Facteurs de risque" 
        icon={AlertTriangle as IconComponent} 
        sectionKey="riskFactors"
        isExpanded={!!expandedSections["riskFactors"]}
        onToggle={() => onToggleSection("riskFactors")}
      >
        <div className="space-y-3" role="group" aria-labelledby="risk-factors-heading">
          <h4 id="risk-factors-heading" className="sr-only">Facteurs de risque à évaluer</h4>
          {[
            { field: 'smokingHistory', label: 'Tabagisme (y compris préparations locales populaires)' },
            { field: 'occupationalExposure', label: 'Poussières, vapeurs, fumées, gaz et autres substances chimiques professionnelles' },
            { field: 'biomassExposure', label: 'Fumée de cuisine et de chauffage domestique' },
            { field: 'airPollution', label: 'Pollution de l\'air extérieur' }
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={patientData[field as keyof Pick<PatientData, 'smokingHistory'|'occupationalExposure'|'biomassExposure'|'airPollution'>]}
                onChange={(e) => handleFieldChange(field as keyof PatientData, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </ExternalExpandableSection>

      <ExternalExpandableSection 
        title="Spirométrie *" 
        icon={Calculator as IconComponent} 
        sectionKey="spirometry"
        isExpanded={!!expandedSections["spirometry"]}
        onToggle={() => onToggleSection("spirometry")}
      >
        <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200" role="alert">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-yellow-600" aria-hidden="true" />
            <span className="font-semibold text-yellow-800">Important</span>
          </div>
          <p className="text-yellow-700 text-base">
            Une spirométrie post-bronchodilatateur montrant un rapport VEMS/CVF {"<"} 0,7 est nécessaire pour confirmer le diagnostic de BPCO.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pre-fev1-fvc" className="block text-base font-medium text-gray-700 mb-1">
              VEMS/CVF pré-bronchodilatateur
            </label>
            <input
              id="pre-fev1-fvc"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={patientData.preBronchodilatorFEV1FVC}
              onChange={(e) => handleFieldChange('preBronchodilatorFEV1FVC', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0.65"
            />
          </div>
          
          <div>
            <label htmlFor="post-fev1-fvc" className="block text-base font-medium text-gray-700 mb-1">
              VEMS/CVF post-bronchodilatateur *
            </label>
            <input
              id="post-fev1-fvc"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={patientData.postBronchodilatorFEV1FVC}
              onChange={(e) => handleFieldChange('postBronchodilatorFEV1FVC', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.postBronchodilatorFEV1FVC ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.65"
              required
              aria-describedby={validationErrors.postBronchodilatorFEV1FVC ? 'post-fev1-error' : undefined}
            />
            {validationErrors.postBronchodilatorFEV1FVC && (
              <p id="post-fev1-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.postBronchodilatorFEV1FVC}
              </p>
            )}
          </div>
        </div>
        
        {patientData.postBronchodilatorFEV1FVC && !isNaN(parseFloat(patientData.postBronchodilatorFEV1FVC)) && (
          <div className={`mt-4 p-3 rounded-lg transition-colors text-base ${
            parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`} role="status" aria-live="polite">
            <span className="font-semibold">
              {parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 
                ? '✓ Compatible avec un diagnostic de BPCO' 
                : '✗ Non compatible avec un diagnostic de BPCO'}
            </span>
             {' '} (Valeur: {patientData.postBronchodilatorFEV1FVC})
          </div>
        )}
      </ExternalExpandableSection>
    </div>
  )});
  DiagnosticStep.displayName = 'DiagnosticStep';

  const calculateGOLDGroup = useMemo((): 'A' | 'B' | 'E' | 'Inconnu' => {
    if (!deferredPatientData.mmrcScore || calculateCATScore === null || !deferredPatientData.exacerbationsLastYear || !deferredPatientData.hospitalizationsLastYear) return 'Inconnu';
    const mmrc = parseInt(deferredPatientData.mmrcScore);
    const cat = calculateCATScore;
    const exacerbations = parseInt(deferredPatientData.exacerbationsLastYear);
    const hospitalizations = parseInt(deferredPatientData.hospitalizationsLastYear);
    if (isNaN(mmrc) || cat === null || isNaN(exacerbations) || isNaN(hospitalizations)) return 'Inconnu';
    if (exacerbations >= 2 || hospitalizations >= 1) return 'E';
    const highSymptoms = mmrc >= 2 || cat >= 10;
    return highSymptoms ? 'B' : 'A';
  }, [deferredPatientData, calculateCATScore]);

  interface AssessmentStepProps extends StepComponentCommonProps {
    isCATModalOpen: boolean;
    onOpenCATModal: () => void;
    onCloseCATModal: () => void;
    onSubmitCATScores: (scores: CATScoreFields) => void;
    currentCATDataForModal: CATScoreFields;
    catQuestions: CATQuestion[];
    calculateCATScore: number | null; 
  }


  const AssessmentStep = React.memo((props: AssessmentStepProps) => {
    const { 
        patientData, handleFieldChange, validationErrors, expandedSections, onToggleSection,
        isCATModalOpen, onOpenCATModal, onCloseCATModal, onSubmitCATScores,
        currentCATDataForModal, catQuestions, calculateCATScore
    } = props;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Évaluation initiale selon GOLD 2025</h3>
          <p className="text-green-700 text-base">Évaluez la sévérité de l'obstruction, l'impact des symptômes et le risque d'exacerbations.</p>
        </div>

        <ExternalExpandableSection 
            title="Classification de la sévérité (GOLD 1-4) *" 
            icon={Calculator as IconComponent} 
            sectionKey="goldGrade"
            isExpanded={!!expandedSections["goldGrade"]}
            onToggle={() => onToggleSection("goldGrade")}
        >
          <div className="mb-4">
            <label htmlFor="fev1-predicted" className="block text-base font-medium text-gray-700 mb-1">
              VEMS (% de la valeur prédite) post-bronchodilatateur *
            </label>
            <input
              id="fev1-predicted"
              type="number"
              min="0"
              max="100"
              value={patientData.fev1Predicted}
              onChange={(e) => handleFieldChange('fev1Predicted', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                validationErrors.fev1Predicted ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="65"
              required
              aria-describedby={validationErrors.fev1Predicted ? 'fev1-error' : undefined}
            />
            {validationErrors.fev1Predicted && (
              <p id="fev1-error" className="text-red-600 text-sm mt-1" role="alert">{validationErrors.fev1Predicted}</p>
            )}
          </div>
          
          {patientData.fev1Predicted && !isNaN(parseInt(patientData.fev1Predicted)) && (
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200" role="status" aria-live="polite">
                <span className="font-semibold text-gray-700">Classification GOLD : </span>
                <span className={`px-2 py-1 rounded text-sm font-medium text-white transition-colors ${
                  parseInt(patientData.fev1Predicted) >= 80 ? 'bg-green-500' :
                  parseInt(patientData.fev1Predicted) >= 50 ? 'bg-yellow-500' :
                  parseInt(patientData.fev1Predicted) >= 30 ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  {parseInt(patientData.fev1Predicted) >= 80 ? 'GOLD 1 (Léger)' :
                   parseInt(patientData.fev1Predicted) >= 50 ? 'GOLD 2 (Modéré)' :
                   parseInt(patientData.fev1Predicted) >= 30 ? 'GOLD 3 (Sévère)' : 'GOLD 4 (Très sévère)'}
                </span>
              </div>
            </div>
          )}
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Évaluation des symptômes *" 
            icon={Activity as IconComponent} 
            sectionKey="symptomsEval"
            isExpanded={!!expandedSections["symptomsEval"]}
            onToggle={() => onToggleSection("symptomsEval")}
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Échelle mMRC (dyspnée) *</h4>
              <fieldset className="space-y-2">
                <legend className="sr-only">Sélectionnez le niveau de dyspnée</legend>
                {[
                  { value: '0', label: 'Dyspnée uniquement lors d\'efforts intenses' },
                  { value: '1', label: 'Dyspnée en montant une côte ou en marchant rapidement' },
                  { value: '2', label: 'Marche plus lentement que les personnes du même âge ou doit s\'arrêter pour respirer en marchant à son propre rythme sur terrain plat' },
                  { value: '3', label: 'S\'arrête pour reprendre son souffle après avoir marché environ 100m ou après quelques minutes sur terrain plat' },
                  { value: '4', label: 'Trop dyspnéique pour sortir de chez soi ou dyspnée en s\'habillant/se déshabillant' }
                ].map(option => (
                  <label key={option.value} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="mmrc"
                      value={option.value}
                      checked={patientData.mmrcScore === option.value}
                      onChange={(e) => handleFieldChange('mmrcScore', e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-base text-gray-700">{option.value}: {option.label}</span>
                  </label>
                ))}
              </fieldset>
              {validationErrors.mmrcScore && (
                <p className="text-red-600 text-sm mt-2" role="alert">{validationErrors.mmrcScore}</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Test d'évaluation de la BPCO (CAT) *</h4>
               <button
                onClick={onOpenCATModal}
                className="mb-3 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Saisir / Modifier Score CAT
              </button>
              
              <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200" role="status" aria-live="polite">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Score CAT total:</span>
                  <span className={`text-2xl font-bold transition-colors ${
                    calculateCATScore !== null 
                      ? calculateCATScore < 10 ? 'text-green-600' : 'text-orange-600'
                      : 'text-gray-400'
                  }`}>
                    {calculateCATScore !== null ? `${calculateCATScore}/40` : 'Non saisi ou incomplet'}
                  </span>
                </div>
                {calculateCATScore !== null && (
                  <div className="mt-2 text-base">
                    <span className={`px-2 py-1 rounded text-sm font-medium transition-colors ${ /* badge size kept as text-sm */
                      calculateCATScore < 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {calculateCATScore < 10 ? 'Impact faible' : 'Impact élevé'}
                    </span>
                  </div>
                )}
                 {validationErrors.catScore && (
                  <p className="text-red-600 text-sm mt-2" role="alert">{validationErrors.catScore}</p>
                )}
              </div>
            </div>
          </div>
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Historique d'exacerbations et Éosinophiles" 
            icon={AlertTriangle as IconComponent} 
            sectionKey="exacerbationsHistory"
            isExpanded={!!expandedSections["exacerbationsHistory"]}
            onToggle={() => onToggleSection("exacerbationsHistory")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exacerbations" className="block text-base font-medium text-gray-700 mb-1">
                Exacerbations modérées/sévères (dernière année)
              </label>
              <input
                id="exacerbations"
                type="number"
                min="0"
                value={patientData.exacerbationsLastYear}
                onChange={(e) => handleFieldChange('exacerbationsLastYear', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
            
            <div>
              <label htmlFor="hospitalizations" className="block text-base font-medium text-gray-700 mb-1">
                Hospitalisations pour BPCO (dernière année)
              </label>
              <input
                id="hospitalizations"
                type="number"
                min="0"
                value={patientData.hospitalizationsLastYear}
                onChange={(e) => handleFieldChange('hospitalizationsLastYear', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="eosinophils" className="block text-base font-medium text-gray-700 mb-1">
              Éosinophiles sanguins (cellules/μL)
            </label>
            <input
              id="eosinophils"
              type="number"
              min="0"
              value={patientData.bloodEosinophils}
              onChange={(e) => handleFieldChange('bloodEosinophils', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="150"
            />
          </div>
        </ExternalExpandableSection>
         {isCATModalOpen && ( 
            <CATScoreModal
                isOpen={isCATModalOpen}
                onClose={onCloseCATModal}
                onSubmit={onSubmitCATScores}
                initialData={currentCATDataForModal}
                catQuestions={catQuestions}
            />
        )}
      </div>
    );
  });
  AssessmentStep.displayName = 'AssessmentStep';

  interface TreatmentStepProps extends StepComponentCommonProps {
    goldGroup: 'A' | 'B' | 'E' | 'Inconnu';
    calculateCATScore: number | null;
  }

  const TreatmentStep = React.memo((props: TreatmentStepProps) => {
    const { patientData, expandedSections, onToggleSection, goldGroup, calculateCATScore } = props;
    const bloodEos = patientData.bloodEosinophils ? parseInt(patientData.bloodEosinophils) : null;

    const getInitialTreatment = useMemo((): TreatmentRecommendation => {
      switch(goldGroup) {
        case 'A':
          return {
            primary: 'Un bronchodilatateur',
            options: ['SABA (Salbutamol, Terbutaline) au besoin', 'SAMA (Ipratropium) au besoin', 'LABA (Formotérol, Salmétérol, Indacatérol, Olodatérol)', 'LAMA (Tiotropium, Glycopyrronium, Uméclidinium, Aclidinium)'],
            note: 'Le choix dépend de la disponibilité et de la réponse individuelle. Un traitement de fond par LABA ou LAMA peut être envisagé si les symptômes sont plus persistants malgré l\'utilisation de BDCA.'
          };
        case 'B':
          return {
            primary: 'Association LABA + LAMA',
            options: ['Formotérol/Glycopyrronium', 'Indacatérol/Glycopyrronium', 'Vilanterol/Umeclidinium', 'Formotérol/Aclidinium', 'Tiotropium/Olodatérol'],
            note: 'Une combinaison en un seul inhalateur est généralement préférée pour améliorer l\'observance. Si éosinophiles sanguins ≥ 300 cellules/µL, l\'ajout d\'un CSI peut être discuté en cas de symptômes persistants importants malgré LABA+LAMA, bien que ce groupe soit défini par un faible risque d\'exacerbations.'
          };
        case 'E':
          if (bloodEos !== null && bloodEos >= 300) {
            return {
              primary: 'Association LABA + LAMA + CSI',
              options: ['Formotérol/Glycopyrronium/Budésonide', 'Vilanterol/Umeclidinium/Fluticasone furoate', 'Salmétérol/Fluticasone propionate + Tiotropium'],
              note: `Éosinophiles (${bloodEos} cellules/µL) ≥ 300: Fort support pour l'inclusion des CSI d'emblée avec LABA et LAMA pour réduire les exacerbations.`
            };
          } else if (bloodEos !== null && bloodEos >= 100) {
             return {
              primary: 'Association LABA + LAMA. Discuter l\'ajout de CSI.',
              options: ['LABA + LAMA initialement. Si exacerbations persistent : ajouter CSI (LABA+LAMA+CSI).', 'Exemples de LABA+LAMA : Formotérol/Glycopyrronium, Indacatérol/Glycopyrronium, etc.'],
              note: `Éosinophiles (${bloodEos} cellules/µL) entre 100 et 299: L'ajout de CSI à LABA+LAMA est à considérer, surtout si exacerbations fréquentes/sévères malgré LABA+LAMA. L'initiation par LABA+LAMA reste une option valide.`
            };
          } else { // Eos < 100 or unknown
             return {
              primary: 'Association LABA + LAMA.',
              options: ['Formotérol/Glycopyrronium', 'Indacatérol/Glycopyrronium', 'Vilanterol/Umeclidinium'],
              note: `Éosinophiles ${bloodEos !== null ? `(${bloodEos} cellules/µL) < 100` : 'non renseignés ou < 100'}: Moindre support pour les CSI. Envisager Roflumilast (si VEMS < 50% et bronchite chronique) ou Azithromycine (chez anciens fumeurs) si exacerbations persistent sous LABA+LAMA.`
            };
          }
        default:
          return { primary: 'Évaluation incomplète pour déterminer le groupe GOLD.', options: [], note: 'Veuillez compléter les étapes précédentes.' };
      }
    }, [goldGroup, bloodEos]);

    const postBronchoFEV1FVC = parseFloat(patientData.postBronchodilatorFEV1FVC);

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-xl font-semibold text-purple-800 mb-2">Recommandations thérapeutiques GOLD 2025</h3>
          <p className="text-purple-700 text-base">
            Basé sur l'évaluation : Groupe <span className="font-bold">{goldGroup}</span> | mMRC: {patientData.mmrcScore || 'N/A'} | CAT: {calculateCATScore !== null ? calculateCATScore : 'N/A'} | Éosinophiles: {patientData.bloodEosinophils || 'N/R'}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Points d'attention / Contrôles de cohérence :</span>
          </h4>
          <div className="space-y-1 text-base text-yellow-700">
            {!isNaN(postBronchoFEV1FVC) && postBronchoFEV1FVC >= 0.7 && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /><span>VEMS/CVF post-BD ≥ 0.7 : le diagnostic de BPCO n'est pas confirmé par spirométrie. Reconsidérer le diagnostic.</span></p>
            )}
            {goldGroup === 'E' && (parseInt(patientData.exacerbationsLastYear || '0') < 2 && parseInt(patientData.hospitalizationsLastYear || '0') < 1) && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" /><span>Groupe E mais historique d'exacerbations semble bas. Vérifier les critères saisis pour le groupe E (≥2 exacerbations modérées ou ≥1 hospitalisation).</span></p>
            )}
            {calculateCATScore !== null && patientData.mmrcScore && parseInt(patientData.mmrcScore) >= 2 && calculateCATScore < 10 && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /><span>Discordance possible entre mMRC (≥2, symptomatique) et CAT ({'<'}10, peu symptomatique). Privilégier l'évaluation clinique globale.</span></p>
            )}
            {calculateCATScore !== null && patientData.mmrcScore && parseInt(patientData.mmrcScore) < 2 && calculateCATScore >= 10 && (
              <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /><span>Discordance possible entre mMRC ({'<'}2, peu symptomatique) et CAT (≥10, symptomatique). Privilégier l'évaluation clinique globale.</span></p>
            )}
             {goldGroup === 'E' && bloodEos === null && (
                <p className="flex items-start space-x-2"><Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" /><span>Le taux d'éosinophiles sanguins est important pour guider l'utilisation des CSI chez les patients du groupe E. Si disponible, veuillez le renseigner.</span></p>
            )}
          </div>
        </div>

        <ExternalExpandableSection 
            title="Traitement pharmacologique initial" 
            icon={Pill as IconComponent} 
            sectionKey="pharmacological"
            isExpanded={!!expandedSections["pharmacological"]}
            onToggle={() => onToggleSection("pharmacological")}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Groupe {goldGroup} - Traitement recommandé :</h4>
              <p className="text-blue-700 font-medium">{getInitialTreatment.primary}</p>
              {getInitialTreatment.note && (
                <p className="text-blue-600 text-sm mt-2 italic">{getInitialTreatment.note}</p>
              )}
            </div>
            
            {getInitialTreatment.options.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Options thérapeutiques (exemples non exhaustifs) :</h5>
                <ul className="space-y-1">
                  {getInitialTreatment.options.map((option, index) => (
                    <li key={index} className="flex items-start space-x-2 p-1">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-base text-gray-700">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Traitement non-pharmacologique" 
            icon={Activity as IconComponent} 
            sectionKey="nonpharmacological"
            isExpanded={!!expandedSections["nonpharmacological"]}
            onToggle={() => onToggleSection("nonpharmacological")}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h5 className="font-semibold text-gray-700 mb-2">Essentiel pour tous les patients</h5>
                <ul className="space-y-1 text-base text-gray-600 list-disc list-inside">
                  <li>Arrêt du tabac (conseil et aide au sevrage).</li>
                  <li>Activité physique régulière adaptée.</li>
                  <li>Vaccinations (grippe annuelle, pneumocoque, COVID-19, coqueluche).</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h5 className="font-semibold text-gray-700 mb-2">Selon évaluation et sévérité</h5>
                <ul className="space-y-1 text-base text-gray-600 list-disc list-inside">
                  <li>Réhabilitation respiratoire (pour patients symptomatiques et/ou post-exacerbation, groupes B et E notamment).</li>
                  <li>Éducation thérapeutique et autogestion (plan d'action personnalisé).</li>
                  <li>Support nutritionnel si nécessaire.</li>
                  <li>Oxygénothérapie de longue durée (si hypoxémie sévère au repos PaO2 ≤ 55 mmHg ou SaO2 ≤ 88%).</li>
                  <li>Ventilation non invasive (pour certains patients en hypercapnie chronique sévère).</li>
                </ul>
              </div>
            </div>
          </div>
        </ExternalExpandableSection>

        <ExternalExpandableSection 
            title="Traitements Interventionnels et Chirurgie (pour cas sélectionnés)" 
            icon={GitFork as IconComponent} 
            sectionKey="interventionalTreatment"
            isExpanded={!!expandedSections["interventionalTreatment"]}
            onToggle={() => onToggleSection("interventionalTreatment")}
        >
          <div className="space-y-4 text-base text-gray-700">
            <p>Pour certains patients avec BPCO avancée et réfractaire au traitement médical optimal, des options interventionnelles ou chirurgicales peuvent être envisagées après évaluation multidisciplinaire.</p>
            
            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Scissors className="w-4 h-4 text-blue-600" /><span>Réduction Chirurgicale du Volume Pulmonaire (RCVP / LVRS)</span></h5>
                <p className="text-sm ml-6 mb-1"><strong>Principe:</strong> Résection des zones d'emphysème les plus sévères.</p>
                <p className="text-sm ml-6"><strong>Indications principales:</strong> Emphysème prédominant aux lobes supérieurs, faible capacité d'exercice post-réhabilitation, VEMS {"<"} 45% prédit, DLCO {"<"} 45% prédit, arrêt du tabac.</p>
            </div>

            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Layers className="w-4 h-4 text-blue-600" /><span>Réduction Endoscopique du Volume Pulmonaire (REVP / ELVR)</span></h5>
                <p className="text-sm ml-6 mb-1">Alternative moins invasive. Techniques incluent :</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 ml-10">
                    <li><strong>Valves Endobronchiques (VEB):</strong> Atélectasie lobaire. Critère clé : absence de ventilation collatérale.</li>
                    <li><strong>Spirales (Coils):</strong> Compression du parenchyme emphysémateux.</li>
                    <li><strong>Thermoablation par Vapeur:</strong> Fibrose et réduction de volume.</li>
                </ul>
            </div>
            
            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Slice className="w-4 h-4 text-blue-600" /><span>Bullectomie</span></h5>
                <p className="text-sm ml-6 mb-1"><strong>Principe:</strong> Résection chirurgicale de bulles géantes.</p>
                <p className="text-sm ml-6"><strong>Indications:</strong> Bulles compressives causant dyspnée, ou complications (pneumothorax, infection).</p>
            </div>

            <div>
                <h5 className="font-semibold text-gray-600 mb-1 flex items-center space-x-2"><Recycle className="w-4 h-4 text-blue-600" /><span>Transplantation Pulmonaire</span></h5>
                <p className="text-sm ml-6 mb-1">Pour BPCO très sévère, en phase terminale, réfractaire.</p>
                <p className="text-sm ml-6"><strong>Critères de référencement (exemples):</strong> Index BODE ≥ 7-10, VEMS {"<"} 20% prédit, hospitalisations pour hypercapnie, hypertension pulmonaire sévère.</p>
            </div>
             <p className="mt-3 text-sm text-gray-500 italic">Ces traitements nécessitent une évaluation spécialisée et ne sont pas adaptés à tous les patients.</p>
          </div>
        </ExternalExpandableSection>
      </div>
    );
  });
  TreatmentStep.displayName = 'TreatmentStep';
  
  interface PrintReportProps {
    patientData: PatientData;
    calculateCATScore: number | null;
    goldGroup: 'A' | 'B' | 'E' | 'Inconnu';
    onClose: () => void;
  }

  const PrintReport = React.memo(({ patientData, calculateCATScore, goldGroup, onClose }: PrintReportProps) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    useEffect(() => {
      const handleBeforePrint = () => setIsPrinting(true);
      const handleAfterPrint = () => setIsPrinting(false);
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
      console.log("PrintReport: Event listeners for print attached."); // Debug log
      return () => {
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('afterprint', handleAfterPrint);
        console.log("PrintReport: Event listeners for print removed."); // Debug log
      };
    }, []); // Empty dependency array: runs once on mount, cleans up on unmount

    const triggerPrint = useCallback(() => {
      console.log("PrintReport: triggerPrint called. isPrinting:", isPrinting); // Debug log
      if (isPrinting) return;
      window.print();
    }, [isPrinting]); // Dependency on isPrinting is correct here for the guard

    const getGoldGradeText = useMemo(() => {
      if (!patientData.fev1Predicted || isNaN(parseInt(patientData.fev1Predicted))) return 'Non renseigné';
      const fev1 = parseInt(patientData.fev1Predicted);
      if (fev1 >= 80) return 'GOLD 1 (Léger)';
      if (fev1 >= 50) return 'GOLD 2 (Modéré)';
      if (fev1 >= 30) return 'GOLD 3 (Sévère)';
      return 'GOLD 4 (Très sévère)';
    }, [patientData.fev1Predicted]);

    const bloodEos = patientData.bloodEosinophils ? parseInt(patientData.bloodEosinophils) : null;
    const treatmentRec = useMemo(() => { // Re-calculate for print, matching TreatmentStep
        switch(goldGroup) {
            case 'A': return 'Un bronchodilatateur (BDCA au besoin, ou LABA ou LAMA en traitement de fond si symptômes plus persistants).';
            case 'B': return `Association LABA + LAMA. ${bloodEos !== null && bloodEos >= 300 ? "Considérer CSI si symptômes importants malgré LABA+LAMA." : ""}`;
            case 'E':
              if (bloodEos !== null && bloodEos >= 300) return `Association LABA + LAMA + CSI (Éosinophiles ${bloodEos} cellules/µL: Fort support).`;
              if (bloodEos !== null && bloodEos >= 100) return `Association LABA + LAMA. Discuter CSI (Éosinophiles ${bloodEos} cellules/µL: Support conditionnel).`;
              return `Association LABA + LAMA. (Éosinophiles ${bloodEos !== null ? bloodEos + ' cellules/µL: ' : ''}Moindre support pour CSI). Envisager autres options si exacerbations persistantes.`;
            default: return 'Veuillez compléter l\'évaluation pour des recommandations spécifiques.';
        }
    }, [goldGroup, bloodEos]);


    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div 
          id="printable-report-modal-content-box" 
          className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl"
        >
          <div className="overflow-y-auto p-6 sm:p-8" id="printable-report">
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
              <h1 id="report-title" className="text-3xl font-bold text-gray-900">RAPPORT D'ÉVALUATION BPCO</h1>
              <p className="text-gray-600">Selon les recommandations GOLD 2025</p>
              <p className="text-base text-gray-500">Date de l'évaluation: {currentDate}</p>
            </div>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Informations Patient</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base">
                <div><strong>Nom :</strong> {patientData.patientName || 'Non renseigné'}</div>
                <div><strong>Âge :</strong> {patientData.patientAge || 'Non renseigné'} {patientData.patientAge ? 'ans' : ''}</div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Diagnostic Spirométrique</h2>
              <div className="space-y-1 text-base">
                <div><strong>VEMS/CVF post-bronchodilatateur :</strong> {patientData.postBronchodilatorFEV1FVC || 'Non renseigné'}</div>
                 {patientData.postBronchodilatorFEV1FVC && !isNaN(parseFloat(patientData.postBronchodilatorFEV1FVC)) && (
                    <div className={`font-semibold ${parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 ? 'text-green-700' : 'text-red-700'}`}>
                    {parseFloat(patientData.postBronchodilatorFEV1FVC) < 0.7 ? '✓ Obstruction bronchique présente (compatible BPCO)' : '✗ Pas d\'obstruction bronchique selon ce critère'}
                    </div>
                 )}
                {patientData.fev1Predicted && (
                  <div><strong>Sévérité de l'obstruction (VEMS % prédit) :</strong> {getGoldGradeText} ({patientData.fev1Predicted}%)</div>
                )}
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Évaluation des Symptômes et Risque</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base">
                <div><strong>Score mMRC :</strong> {patientData.mmrcScore || 'Non renseigné'}</div>
                <div><strong>Score CAT :</strong> {calculateCATScore !== null ? `${calculateCATScore}/40` : 'Non calculé'}</div>
                <div><strong>Impact symptomatique (CAT) :</strong> 
                  {calculateCATScore !== null ? (calculateCATScore < 10 ? ' Faible' : ' Moyen à élevé') : ' Non évalué'}
                </div>
                <div><strong>Groupe GOLD (ABE) :</strong> <span className="font-bold">{goldGroup}</span></div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Historique d'Exacerbations & Éosinophiles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base">
                <div><strong>Exacerbations modérées/sévères (12 derniers mois) :</strong> {patientData.exacerbationsLastYear || '0'}</div>
                <div><strong>Hospitalisations pour BPCO (12 derniers mois) :</strong> {patientData.hospitalizationsLastYear || '0'}</div>
                <div><strong>Éosinophiles sanguins :</strong> {patientData.bloodEosinophils || 'Non renseigné'} {patientData.bloodEosinophils ? 'cellules/μL': ''}</div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Recommandations Thérapeutiques Initiales (Pharmacologiques)</h2>
              <div className="space-y-3 text-base">
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <strong>Groupe {goldGroup} - Approche recommandée :</strong>
                  <div className="mt-1">{treatmentRec}</div>
                </div>
              </div>
            </section>
             <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Recommandations Thérapeutiques (Non-Pharmacologiques)</h2>
              <div className="text-base">
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Arrêt du tabac (si applicable) : conseil systématique et aide au sevrage.</li>
                    <li>Activité physique : encourager une activité physique régulière et adaptée.</li>
                    <li>Vaccinations : grippe (annuelle), pneumocoque, COVID-19, coqueluche.</li>
                    <li>Réhabilitation respiratoire : à considérer pour les patients des groupes B et E, et ceux avec symptômes persistants ou limitation fonctionnelle.</li>
                    <li>Éducation thérapeutique et plan d'action personnalisé pour la gestion des exacerbations.</li>
                  </ul>
              </div>
            </section>

            <div className="text-sm text-gray-500 mt-8 border-t border-gray-200 pt-4">
              <p>Ce rapport est un outil d'aide à la décision généré sur la base des informations fournies et des recommandations GOLD 2025. Il ne remplace pas le jugement clinique.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 print-hide">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={triggerPrint}
              disabled={isPrinting}
              className={`px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2 transition-colors ${isPrinting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    );
  });
  PrintReport.displayName = 'PrintReport';

  const ExacerbationStep = React.memo((props: StepComponentCommonProps) => {
    const { expandedSections, onToggleSection } = props;
    const [isExacerbationActive, setIsExacerbationActive] = useState<boolean | null>(null);

    return (
    <div className="space-y-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Gestion des Exacerbations de BPCO</h3>
                <p className="text-red-700 text-base">
                    Une exacerbation de BPCO est un événement aigu caractérisé par une aggravation des symptômes respiratoires du patient au-delà des variations quotidiennes habituelles, conduisant à un changement de traitement.
                </p>
            </div>
            {isExacerbationActive !== null && (
                 <button 
                    onClick={() => setIsExacerbationActive(null)} 
                    className="mt-3 sm:mt-0 sm:ml-4 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Changer la réponse concernant l'exacerbation actuelle"
                >
                    Changer Réponse
                </button>
            )}
        </div>

        {isExacerbationActive === null && (
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center space-x-2">
                    <HelpCircle className="w-6 h-6 text-blue-600" />
                    <span>Le patient est-il actuellement en exacerbation de sa BPCO ?</span>
                </h4>
                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={() => setIsExacerbationActive(true)}
                        className="px-6 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Oui
                    </button>
                    <button 
                        onClick={() => setIsExacerbationActive(false)}
                        className="px-6 py-2 text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Non
                    </button>
                </div>
            </div>
        )}

        {isExacerbationActive === false && (
            <ExternalExpandableSection 
                title="Informations Générales sur les Exacerbations" 
                icon={Info as IconComponent} 
                sectionKey="exacGeneralInfo" 
                isExpanded={true} // Default to expanded when 'Non' is chosen
                onToggle={() => onToggleSection("exacGeneralInfo")} // Still allow toggle if preferred
            >
                <div className="space-y-3 text-base text-gray-700">
                    <p><strong>Définition :</strong> Une exacerbation de BPCO est un événement aigu où les symptômes respiratoires (dyspnée, toux, expectorations) s'aggravent au-delà des variations habituelles et nécessitent un changement de traitement.</p>
                    <p><strong>Importance de la Prévention :</strong> Les exacerbations fréquentes impactent négativement la qualité de vie, accélèrent le déclin de la fonction pulmonaire et augmentent le risque d'hospitalisation et de mortalité.</p>
                    <p><strong>Reconnaissance Précoce :</strong> Il est crucial que les patients reconnaissent les premiers signes d'une exacerbation :</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Augmentation de l'essoufflement.</li>
                        <li>Augmentation de la toux.</li>
                        <li>Changement de la quantité ou de la couleur (plus jaune/vert) des expectorations.</li>
                        <li>Fatigue inhabituelle, fièvre (moins fréquent).</li>
                    </ul>
                    <p><strong>Plan d'Action Personnalisé :</strong> Chaque patient devrait avoir un plan d'action écrit, convenu avec son médecin, qui détaille :</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Comment reconnaître une exacerbation.</li>
                        <li>Quand et comment ajuster les médicaments (ex: augmenter les bronchodilatateurs à courte durée d'action).</li>
                        <li>Quand commencer un traitement par corticostéroïdes oraux et/ou antibiotiques (si prescrits à l'avance).</li>
                        <li>Quand contacter un professionnel de santé ou se rendre aux urgences.</li>
                    </ul>
                    <p><strong>Rappel :</strong> Même si le patient n'est pas en exacerbation actuellement, le maintien du traitement de fond, l'arrêt du tabac, la vaccination et l'activité physique sont essentiels pour prévenir les futures exacerbations.</p>
                </div>
            </ExternalExpandableSection>
        )}

        {isExacerbationActive === true && (
            <>
                <ExternalExpandableSection title="Objectifs du Traitement" icon={CheckCircle as IconComponent} sectionKey="exacGoals" isExpanded={!!expandedSections["exacGoals"]} onToggle={() => onToggleSection("exacGoals")}>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
                    <li>Minimiser l'impact négatif de l'exacerbation actuelle.</li>
                    <li>Prévenir les événements futurs (nouvelles exacerbations).</li>
                    </ul>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Évaluation Initiale et Classification de la Sévérité" icon={Stethoscope as IconComponent} sectionKey="exacAssessment" isExpanded={!!expandedSections["exacAssessment"]} onToggle={() => onToggleSection("exacAssessment")}>
                    <p className="text-base text-gray-700 mb-2"><strong>Évaluer:</strong> Anamnèse, symptômes (dyspnée, toux, expectorations), signes vitaux, gazométrie artérielle si suspicion d'insuffisance respiratoire.</p>
                    <p className="text-base text-gray-700 mb-2"><strong>Confondeurs à écarter:</strong> Pneumonie, insuffisance cardiaque, embolie pulmonaire, pneumothorax.</p>
                    <p className="text-base text-gray-700 mb-2"><strong>Classification de la sévérité:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
                        <li><strong>Légère:</strong> Traitée uniquement avec des bronchodilatateurs à courte durée d'action (BDCA) augmentés.</li>
                        <li><strong>Modérée:</strong> Traitée avec des BDCA plus des antibiotiques et/ou des corticostéroïdes oraux.</li>
                        <li><strong>Sévère:</strong> Nécessite une hospitalisation ou une consultation aux urgences. Peut être associée à une insuffisance respiratoire aiguë.</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-500">Référence: GOLD 2025 Report, Figure 4.3 (adapté).</p>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Indications d'Hospitalisation" icon={Hospital as IconComponent} sectionKey="exacHospital" isExpanded={!!expandedSections["exacHospital"]} onToggle={() => onToggleSection("exacHospital")}>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
                    <li>Symptômes sévères: aggravation soudaine de la dyspnée au repos, fréquence respiratoire élevée, SpO2 basse, confusion, somnolence.</li>
                    <li>Insuffisance respiratoire aiguë (PaO2 {"<"} 60 mmHg et/ou SaO2 {"<"} 90% avec ou sans PaCO2 > 50 mmHg).</li>
                    <li>Apparition de nouveaux signes physiques (ex: cyanose, œdèmes périphériques).</li>
                    <li>Échec de la réponse au traitement initial de l'exacerbation.</li>
                    <li>Comorbidités sévères (ex: insuffisance cardiaque, arythmies cardiaques nouvelles).</li>
                    <li>Support à domicile insuffisant.</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-500">Référence: GOLD 2025 Report, Figure 4.4.</p>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Traitement Pharmacologique de l'Exacerbation" icon={Pill as IconComponent} sectionKey="exacPharma" isExpanded={!!expandedSections["exacPharma"]} onToggle={() => onToggleSection("exacPharma")}>
                    <div className="space-y-4">
                    <div>
                        <h5 className="font-semibold text-gray-700 text-base mb-1">Bronchodilatateurs:</h5>
                        <p className="text-base text-gray-600">Augmenter la dose et/ou la fréquence des BDCA (SABA ± SAMA). Utiliser des nébuliseurs ou des chambres d'inhalation si besoin. Envisager des bronchodilatateurs à longue durée d'action dès que le patient est stable.</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 text-base mb-1">Corticostéroïdes Systémiques:</h5>
                        <p className="text-base text-gray-600">Prednisone 40 mg/jour per os pendant 5 jours est recommandé pour les exacerbations modérées à sévères. Réduit le temps de récupération et améliore la fonction pulmonaire (VEMS) et l'hypoxémie.</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 text-base mb-1">Antibiotiques:</h5>
                        <p className="text-base text-gray-600 mb-1">Indiqués si les 3 symptômes cardinaux d'Anthonisen sont présents (augmentation de la dyspnée, augmentation du volume des expectorations, ET augmentation de la purulence des expectorations) OU si 2 des 3 symptômes si l'un est l'augmentation de la purulence des expectorations.</p>
                        <p className="text-base text-gray-600">Aussi indiqués pour les patients nécessitant une ventilation mécanique (invasive ou non invasive).</p>
                        <p className="text-base text-gray-600">Durée recommandée: 5-7 jours.</p>
                    </div>
                    </div>
                </ExternalExpandableSection>
                
                <ExternalExpandableSection title="Oxygénothérapie et Support Ventilatoire" icon={AirVent as IconComponent} sectionKey="exacOxygen" isExpanded={!!expandedSections["exacOxygen"]} onToggle={() => onToggleSection("exacOxygen")}>
                    <div className="space-y-4">
                        <div>
                            <h5 className="font-semibold text-gray-700 text-base mb-1">Oxygénothérapie:</h5>
                            <p className="text-base text-gray-600">Administrer pour atteindre une SpO2 cible de 88-92%. Surveiller le risque d'hypercapnie induite par l'oxygène.</p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-700 text-base mb-1">Ventilation Non Invasive (VNI):</h5>
                            <p className="text-base text-gray-600">Envisager si au moins un des critères suivants est présent: acidose respiratoire (pH ≤ 7.35 et/ou PaCO2 ≥ 45 mmHg), dyspnée sévère avec signes de fatigue des muscles respiratoires, hypoxémie persistante malgré oxygénothérapie.</p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-700 text-base mb-1">Ventilation Mécanique Invasive (VMI):</h5>
                            <p className="text-base text-gray-600">Indications: échec ou contre-indication à la VNI, arrêt respiratoire ou cardiaque, altération de la conscience, aspiration massive, instabilité hémodynamique sévère.</p>
                        </div>
                    </div>
                </ExternalExpandableSection>

                <ExternalExpandableSection title="Sortie d'Hôpital et Suivi" icon={Home as IconComponent} sectionKey="exacDischarge" isExpanded={!!expandedSections["exacDischarge"]} onToggle={() => onToggleSection("exacDischarge")}>
                    <p className="text-base text-gray-700 mb-2"><strong>Critères de sortie (exemples):</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
                        <li>Stabilité clinique (BDCA requis toutes les 4h ou moins).</li>
                        <li>Capacité à utiliser les inhalateurs et comprendre le traitement.</li>
                        <li>Stabilité des gaz du sang et de l'état mental.</li>
                        <li>Support à domicile adéquat.</li>
                    </ul>
                    <p className="text-base text-gray-700 mt-3 mb-2"><strong>Suivi Post-Exacerbation:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
                        <li>Consultation de suivi dans les 1-4 semaines.</li>
                        <li>Réévaluer les symptômes, la fonction pulmonaire (spirométrie si stable).</li>
                        <li>Vérifier la technique d'inhalation et l'observance.</li>
                        <li>Optimiser le traitement de fond pour prévenir de futures exacerbations.</li>
                        <li>Considérer la réhabilitation respiratoire.</li>
                        <li>Mettre à jour le plan d'action personnalisé.</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-500">Référence: GOLD 2025 Report, Figure 4.10.</p>
                </ExternalExpandableSection>
            </>
        )}
    </div>
  )});
  ExacerbationStep.displayName = 'ExacerbationStep';

  const FollowUpStep = React.memo((props: StepComponentCommonProps) => {
    const { expandedSections, onToggleSection } = props;
    return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-800 mb-2">Suivi et gestion à long terme</h3>
        <p className="text-indigo-700 text-base">
          Une évaluation régulière est cruciale pour ajuster le traitement, surveiller la progression de la maladie et gérer les comorbidités.
        </p>
      </div>

      <ExternalExpandableSection title="Fréquence et Objectifs du Suivi" icon={CalendarClock as IconComponent} sectionKey="followupFreqObj" isExpanded={!!expandedSections["followupFreqObj"]} onToggle={() => onToggleSection("followupFreqObj")}>
        <p className="text-base text-gray-700 mb-2">La fréquence du suivi dépend de la sévérité de la BPCO et de la stabilité du patient :</p>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
            <li><strong>Patient stable:</strong> 1 à 2 fois par an.</li>
            <li><strong>Après une exacerbation:</strong> Dans les 1-4 semaines (suivi précoce) et à nouveau vers 12 semaines (suivi tardif).</li>
            <li><strong>Objectifs principaux:</strong> Surveiller la progression, évaluer l'efficacité du traitement, vérifier l'observance, ajuster le traitement, gérer les comorbidités, prévenir les exacerbations.</li>
        </ul>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Évaluation Clinique Régulière" icon={ClipboardList as IconComponent} sectionKey="followupClinicalEval" isExpanded={!!expandedSections["followupClinicalEval"]} onToggle={() => onToggleSection("followupClinicalEval")}>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
            <li><strong>Symptômes:</strong> Utilisation des scores mMRC et CAT pour quantifier la dyspnée et l'impact sur la qualité de vie.</li>
            <li><strong>Historique des exacerbations:</strong> Nombre, sévérité, causes possibles, traitement reçu.</li>
            <li><strong>Statut tabagique:</strong> Encouragement et aide à l'arrêt systématique.</li>
            <li><strong>Exposition aux facteurs de risque:</strong> Pollution, expositions professionnelles.</li>
            <li><strong>Examen clinique:</strong> Poids, signes d'insuffisance cardiaque droite, etc.</li>
        </ul>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Surveillance Fonctionnelle et Thérapeutique" icon={Baseline as IconComponent} sectionKey="followupFunctional" isExpanded={!!expandedSections["followupFunctional"]} onToggle={() => onToggleSection("followupFunctional")}>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
            <li><strong>Spirométrie:</strong> Au moins une fois par an chez la plupart des patients. Plus fréquemment si déclin rapide ou changement clinique significatif. Mesure du VEMS post-bronchodilatateur.</li>
            <li><strong>Technique d'inhalation:</strong> À vérifier à chaque visite. Une mauvaise technique est une cause fréquente d'inefficacité du traitement.</li>
            <li><strong>Observance thérapeutique:</strong> Discuter ouvertement des difficultés et chercher des solutions.</li>
            <li><strong>Saturation en oxygène (SpO2):</strong> Mesure au repos, et à l'effort si pertinent.</li>
        </ul>
      </ExternalExpandableSection>
      
      <ExternalExpandableSection title="Prise en Charge Non-Pharmacologique Continue" icon={Bike as IconComponent} sectionKey="followupNonPharma" isExpanded={!!expandedSections["followupNonPharma"]} onToggle={() => onToggleSection("followupNonPharma")}>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-700">
            <li><strong>Activité physique:</strong> Encourager et maintenir un niveau d'activité physique adapté.</li>
            <li><strong>Réhabilitation respiratoire:</strong> Répéter si nouvelle détérioration fonctionnelle ou post-exacerbation sévère. Programmes d'entretien.</li>
            <li><strong>Vaccinations:</strong> Vérifier le statut et administrer les vaccins recommandés (grippe, pneumocoque, COVID-19, coqueluche).</li>
            <li><strong>Nutrition:</strong> Dépister la dénutrition ou l'obésité, conseils diététiques.</li>
            <li><strong>Oxygénothérapie de longue durée (OLD):</strong> Réévaluer régulièrement les indications et l'observance.</li>
            <li><strong>Ventilation non invasive (VNI) à domicile:</strong> Pour les patients sélectionnés, surveillance de l'efficacité et de l'observance.</li>
        </ul>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Gestion des Comorbidités" icon={HeartPulse as IconComponent} sectionKey="followupComorbidities" isExpanded={!!expandedSections["followupComorbidities"]} onToggle={() => onToggleSection("followupComorbidities")}>
        <p className="text-base text-gray-700 mb-2">Les comorbidités sont fréquentes et impactent le pronostic. Les plus courantes incluent :</p>
        <ul className="list-disc list-inside space-y-1 text-base text-gray-600 ml-4">
            <li>Maladies cardiovasculaires (cardiopathie ischémique, insuffisance cardiaque, HTA).</li>
            <li>Ostéoporose.</li>
            <li>Anxiété et dépression.</li>
            <li>Diabète.</li>
            <li>Cancer du poumon (dépistage chez les fumeurs/ex-fumeurs éligibles).</li>
            <li>Syndrome d'apnées du sommeil.</li>
        </ul>
        <p className="text-base text-gray-700 mt-2">Nécessite une prise en charge coordonnée avec les autres spécialistes impliqués.</p>
      </ExternalExpandableSection>

      <ExternalExpandableSection title="Plan d'Action Personnalisé" icon={FilePenLine as IconComponent} sectionKey="followupActionPlan" isExpanded={!!expandedSections["followupActionPlan"]} onToggle={() => onToggleSection("followupActionPlan")}>
        <p className="text-base text-gray-700">Réviser et mettre à jour régulièrement le plan d'action pour la gestion des exacerbations. S'assurer que le patient comprend quand et comment l'utiliser.</p>
      </ExternalExpandableSection>
      
      <ExternalExpandableSection title="Soins Palliatifs et Planification Anticipée des Soins" icon={HandHeart as IconComponent} sectionKey="followupPalliative" isExpanded={!!expandedSections["followupPalliative"]} onToggle={() => onToggleSection("followupPalliative")}>
        <p className="text-base text-gray-700">Pour les patients avec BPCO sévère et très symptomatique, aborder la discussion sur les soins palliatifs et la planification anticipée des soins (directives anticipées, personne de confiance) pour améliorer la qualité de vie et respecter les souhaits du patient en fin de vie.</p>
      </ExternalExpandableSection>
    </div>
  )});
  FollowUpStep.displayName = 'FollowUpStep';

  interface AppStepDefinition<P = StepComponentCommonProps> extends Omit<StepDefinitionType, 'component'> {
    component: React.FC<P>;
  }
  
  const [isCATModalOpen, setCATModalOpen] = useState(false);
  const handleOpenCATModal = useCallback(() => setCATModalOpen(true), []);
  const handleCloseCATModal = useCallback(() => setCATModalOpen(false), []);

  const handleSubmitCATScores = useCallback((submittedScores: CATScoreFields) => {
    startTransition(() => {
      setPatientData(prev => ({ ...prev, ...submittedScores }));
      const allFilled = Object.values(submittedScores).every(val => val !== '' && val !== undefined && val !== null);
      if (allFilled) {
          clearValidationError('catScore');
      }
    });
    handleCloseCATModal();
  }, [clearValidationError, handleCloseCATModal, startTransition]); 


  const catQuestions = useMemo((): CATQuestion[] => [
    { field: 'catCough', question: 'Je ne tousse jamais', opposite: 'Je tousse tout le temps', description: 'Fréquence de la toux' },
    { field: 'catPhlegm', question: 'Je n\'ai pas de glaires (mucus) dans la poitrine', opposite: 'Ma poitrine est complètement pleine de glaires (mucus)', description: 'Production d\'expectorations' },
    { field: 'catChestTightness', question: 'Ma poitrine ne me semble pas du tout serrée', opposite: 'Ma poitrine me semble très serrée', description: 'Sensation d\'oppression thoracique' },
    { field: 'catBreathlessness', question: 'Quand je marche en montée ou que je monte un étage, je ne suis pas essoufflé(e)', opposite: 'Quand je marche en montée ou que je monte un étage, je suis très essoufflé(e)', description: 'Dyspnée à l\'effort' },
    { field: 'catActivityLimitation', question: 'Mes activités à la maison ne sont pas du tout limitées', opposite: 'Mes activités à la maison sont très limitées', description: 'Limitation des activités domestiques' },
    { field: 'catConfidenceLeaving', question: 'Je sors de chez moi en toute confiance malgré ma maladie pulmonaire', opposite: 'Je n\'ai pas du tout confiance à sortir de chez moi à cause de ma maladie pulmonaire', description: 'Confiance pour sortir' },
    { field: 'catSleep', question: 'Je dors très bien', opposite: 'Je ne dors pas bien du tout à cause de ma maladie pulmonaire', description: 'Qualité du sommeil' },
    { field: 'catEnergy', question: 'J\'ai beaucoup d\'énergie', opposite: 'Je n\'ai pas d\'énergie du tout', description: 'Niveau d\'énergie' }
  ], []);

  const currentCATDataForModal = useMemo((): CATScoreFields => ({
      catCough: patientData.catCough,
      catPhlegm: patientData.catPhlegm,
      catChestTightness: patientData.catChestTightness,
      catBreathlessness: patientData.catBreathlessness,
      catActivityLimitation: patientData.catActivityLimitation,
      catConfidenceLeaving: patientData.catConfidenceLeaving,
      catSleep: patientData.catSleep,
      catEnergy: patientData.catEnergy,
  }), [
      patientData.catCough, patientData.catPhlegm, patientData.catChestTightness, 
      patientData.catBreathlessness, patientData.catActivityLimitation, 
      patientData.catConfidenceLeaving, patientData.catSleep, patientData.catEnergy
  ]);


  const steps = useMemo((): AppStepDefinition<any>[] => [
    { id: 'patient-info', title: 'Patient', icon: User as IconComponent, component: PatientInfoStep as React.FC<PatientInfoStepProps> },
    { id: 'diagnostic', title: 'Diagnostic', icon: Calculator as IconComponent, component: DiagnosticStep as React.FC<StepComponentCommonProps>},
    { id: 'assessment', title: 'Évaluation', icon: Activity as IconComponent, component: AssessmentStep as React.FC<AssessmentStepProps> },
    { id: 'treatment', title: 'Traitement', icon: Settings as IconComponent, component: TreatmentStep as React.FC<TreatmentStepProps>},
    { id: 'exacerbation', title: 'Exacerbations', icon: AlertOctagon as IconComponent, component: ExacerbationStep as React.FC<StepComponentCommonProps> },
    { id: 'followup', title: 'Suivi', icon: Repeat as IconComponent, component: FollowUpStep as React.FC<StepComponentCommonProps> }
  ], []);

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const CurrentStepConfig = steps[currentStepIndex];
  
  const commonStepProps: StepComponentCommonProps = useMemo(() => ({
    patientData,
    handleFieldChange,
    validationErrors,
    expandedSections,
    onToggleSection: handleToggleSection,
  }), [patientData, handleFieldChange, validationErrors, expandedSections, handleToggleSection]);

  const canProceedToNext = useMemo(() => {
    if (currentStep === 'patient-info') {
      return patientData.patientName.trim() !== '' && patientData.patientAge.trim() !== '' && !validationErrors.patientName && !validationErrors.patientAge;
    }
    if (currentStep === 'diagnostic') {
      return patientData.postBronchodilatorFEV1FVC.trim() !== '' && !validationErrors.postBronchodilatorFEV1FVC;
    }
    if (currentStep === 'assessment') {
      return patientData.fev1Predicted.trim() !== '' && patientData.mmrcScore !== '' && calculateCATScore !== null && !validationErrors.fev1Predicted && !validationErrors.mmrcScore && !validationErrors.catScore;
    }
    return currentStepIndex < steps.length -1;
  }, [currentStep, patientData, calculateCATScore, validationErrors, currentStepIndex, steps.length]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) { 
       if (canProceedToNext) { 
            startTransition(() => {
                const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
                setCurrentStep(steps[nextIndex].id);
                window.scrollTo(0, 0);
            });
       }
    }
  }, [validateCurrentStep, canProceedToNext, steps, currentStepIndex, startTransition]);

  const handlePrevious = useCallback(() => {
    startTransition(() => {
      setCurrentStep(steps[Math.max(0, currentStepIndex - 1)].id);
      window.scrollTo(0, 0);
    });
  }, [steps, currentStepIndex, startTransition]);

  const handleClosePrintReport = useCallback(() => {
    setShowPrintReport(false);
  }, []); 
  
  if (!CurrentStepConfig || !CurrentStepConfig.component) {
    return <div className="p-8 text-center text-red-500">Erreur: Étape non trouvée. Veuillez rafraîchir la page.</div>;
  }
  const CurrentStepComponent = CurrentStepConfig.component;


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Aide à la décision dans la BPCO
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Prise en charge de la BPCO basée sur les recommandations{' '}
            <a 
              href="https://goldcopd.org/2025-gold-report-home/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline hover:no-underline transition-colors duration-200 font-medium"
            >
              GOLD 2025
            </a>
          </p>
        </header>

        <nav className="mb-8" aria-label="Étapes de l'évaluation">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    startTransition(() => {
                      setCurrentStep(step.id);
                      window.scrollTo(0, 0);
                    });
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm sm:text-base rounded-lg font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${ isActive 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
                    } ${isPending && isActive ? 'opacity-75 cursor-wait' : 'opacity-100'}`}
                  disabled={isPending && isActive}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
          {isPending && (
            <div className="text-center mt-3">
              <span className="text-base text-gray-500 italic">Chargement de l'étape...</span>
            </div>
          )}
        </nav>

        <main className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8">
           {CurrentStepConfig.id === 'patient-info' && <CurrentStepComponent {...commonStepProps} />}
           {CurrentStepConfig.id === 'diagnostic' && <CurrentStepComponent {...commonStepProps} />}
           {CurrentStepConfig.id === 'assessment' && 
             <CurrentStepComponent 
                {...commonStepProps}
                isCATModalOpen={isCATModalOpen}
                onOpenCATModal={handleOpenCATModal}
                onCloseCATModal={handleCloseCATModal}
                onSubmitCATScores={handleSubmitCATScores}
                currentCATDataForModal={currentCATDataForModal}
                catQuestions={catQuestions}
                calculateCATScore={calculateCATScore} 
             />}
           {CurrentStepConfig.id === 'treatment' && 
            <CurrentStepComponent 
                {...commonStepProps} 
                goldGroup={calculateGOLDGroup}
                calculateCATScore={calculateCATScore}
            />}
           {(CurrentStepConfig.id === 'exacerbation' || CurrentStepConfig.id === 'followup') && <CurrentStepComponent {...commonStepProps} />}
        </main>

        <nav className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-3 sm:space-y-0" aria-label="Navigation entre les étapes">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isPending}
            className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors font-medium text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Précédent
          </button>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {currentStepIndex >= 2 && ( 
              <button
                onClick={() => {
                    if (validateCurrentStep()) { 
                        setShowPrintReport(true);
                    }
                }}
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors font-medium text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Générer Rapport</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1 || !canProceedToNext || isPending}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {currentStepIndex === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </nav>

        {Object.values(patientData).some(value => (typeof value === 'string' && value.trim() !== '') || (typeof value === 'boolean' && value) || (Array.isArray(value) && value.length > 0) ) && (
          <aside className="mt-10 p-4 bg-gray-50 rounded-lg shadow border border-gray-200" role="complementary">
            <h3 className="font-semibold text-gray-700 mb-2 text-base">Résumé Patient Actuel :</h3>
            <div className="text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {patientData.patientName && (<span><strong>Patient:</strong> {patientData.patientName}</span>)}
              {patientData.patientAge && (<span><strong>Âge:</strong> {patientData.patientAge} ans</span>)}
              {patientData.postBronchodilatorFEV1FVC && (<span><strong>VEMS/CVF:</strong> {patientData.postBronchodilatorFEV1FVC}</span>)}
              {patientData.fev1Predicted && (<span><strong>VEMS %préd:</strong> {patientData.fev1Predicted}%</span>)}
              {patientData.mmrcScore !== '' && (<span><strong>mMRC:</strong> {patientData.mmrcScore}</span>)}
              {calculateCATScore !== null && (<span><strong>CAT:</strong> {calculateCATScore}</span>)}
              {(patientData.mmrcScore !== '' || calculateCATScore !== null) && calculateGOLDGroup !== 'Inconnu' && (
                <span className="font-medium text-gray-800"><strong>Groupe:</strong> {calculateGOLDGroup}</span>
              )}
               {patientData.bloodEosinophils && (<span><strong>Éos:</strong> {patientData.bloodEosinophils} c/µL</span>)}
            </div>
          </aside>
        )}

        {showPrintReport && 
            <PrintReport 
                patientData={patientData} 
                calculateCATScore={calculateCATScore} 
                goldGroup={calculateGOLDGroup} 
                onClose={handleClosePrintReport} 
            />}

        <footer className="mt-12 pt-8 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            Application développée par Dr Zouhair Souissi © 2025
          </p>
          <p className="text-sm text-gray-500">
            Outil à usage informatif pour professionnels de santé. Ne remplace pas le jugement clinique
          </p>
        </footer>
      </div>
      {isCATModalOpen && ( 
            <CATScoreModal
                isOpen={isCATModalOpen}
                onClose={handleCloseCATModal}
                onSubmit={handleSubmitCATScores}
                initialData={currentCATDataForModal}
                catQuestions={catQuestions}
            />
        )}
    </div>
  );
};

// No default export here, it's a named export now
// export default COPDDecisionSupport; // This line is removed or commented out
