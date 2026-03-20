import type { TransactionRecord } from '$domain/transactions/transaction.types';

export type FinanceScope = 'household' | 'rental' | 'personal';
export type FinanceLifecycle =
	| 'operating'
	| 'transfer'
	| 'debt-principal'
	| 'debt-interest'
	| 'tax'
	| 'reimbursement'
	| 'capital';
export type Essentiality = 'essential' | 'discretionary';
export type CashflowViewMode = 'all' | 'core-household' | 'lifestyle';

export type ClassifiedTransaction = TransactionRecord & {
	scope: FinanceScope;
	lifecycle: FinanceLifecycle;
	essentiality: Essentiality;
	propertyName: string | null;
	isReviewItem: boolean;
	isUncategorized: boolean;
	isExcludedFromHouseholdBudget: boolean;
	isAnomalous: boolean;
};

export type MonthlyCashflowPoint = {
	month: string;
	income: number;
	expense: number;
	net: number;
};

export type FinancialHealthSnapshot = {
	currentMonthNetCashflow: number;
	trailing3MonthNetCashflow: number;
	trailing12MonthNetCashflow: number;
	savingsRate: number;
	fixedCostRatio: number;
	essentialSpend: number;
	discretionarySpend: number;
	cashRunwayMonths: number;
	debtLoadRatio: number;
	reviewRatio: number;
	rentalAdjustedNetCashflow: number;
	dataTrust: {
		reviewCount: number;
		uncategorizedCount: number;
		excludedCount: number;
		transferCount: number;
		anomalyCount: number;
	};
};

export type BudgetVariance = {
	categoryName: string;
	scope: FinanceScope;
	essentiality: Essentiality;
	actual: number;
	target: number;
	trailingAverage: number;
	variance: number;
	annualized: boolean;
	alert: 'on-track' | 'watch' | 'over';
};

export type CashflowView = {
	mode: CashflowViewMode;
	label: string;
	monthly: MonthlyCashflowPoint[];
	incomeTotal: number;
	expenseTotal: number;
	netTotal: number;
	changeDrivers: Array<{ label: string; amount: number }>;
};

export type RentalPropertySummary = {
	propertyName: string;
	income: number;
	operatingExpense: number;
	capitalExpense: number;
	netCashflow: number;
	maintenanceReserveTarget: number;
};

export type FinanceInsights = {
	classifiedTransactions: ClassifiedTransaction[];
	health: FinancialHealthSnapshot;
	budgetVariances: BudgetVariance[];
	cashflowViews: CashflowView[];
	rentalProperties: RentalPropertySummary[];
	focusBreakdowns: Array<{ name: string; amount: number; count: number }>;
};

export type RetirementAssumptions = {
	currentAge: number;
	partnerCurrentAge: number;
	retirementAge: number;
	partnerRetirementAge: number;
	currentRetirementBalance: number;
	currentTaxableBalance: number;
	currentCashReserves: number;
	currentDebtBalance: number;
	annualEarnedIncome: number;
	annualRentalNetIncome: number;
	annualRetirementContribution: number;
	employerMatch: number;
	inflationRate: number;
	returnRate: number;
	incomeGrowthRate: number;
	retirementSpendingTarget: number;
	withdrawalRate: number;
	planningEndAge: number;
	includeRentalInPlan: boolean;
	usingStarterAssumptions: boolean;
};

export type RetirementScenario = {
	id: string;
	label: string;
	assumptions: RetirementAssumptions;
};

export type RetirementYearPoint = {
	age: number;
	portfolio: number;
	requiredCapital: number;
};

export type DeterministicProjection = {
	yearsToRetirement: number;
	projectedAssetsAtRetirement: number;
	requiredCapitalAtRetirement: number;
	readinessGap: number;
	contributionSufficiencyRatio: number;
	estimatedFiAge: number | null;
	yearlyPath: RetirementYearPoint[];
};

export type BoundedRange = {
	min: number;
	base: number;
	max: number;
};

export type ProbabilisticAssumptions = {
	inflationRate: BoundedRange;
	returnRate: BoundedRange;
	incomeGrowthRate: BoundedRange;
	retirementSpendingTarget: BoundedRange;
	annualRentalNetIncome: BoundedRange;
	vacancyShock: BoundedRange;
	maintenanceShock: BoundedRange;
	retirementAge: BoundedRange;
	sequenceWindowYears: number;
	iterations: number;
};

export type ProbabilityBand = {
	label: 'downside' | 'median' | 'upside';
	assetsAtRetirement: number;
	readinessGap: number;
};

export type ProbabilisticProjection = {
	successRate: number;
	bands: ProbabilityBand[];
	guardrails: string[];
	sensitivity: Array<{ label: string; impact: number }>;
};

export type RetirementPlannerModel = {
	assumptions: RetirementAssumptions;
	deterministic: DeterministicProjection;
	scenarios: Array<{ label: string; projection: DeterministicProjection }>;
	probabilisticAssumptions: ProbabilisticAssumptions;
	probabilistic: ProbabilisticProjection;
};
