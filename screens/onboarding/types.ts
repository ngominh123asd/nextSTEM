export interface OnboardingCert {
  title: string;
  score: string;
  date: string;
  organisation: string;
  fileName?: string;
  fileUrl?: string;
}

export interface OnboardingProject {
  title: string;
  description: string;
  category: string;
  status: string;
  progress: number;
}

export interface OnboardingData {
  name: string;
  email: string;
  goals: string[];
  grade: string;
  school: string;
  subjects: string;
  interests: string[];
  certs: OnboardingCert[];
  projects: OnboardingProject[];
}

export interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onClose: () => void;
  initialData?: Partial<OnboardingData>;
}
