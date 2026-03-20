import type {
	Essentiality,
	FinanceLifecycle,
	FinanceScope,
	ProbabilisticAssumptions,
	RetirementAssumptions
} from './finance.types';

export const PROPERTY_NAMES = ['2035 Campbell', '929 Kirts', '3127 Parker', '26057 Hidden Valley'];

export const CATEGORY_SCOPE_MAP: Record<string, FinanceScope> = {
	'2035 Campbell': 'rental',
	'929 Kirts': 'rental',
	'3127 Parker': 'rental',
	'26057 Hidden Valley': 'rental',
	'Rental Income': 'rental',
	Apparel: 'personal',
	Entertainment: 'personal',
	Gifts: 'personal',
	Hobby: 'personal',
	'Personal Care': 'personal',
	Travel: 'personal',
	Violin: 'personal'
};

export const CATEGORY_LIFECYCLE_MAP: Record<string, FinanceLifecycle> = {
	Taxes: 'tax',
	Fees: 'debt-interest',
	Mortgage: 'debt-principal',
	'Home Decor': 'capital',
	Moving: 'capital',
	Utilities: 'operating',
	'Home Maintenance': 'operating',
	Lease: 'operating',
	Insurance: 'operating',
	'Rental Income': 'operating'
};

export const CATEGORY_ESSENTIALITY_MAP: Record<string, Essentiality> = {
	'AAA Membership': 'essential',
	Appliances: 'essential',
	'Car Maintenance': 'essential',
	Dog: 'essential',
	Groceries: 'essential',
	Health: 'essential',
	HOA: 'essential',
	'Home Maintenance': 'essential',
	Insurance: 'essential',
	Lease: 'essential',
	Mortgage: 'essential',
	School: 'essential',
	Taxes: 'essential',
	Utilities: 'essential',
	Kids: 'essential',
	Childcare: 'essential',
	Gasoline: 'essential',
	Restaurants: 'discretionary',
	Entertainment: 'discretionary',
	Hobby: 'discretionary',
	Travel: 'discretionary',
	Apparel: 'discretionary',
	Gifts: 'discretionary',
	'Home Decor': 'discretionary',
	Misc: 'discretionary'
};

export function createStarterRetirementAssumptions(seed: {
	annualEarnedIncome: number;
	annualRentalNetIncome: number;
	annualHouseholdSpend: number;
}): RetirementAssumptions {
	const annualEarnedIncome = Math.max(seed.annualEarnedIncome, 120000);
	const annualRentalNetIncome = Math.max(seed.annualRentalNetIncome, 0);
	const annualSpend = Math.max(seed.annualHouseholdSpend, 75000);

	return {
		currentAge: 40,
		partnerCurrentAge: 38,
		retirementAge: 60,
		partnerRetirementAge: 60,
		currentRetirementBalance: annualEarnedIncome * 2.2,
		currentTaxableBalance: annualEarnedIncome * 0.45,
		currentCashReserves: annualSpend * 0.5,
		currentDebtBalance: annualSpend * 0.8,
		annualEarnedIncome,
		annualRentalNetIncome,
		annualRetirementContribution: annualEarnedIncome * 0.15,
		employerMatch: annualEarnedIncome * 0.04,
		inflationRate: 0.025,
		returnRate: 0.065,
		incomeGrowthRate: 0.03,
		retirementSpendingTarget: annualSpend * 0.82,
		withdrawalRate: 0.04,
		planningEndAge: 95,
		includeRentalInPlan: true,
		usingStarterAssumptions: true
	};
}

export function createStarterProbabilisticAssumptions(
	base: RetirementAssumptions
): ProbabilisticAssumptions {
	return {
		inflationRate: {
			min: Math.max(base.inflationRate - 0.01, 0.01),
			base: base.inflationRate,
			max: base.inflationRate + 0.015
		},
		returnRate: {
			min: Math.max(base.returnRate - 0.03, 0.02),
			base: base.returnRate,
			max: base.returnRate + 0.025
		},
		incomeGrowthRate: {
			min: Math.max(base.incomeGrowthRate - 0.015, 0),
			base: base.incomeGrowthRate,
			max: base.incomeGrowthRate + 0.015
		},
		retirementSpendingTarget: {
			min: base.retirementSpendingTarget * 0.9,
			base: base.retirementSpendingTarget,
			max: base.retirementSpendingTarget * 1.15
		},
		annualRentalNetIncome: {
			min: Math.max(base.annualRentalNetIncome * 0.65, 0),
			base: base.annualRentalNetIncome,
			max: base.annualRentalNetIncome * 1.1
		},
		vacancyShock: { min: 0, base: 0.04, max: 0.12 },
		maintenanceShock: { min: 0.01, base: 0.04, max: 0.1 },
		retirementAge: {
			min: Math.max(base.retirementAge - 2, base.currentAge + 5),
			base: base.retirementAge,
			max: base.retirementAge + 3
		},
		sequenceWindowYears: 10,
		iterations: 250
	};
}
