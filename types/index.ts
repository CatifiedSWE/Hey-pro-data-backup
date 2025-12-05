/** @format */

export type ProjectCardType = {
  id: number | string;
  userId?: string;
  name: string;
  banner: string;
  image: string;
  bio: string;
  location: string;
  skills: string[];
};

export type ProfileDataTypes = {
  id: string;
  avtar: string;
  backgroundAvtar: string;
  persionalDetails: {
    name: string;
    aliasName: string;
    location: string;
    availability: string;
    shortAbout: string;
    links: {
      label: string;
      url: string;
    }[];
  };
  language: string[];
  countryCode: string;
  phoneNumber: string;
  AvailableCountriesForTravel: {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
  }[];
  profileCompletion: number;
  about: string;
  skills: {
    id: number | string;
    department: string;
    role: string;
    experience: {
      value: string;
      title: string;
      description: string;
    };
    rate?: string;
    isPublic?: boolean;
    description: string;
  }[];
  roles: string[];
  positions: string[];
  credits: {
    id: number | string;
    creditTitle: string;
    startDate: Date | string;
    endDate: Date | string;
    description: string;
    imgUrl?: string;
    productionType?: string;
    role?: string;
    projectTitle?: string;
    brandClient?: string;
    localCompany?: string;
    internationalCompany?: string;
    country?: string;
    releaseYear?: string;
    isUnreleased?: boolean;
    headlineStats?: string;
    awardsSummary?: string;
    awards?: {
      title: string;
      detail?: string;
    }[];
  }[];
  recomendPeoples: {
    imgUrl: string;
  }[];
};
