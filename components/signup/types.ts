export type StepStatus = 'pending' | 'completed' | 'error';

export type StepKey =
  | 'basicInfo'
  | 'education'
  | 'workExperience'
  | 'skills'
  | 'projects'
  | 'achievements'
  | 'certification'
  | 'preference'
  | 'otherDetails'
  | 'reviewAgree';

export type Step = {
  id: number;
  label: string;
  key: StepKey;
  status: StepStatus;
  errorText?: string;
  isActive?: boolean;
};

export type UserData = {
  basicInfo: { fullName: string; email: string; phone: string; location: string };
  education: { school: string; degree: string; graduation: string };
  workExperience: {
    experienceType: 'experienced' | 'fresher';
    company: string;
    role: string;
    from: string;
    to: string;
    description: string;
  };
  skills: { skills: string };
  projects: { projects: string };
  achievements: { achievements: string };
  certification: { certification: string };
  preference: { preference: string };
  otherDetails: { otherDetails: string };
  reviewAgree: { agree: boolean; notes: string };
};
