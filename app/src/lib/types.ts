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
  additionalCardFeeDetail: string;
  purchaseInterestRate: number;
  purchaseInterestRateDisplay: string;
  purchaseAPR?: string;
  cashAdvanceInterestRate: number;
  cashAdvanceInterestRateDisplay: string;
  balanceTransferAPR?: string;
  rewardsProgram: string;
  welcomeBonus: string;
  welcomeBonusDetailed: string;
  welcomeBonusValue: string;
  welcomeBonusEligibility: string;
  features: string;
  featuresDetailed: string;
  additionalInfo?: string;
  cardEligibility: string;
  creditScore?: string;
  insurance: string;
  productLink: string;
  slug: string;
  description?: string;
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
