export type OptionValue = 'Sim' | 'Não' | 'Talvez';

export interface Question {
  id: number;
  text: string;
  category: 'institucional' | 'fisico' | 'digital' | 'psicologico' | 'inclusao' | 'legal';
  explanation: string;
  legalBase?: string;
  required: boolean;
}

export interface StudentInfo {
  grade: string;
  shift: string;
  studentName?: string;
  age?: string;
  isAnonymous: boolean;
}

export interface FormSubmission {
  id: string;
  timestamp: string;
  studentInfo: StudentInfo;
  answers: Record<number, OptionValue>;
}

export interface FormTheme {
  primaryColor: string;
  bgColor: string;
  accentColor: string;
  name: string;
}

export type ActiveTab = 'perguntas' | 'professor' | 'tabelas' | 'configuracoes';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
  schoolName?: string;
  createdAt?: string;
  updatedAt?: string;
}
