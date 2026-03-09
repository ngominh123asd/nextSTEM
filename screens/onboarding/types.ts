export interface OnboardingData {
  name: string;
  email: string;
  goals: string[];
  grade: string;
  school: string;
  subjects: string;
  interests: string[];
}

export interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onClose: () => void;
  initialData?: Partial<OnboardingData>;
}
