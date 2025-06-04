
import { LucideProps } from 'lucide-react';
import React from 'react';

export interface PatientData {
  patientName: string;
  patientAge: string;
  gender: string; // Added for completeness, though not used in provided logic
  
  dyspnea: boolean;
  chronicCough: boolean;
  sputumProduction: boolean;
  recurrentInfections: boolean;
  
  smokingHistory: boolean;
  occupationalExposure: boolean;
  biomassExposure: boolean;
  airPollution: boolean;
  
  preBronchodilatorFEV1FVC: string;
  postBronchodilatorFEV1FVC: string;
  fev1Predicted: string;
  
  mmrcScore: string; // '0'-'4'
  
  // CAT Score Fields
  catCough: string; // '0'-'5'
  catPhlegm: string;
  catChestTightness: string;
  catBreathlessness: string;
  catActivityLimitation: string;
  catConfidenceLeaving: string;
  catSleep: string;
  catEnergy: string;
  
  exacerbationsLastYear: string;
  hospitalizationsLastYear: string;
  
  bloodEosinophils: string;
  
  currentTreatment: string[];
  comorbidities: string[];
}

export type CATScoreFields = Pick<PatientData, 
  'catCough' | 
  'catPhlegm' |  
  'catChestTightness' | 
  'catBreathlessness' | 
  'catActivityLimitation' | 
  'catConfidenceLeaving' | 
  'catSleep' | 
  'catEnergy'
>;

export type ValidationErrors = Partial<Record<keyof PatientData | 'catScore' | 'postBronchodilatorFEV1FVC' | 'fev1Predicted' | 'mmrcScore', string>>;


export interface ExpandableSectionProps {
  title: string;
  icon: React.ElementType; // More generic: React.FC<LucideProps> or React.ComponentType any for specific icon libs
  children: React.ReactNode;
  sectionKey: string;
}

export interface CATQuestion {
  field: keyof PatientData; // This can remain keyof PatientData as CAT fields are part of it
  question: string;
  opposite: string;
  description: string;
}

export interface StepDefinition {
  id: string;
  title: string;
  icon: React.ElementType; // React.FC<LucideProps>
  component: React.MemoExoticComponent<React.FC<{}>>;
}

export interface TreatmentRecommendation {
  primary: string;
  options: string[];
  note: string;
}
