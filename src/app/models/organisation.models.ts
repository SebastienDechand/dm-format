export interface ConditionsData {
  header: Header;
  intro: Intro;
  general_conditions: GeneralConditions;
  certification: Certification;
  obligations: Obligations;
  financing: Financing;
}

export interface Header {
  title: string;
  description: string;
  image: Image;
}

export interface Image {
  src: string;
  alt: string;
}

export interface Intro {
  title: string;
  description: string;
}

export interface GeneralConditions {
  title: string;
  description: string;
  points: ConditionPoint[];
}

export interface ConditionPoint {
  icon: string;
  title: string;
  description: string;
}

export interface Certification {
  title: string;
  description: string;
  details: string[];
  note: string;
}

export interface Obligations {
  title: string;
  description: string;
  points: ObligationPoint[];
  note: string;
}

export interface ObligationPoint {
  icon: string;
  title: string;
  description: string;
}

export interface Financing {
  title: string;
  description: string;
  opco: OpcoInfo;
  subtitle: string;
  steps: FinancingStep[];
}

export interface OpcoInfo {
  title: string;
  description: string;
}

export interface FinancingStep {
  icon: string;
  text: string;
}
