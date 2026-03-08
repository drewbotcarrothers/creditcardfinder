export interface CreditCard {
  id: number;
  creditCardName: string;
  imageFile: string;
  issuer: string;
  category: string;
  annualFee: number;
  annualFeeDisplay: string;
  annualFeeDetail: string;
  additionalCardFee: number;
  additionalCardFeeDisplay: string;
  additionalCardDetail: string;
  purchaseInterestRate: number;
  purchaseInterestRateDisplay: string;
  cashAdvanceInterestRate: number;
  cashAdvanceInterestRateDisplay: string;
  rewardsProgram: string;
  welcomeBonus: string;
  welcomeBonusDetailed: string;
  welcomeBonusValue: string;
  welcomeBonusEligibility: string;
  features: string;
  featuresDetailed: string;
  cardEligibility: string;
  insurance: string;
  productLink: string;
  slug: string;
}

export interface FilterState {
  categories: string[];
  issuers: string[];
  feeRanges: string[];
  rewardsPrograms: string[];
}

export type SortOption = 
  | 'featured'
  | 'fee-low-high'
  | 'fee-high-low'
  | 'bonus-high-low'
  | 'name-az';
