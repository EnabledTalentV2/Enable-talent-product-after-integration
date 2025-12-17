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
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    citizenshipStatus: string;
    gender: string;
    ethnicity: string;
    socialProfile: string;
    linkedinUrl: string;
    currentStatus: string;
    profilePhoto?: string;
  };
  education: {
    courseName: string;
    major: string;
    institution: string;
    graduationDate: string;
  };
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
