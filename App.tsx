
import React, { useState, useCallback, useMemo, useTransition, useDeferredValue, useEffect } from 'react';
import { PatientData, ValidationErrors, ExpandableSectionProps, CATQuestion, StepDefinition, TreatmentRecommendation, CATScoreFields } from './types';
import { ChevronRight, ChevronDown, AlertTriangle, CheckCircle, Info, Calculator, FileText, Activity, Users, Settings, Printer, User, LucideProps, X } from 'lucide-react';

// Helper to type Lucide icons more strictly if needed, otherwise React.ElementType is fine
type IconComponent = React.FC<LucideProps>;

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
    // Reset local scores if the modal is reopened with different initial data
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
      // onClose will be called by the parent's onSubmit handler
    } else {
      alert("Veuillez répondre à toutes les questions du score CAT pour valider.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="cat-modal-title">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 id="cat-modal-title" className="text-lg font-semibold text-gray-800">Test d'évaluation de la BPCO (CAT)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-sm">
              Pour chaque item, cochez la case qui décrit le mieux votre état actuel (0 = pas du tout, 5 = extrêmement).
            </p>
          </div>
          {catQuestions.map((q, index) => (
            <div key={q.field} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-2">Question {index + 1}: {q.description}</h5>
              <div className="mb-3 text-xs text-gray-500">
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
                    <span className="text-sm font-medium text-gray-700">{score}</span>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Valider et Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
CATScoreModal.displayName = 'CATScoreModal';


const COPDDecisionSupport: React.FC = () => {
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

  const handleInputChange = useCallback(<K extends keyof PatientData,>(field: K, value: PatientData[K]) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  }, []);

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

  const handleFieldChange = useCallback(<K extends keyof PatientData,>(field: K, value: PatientData[K]) => {
    handleInputChange(field, value);
    startTransition(() => {
      clearValidationError(field);
    });
  }, [handleInputChange, clearValidationError]);

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

  const ExpandableSection: React.FC<ExpandableSectionProps> = React.memo(({ title, icon: Icon, children, sectionKey }) => {
    const isExpanded = expandedSections[sectionKey];
    
    const toggleSection = useCallback(() => {
      startTransition(() => {
        setExpandedSections(prev => ({
          ...prev,
          [sectionKey]: !prev[sectionKey]
        }));
      });
    }, [sectionKey]);
    
    return (
      <div className="border border-gray-200 rounded-lg mb-4 shadow-sm">
        <button
          className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleSection}
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
  ExpandableSection.displayName = 'ExpandableSection';


  const PatientInfoStep = React.memo(() => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Informations du patient</h3>
        <p className="text-blue-700 text-sm">Saisissez les informations de base du patient pour commencer l'évaluation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">Nom et prénom du patient *</label>
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
            <p className="text-red-600 text-xs mt-1" role="alert">{validationErrors.patientName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 mb-1">Âge *</label>
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
            <p className="text-red-600 text-xs mt-1" role="alert">{validationErrors.patientAge}</p>
          )}
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <span className="font-semibold text-green-800">Prêt à commencer</span>
        </div>
        <p className="text-green-700 text-sm">
          Une fois les informations saisies, vous pourrez procéder à l'évaluation diagnostique selon les critères GOLD 2025.
        </p>
      </div>
    </div>
  ));
  PatientInfoStep.displayName = 'PatientInfoStep';

  const DiagnosticStep = React.memo(() => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Indicateurs cliniques pour considérer un diagnostic de BPCO</h3>
        <p className="text-blue-700 text-sm">Cochez les éléments présents chez votre patient :</p>
      </div>

      <ExpandableSection title="Symptômes" icon={Activity as IconComponent} sectionKey="symptoms">
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
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </ExpandableSection>

      <ExpandableSection title="Facteurs de risque" icon={AlertTriangle as IconComponent} sectionKey="riskFactors">
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
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </ExpandableSection>

      <ExpandableSection title="Spirométrie *" icon={Calculator as IconComponent} sectionKey="spirometry">
        <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200" role="alert">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-yellow-600" aria-hidden="true" />
            <span className="font-semibold text-yellow-800">Important</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Une spirométrie post-bronchodilatateur montrant un rapport VEMS/CVF {"<"} 0,7 est nécessaire pour confirmer le diagnostic de BPCO.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pre-fev1-fvc" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="post-fev1-fvc" className="block text-sm font-medium text-gray-700 mb-1">
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
              <p id="post-fev1-error" className="text-red-600 text-xs mt-1" role="alert">
                {validationErrors.postBronchodilatorFEV1FVC}
              </p>
            )}
          </div>
        </div>
        
        {patientData.postBronchodilatorFEV1FVC && !isNaN(parseFloat(patientData.postBronchodilatorFEV1FVC)) && (
          <div className={`mt-4 p-3 rounded-lg transition-colors text-sm ${
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
      </ExpandableSection>
    </div>
  ));
  DiagnosticStep.displayName = 'DiagnosticStep';

  const calculateGOLDGroup = useMemo((): 'A' | 'B' | 'E' | 'Inconnu' => {
    if (!deferredPatientData.mmrcScore || calculateCATScore === null || !deferredPatientData.exacerbationsLastYear || !deferredPatientData.hospitalizationsLastYear) return 'Inconnu';

    const mmrc = parseInt(deferredPatientData.mmrcScore);
    const cat = calculateCATScore;
    const exacerbations = parseInt(deferredPatientData.exacerbationsLastYear);
    const hospitalizations = parseInt(deferredPatientData.hospitalizationsLastYear);

    if (isNaN(mmrc) || cat === null || isNaN(exacerbations) || isNaN(hospitalizations)) return 'Inconnu';
    
    if (exacerbations >= 2 || hospitalizations >= 1) {
      return 'E';
    }
    
    const highSymptoms = mmrc >= 2 || cat >= 10;
    return highSymptoms ? 'B' : 'A';
  }, [deferredPatientData, calculateCATScore]);

  const AssessmentStep = React.memo(() => {
    const [isCATModalOpen, setCATModalOpen] = useState(false);

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

    const handleOpenCATModal = () => setCATModalOpen(true);
    const handleCloseCATModal = () => setCATModalOpen(false);

    const handleSubmitCATScores = useCallback((submittedScores: CATScoreFields) => {
      startTransition(() => {
        setPatientData(prev => ({
          ...prev,
          ...submittedScores
        }));
        // Check if all scores are now filled to clear potential validation error
        const allFilled = Object.values(submittedScores).every(val => val !== '' && val !== undefined && val !== null);
        if (allFilled) {
            clearValidationError('catScore');
        }
      });
      handleCloseCATModal();
    }, [clearValidationError]);


    const currentCATData = useMemo((): CATScoreFields => ({
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


    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Évaluation initiale selon GOLD 2025</h3>
          <p className="text-green-700 text-sm">Évaluez la sévérité de l'obstruction, l'impact des symptômes et le risque d'exacerbations.</p>
        </div>

        <ExpandableSection title="Classification de la sévérité (GOLD 1-4) *" icon={Calculator as IconComponent} sectionKey="goldGrade">
          <div className="mb-4">
            <label htmlFor="fev1-predicted" className="block text-sm font-medium text-gray-700 mb-1">
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
              <p id="fev1-error" className="text-red-600 text-xs mt-1" role="alert">{validationErrors.fev1Predicted}</p>
            )}
          </div>
          
          {patientData.fev1Predicted && !isNaN(parseInt(patientData.fev1Predicted)) && (
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200" role="status" aria-live="polite">
                <span className="font-semibold text-gray-700">Classification GOLD : </span>
                <span className={`px-2 py-1 rounded text-xs font-medium text-white transition-colors ${
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
        </ExpandableSection>

        <ExpandableSection title="Évaluation des symptômes *" icon={Activity as IconComponent} sectionKey="symptomsEval">
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
                    <span className="text-sm text-gray-700">{option.value}: {option.label}</span>
                  </label>
                ))}
              </fieldset>
              {validationErrors.mmrcScore && (
                <p className="text-red-600 text-xs mt-2" role="alert">{validationErrors.mmrcScore}</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Test d'évaluation de la BPCO (CAT) *</h4>
               <button
                onClick={handleOpenCATModal}
                className="mb-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Saisir / Modifier Score CAT
              </button>
              
              <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200" role="status" aria-live="polite">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Score CAT total:</span>
                  <span className={`text-xl font-bold transition-colors ${
                    calculateCATScore !== null 
                      ? calculateCATScore < 10 ? 'text-green-600' : 'text-orange-600'
                      : 'text-gray-400'
                  }`}>
                    {calculateCATScore !== null ? `${calculateCATScore}/40` : 'Non saisi ou incomplet'}
                  </span>
                </div>
                {calculateCATScore !== null && (
                  <div className="mt-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      calculateCATScore < 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {calculateCATScore < 10 ? 'Impact faible' : 'Impact élevé'}
                    </span>
                  </div>
                )}
                 {validationErrors.catScore && (
                  <p className="text-red-600 text-xs mt-2" role="alert">{validationErrors.catScore}</p>
                )}
              </div>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Historique d'exacerbations et Éosinophiles" icon={AlertTriangle as IconComponent} sectionKey="exacerbationsHistory">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exacerbations" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="hospitalizations" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="eosinophils" className="block text-sm font-medium text-gray-700 mb-1">
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
        </ExpandableSection>
         {isCATModalOpen && (
            <CATScoreModal
                isOpen={isCATModalOpen}
                onClose={handleCloseCATModal}
                onSubmit={handleSubmitCATScores}
                initialData={currentCATData}
                catQuestions={catQuestions}
            />
        )}
      </div>
    );
  });
  AssessmentStep.displayName = 'AssessmentStep';

  const TreatmentStep = React.memo(() => {
    const goldGroup = calculateGOLDGroup;
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
            note: 'Une combinaison en un seul inhalateur est généralement préférée pour améliorer l\'observance.'
          };
        case 'E':
          return {
            primary: 'Association LABA + LAMA. Considérer LABA + LAMA + CSI si éosinophiles ≥ 300 cellules/µL.',
            options: [
              'Si éosinophiles ≥ 300 cellules/µL: LABA + LAMA + CSI (ex: Formotérol/Glycopyrronium/Budésonide, Vilanterol/Umeclidinium/Fluticasone furoate)',
              'Si éosinophiles < 300 cellules/µL: LABA + LAMA. Si exacerbations persistent, discuter CSI au cas par cas (surtout si éosinophiles 100-300 et historique d\'exacerbations malgré LABA+LAMA).',
              'Autres options si exacerbations persistantes malgré LABA+LAMA+CSI ou contre-indication aux CSI : Roflumilast (si VEMS < 50% et bronchite chronique), Azithromycine (chez anciens fumeurs).'
            ],
            note: 'Une surveillance étroite des exacerbations et des effets secondaires des CSI est nécessaire.'
          };
        default:
          return { primary: 'Évaluation incomplète pour déterminer le groupe GOLD.', options: [], note: 'Veuillez compléter les étapes précédentes.' };
      }
    }, [goldGroup]);

    const postBronchoFEV1FVC = parseFloat(patientData.postBronchodilatorFEV1FVC);
    const bloodEos = patientData.bloodEosinophils ? parseInt(patientData.bloodEosinophils) : null;

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Recommandations thérapeutiques GOLD 2025</h3>
          <p className="text-purple-700 text-sm">
            Basé sur l'évaluation : Groupe <span className="font-bold">{goldGroup}</span> | mMRC: {patientData.mmrcScore || 'N/A'} | CAT: {calculateCATScore !== null ? calculateCATScore : 'N/A'}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Points d'attention / Contrôles de cohérence :</span>
          </h4>
          <div className="space-y-1 text-sm text-yellow-700">
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
          </div>
        </div>

        <ExpandableSection title="Traitement pharmacologique initial" icon={Settings as IconComponent} sectionKey="pharmacological">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Groupe {goldGroup} - Traitement recommandé :</h4>
              <p className="text-blue-700 font-medium">{getInitialTreatment.primary}</p>
              {getInitialTreatment.note && (
                <p className="text-blue-600 text-xs mt-2">{getInitialTreatment.note}</p>
              )}
            </div>
            
            {getInitialTreatment.options.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Options thérapeutiques (exemples) :</h5>
                <ul className="space-y-1">
                  {getInitialTreatment.options.map((option, index) => (
                    <li key={index} className="flex items-start space-x-2 p-1">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-sm text-gray-700">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bloodEos !== null && !isNaN(bloodEos) && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-1">Considération des éosinophiles :</h5>
                <p className="text-yellow-700 text-sm">
                  Éosinophiles : {bloodEos} cellules/μL - 
                  {bloodEos >= 300 
                    ? ' Fort support pour l\'ajout de CSI si exacerbations ou symptômes persistants.'
                    : bloodEos >= 100
                    ? ' Support conditionnel pour CSI, à discuter en fonction du phénotype et du risque d\'exacerbation.'
                    : ' Peu de support pour CSI en initiation, sauf si asthme concomitant.'}
                </p>
              </div>
            )}
          </div>
        </ExpandableSection>

        <ExpandableSection title="Traitement non-pharmacologique" icon={Activity as IconComponent} sectionKey="nonpharmacological">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h5 className="font-semibold text-gray-700 mb-2">Essentiel pour tous les patients</h5>
                <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>Arrêt du tabac (conseil et aide au sevrage).</li>
                  <li>Activité physique régulière adaptée.</li>
                  <li>Vaccinations (grippe annuelle, pneumocoque, COVID-19, coqueluche).</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h5 className="font-semibold text-gray-700 mb-2">Selon évaluation et sévérité</h5>
                <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>Réhabilitation respiratoire (pour patients symptomatiques et/ou post-exacerbation, groupes B et E notamment).</li>
                  <li>Éducation thérapeutique et autogestion (plan d'action personnalisé).</li>
                  <li>Support nutritionnel si nécessaire.</li>
                  <li>Oxygénothérapie de longue durée (si hypoxémie sévère au repos).</li>
                  <li>Ventilation non invasive (pour certains patients en hypercapnie chronique sévère).</li>
                </ul>
              </div>
            </div>
          </div>
        </ExpandableSection>
      </div>
    );
  });
  TreatmentStep.displayName = 'TreatmentStep';
  
  const PrintReport = React.memo(() => {
    const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const getGoldGradeText = useMemo(() => {
      if (!patientData.fev1Predicted || isNaN(parseInt(patientData.fev1Predicted))) return 'Non renseigné';
      const fev1 = parseInt(patientData.fev1Predicted);
      if (fev1 >= 80) return 'GOLD 1 (Léger)';
      if (fev1 >= 50) return 'GOLD 2 (Modéré)';
      if (fev1 >= 30) return 'GOLD 3 (Sévère)';
      return 'GOLD 4 (Très sévère)';
    }, [patientData.fev1Predicted]);

    const goldGroup = calculateGOLDGroup;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl">
          <div className="overflow-y-auto p-6 sm:p-8" id="printable-report">
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
              <h1 id="report-title" className="text-2xl font-bold text-gray-900">RAPPORT D'ÉVALUATION BPCO</h1>
              <p className="text-gray-600">Selon les recommandations GOLD 2025</p>
              <p className="text-sm text-gray-500">Date de l'évaluation: {currentDate}</p>
            </div>

            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Informations Patient</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><strong>Nom :</strong> {patientData.patientName || 'Non renseigné'}</div>
                <div><strong>Âge :</strong> {patientData.patientAge || 'Non renseigné'} {patientData.patientAge ? 'ans' : ''}</div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Diagnostic Spirométrique</h2>
              <div className="space-y-1 text-sm">
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
              <h2 className="text-lg font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Évaluation des Symptômes et Risque</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><strong>Score mMRC :</strong> {patientData.mmrcScore || 'Non renseigné'}</div>
                <div><strong>Score CAT :</strong> {calculateCATScore !== null ? `${calculateCATScore}/40` : 'Non calculé'}</div>
                <div><strong>Impact symptomatique (CAT) :</strong> 
                  {calculateCATScore !== null ? (calculateCATScore < 10 ? ' Faible' : ' Moyen à élevé') : ' Non évalué'}
                </div>
                <div><strong>Groupe GOLD (ABE) :</strong> <span className="font-bold">{goldGroup}</span></div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Historique d'Exacerbations & Éosinophiles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><strong>Exacerbations modérées/sévères (12 derniers mois) :</strong> {patientData.exacerbationsLastYear || '0'}</div>
                <div><strong>Hospitalisations pour BPCO (12 derniers mois) :</strong> {patientData.hospitalizationsLastYear || '0'}</div>
                <div><strong>Éosinophiles sanguins :</strong> {patientData.bloodEosinophils || 'Non renseigné'} {patientData.bloodEosinophils ? 'cellules/μL': ''}</div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Recommandations Thérapeutiques Initiales (Pharmacologiques)</h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <strong>Groupe {goldGroup} - Approche recommandée :</strong>
                  <div className="mt-1">
                    {goldGroup === 'A' && 'Un bronchodilatateur (BDCA au besoin, ou LABA ou LAMA en traitement de fond si symptômes plus persistants).'}
                    {goldGroup === 'B' && 'Association LABA + LAMA.'}
                    {goldGroup === 'E' && `Association LABA + LAMA. ${patientData.bloodEosinophils && parseInt(patientData.bloodEosinophils) >= 300 ? 'Ajouter CSI (LABA+LAMA+CSI).' : 'Considérer CSI si éosinophiles ≥ 100 et exacerbations fréquentes/sévères.' }`}
                    {goldGroup === 'Inconnu' && 'Veuillez compléter l\'évaluation pour des recommandations spécifiques.'}
                  </div>
                </div>
              </div>
            </section>
             <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-blue-800 border-b border-blue-200 pb-1">Recommandations Thérapeutiques (Non-Pharmacologiques)</h2>
              <div className="text-sm">
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Arrêt du tabac (si applicable) : conseil systématique et aide au sevrage.</li>
                    <li>Activité physique : encourager une activité physique régulière et adaptée.</li>
                    <li>Vaccinations : grippe (annuelle), pneumocoque, COVID-19, coqueluche.</li>
                    <li>Réhabilitation respiratoire : à considérer pour les patients des groupes B et E, et ceux avec symptômes persistants ou limitation fonctionnelle.</li>
                    <li>Éducation thérapeutique et plan d'action personnalisé pour la gestion des exacerbations.</li>
                  </ul>
              </div>
            </section>

            <div className="text-xs text-gray-500 mt-8 border-t border-gray-200 pt-4">
              <p>Ce rapport est un outil d'aide à la décision généré sur la base des informations fournies et des recommandations GOLD 2025. Il ne remplace pas le jugement clinique.</p>
              <p>Il doit être interprété et utilisé par un professionnel de santé qualifié dans le contexte clinique global du patient.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 print-hide">
            <button
              onClick={() => setShowPrintReport(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2 transition-colors"
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

  const ExacerbationStep = React.memo(() => (
    <div className="space-y-6">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Gestion des exacerbations BPCO</h3>
        <p className="text-red-700 text-sm">
          Un événement aigu caractérisé par une aggravation des symptômes respiratoires du patient au-delà des variations quotidiennes habituelles, conduisant à un changement de traitement.
        </p>
      </div>
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold text-gray-700 mb-3">Principes de prise en charge :</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Augmentation des bronchodilatateurs à courte durée d'action (SABA ± SAMA).</li>
            <li>Corticostéroïdes systémiques (ex: Prednisone 40mg/jour pour 5 jours).</li>
            <li>Antibiothérapie si signes d'infection bactérienne (augmentation du volume et/ou de la purulence des expectorations, et/ou augmentation de la dyspnée).</li>
            <li>Évaluer la nécessité d'une hospitalisation (sévérité des symptômes, comorbidités, support social).</li>
            <li>Prévention des futures exacerbations (optimisation du traitement de fond, réhabilitation, plan d'action).</li>
        </ul>
        <p className="mt-4 text-xs text-gray-500">Ce module est en cours de développement pour une aide plus détaillée.</p>
      </div>
    </div>
  ));
  ExacerbationStep.displayName = 'ExacerbationStep';

  const FollowUpStep = React.memo(() => (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-800 mb-2">Suivi et gestion à long terme</h3>
        <p className="text-indigo-700 text-sm">
          Une évaluation régulière est cruciale pour ajuster le traitement, surveiller la progression de la maladie et gérer les comorbidités.
        </p>
      </div>
       <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold text-gray-700 mb-3">Éléments clés du suivi :</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Réévaluation des symptômes (mMRC, CAT) et de l'historique d'exacerbations.</li>
            <li>Vérification de la technique d'inhalation et de l'observance thérapeutique.</li>
            <li>Spirométrie (au moins annuelle, plus si changement clinique).</li>
            <li>Dépistage et prise en charge des comorbidités (cardiovasculaires, ostéoporose, anxiété/dépression, etc.).</li>
            <li>Promotion de l'activité physique et du sevrage tabagique continu.</li>
            <li>Mise à jour du plan d'action personnalisé.</li>
        </ul>
        <p className="mt-4 text-xs text-gray-500">Ce module est en cours de développement pour un support de suivi interactif.</p>
      </div>
    </div>
  ));
  FollowUpStep.displayName = 'FollowUpStep';

  const steps = useMemo((): StepDefinition[] => [
    { id: 'patient-info', title: 'Patient', icon: User as IconComponent, component: PatientInfoStep },
    { id: 'diagnostic', title: 'Diagnostic', icon: Calculator as IconComponent, component: DiagnosticStep },
    { id: 'assessment', title: 'Évaluation', icon: Activity as IconComponent, component: AssessmentStep },
    { id: 'treatment', title: 'Traitement', icon: Settings as IconComponent, component: TreatmentStep },
    { id: 'exacerbation', title: 'Exacerbations', icon: AlertTriangle as IconComponent, component: ExacerbationStep },
    { id: 'followup', title: 'Suivi', icon: FileText as IconComponent, component: FollowUpStep }
  ], []); // Removed component dependencies as they are memoized and stable

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const CurrentStepComponent = steps[currentStepIndex]?.component;

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
  }, [validateCurrentStep, canProceedToNext, steps, currentStepIndex]);

  const handlePrevious = useCallback(() => {
    startTransition(() => {
      setCurrentStep(steps[Math.max(0, currentStepIndex - 1)].id);
      window.scrollTo(0, 0);
    });
  }, [steps, currentStepIndex]);
  
  if (!CurrentStepComponent) {
    return <div className="p-8 text-center text-red-500">Erreur: Étape non trouvée. Veuillez rafraîchir la page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Outil d'Aide à la Décision BPCO
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Basé sur les recommandations{' '}
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
                  className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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
              <span className="text-sm text-gray-500 italic">Chargement de l'étape...</span>
            </div>
          )}
        </nav>

        <main className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8">
          <CurrentStepComponent />
        </main>

        <nav className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-3 sm:space-y-0" aria-label="Navigation entre les étapes">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isPending}
            className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Générer Rapport</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1 || !canProceedToNext || isPending}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {currentStepIndex === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </nav>

        {Object.values(patientData).some(value => (typeof value === 'string' && value.trim() !== '') || (typeof value === 'boolean' && value) || (Array.isArray(value) && value.length > 0) ) && (
          <aside className="mt-10 p-4 bg-gray-50 rounded-lg shadow border border-gray-200" role="complementary">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Résumé Patient Actuel :</h3>
            <div className="text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {patientData.patientName && (<span><strong>Patient:</strong> {patientData.patientName}</span>)}
              {patientData.patientAge && (<span><strong>Âge:</strong> {patientData.patientAge} ans</span>)}
              {patientData.postBronchodilatorFEV1FVC && (<span><strong>VEMS/CVF:</strong> {patientData.postBronchodilatorFEV1FVC}</span>)}
              {patientData.fev1Predicted && (<span><strong>VEMS %préd:</strong> {patientData.fev1Predicted}%</span>)}
              {patientData.mmrcScore !== '' && (<span><strong>mMRC:</strong> {patientData.mmrcScore}</span>)}
              {calculateCATScore !== null && (<span><strong>CAT:</strong> {calculateCATScore}</span>)}
              {(patientData.mmrcScore !== '' || calculateCATScore !== null) && calculateGOLDGroup !== 'Inconnu' && (
                <span className="font-medium text-gray-800"><strong>Groupe:</strong> {calculateGOLDGroup}</span>
              )}
            </div>
          </aside>
        )}

        {showPrintReport && <PrintReport />}

        <footer className="mt-12 pt-8 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-500">
            Application développée par Dr Zouhair Souissi © 2025
          </p>
          <p className="text-xs text-gray-500">
            Outil à usage informatif pour professionnels de santé. Ne remplace pas le jugement clinique
          </p>
        </footer>
      </div>
    </div>
  );
};

export default COPDDecisionSupport;
