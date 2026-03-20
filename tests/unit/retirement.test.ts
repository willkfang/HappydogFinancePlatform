import { describe, expect, it } from 'vitest';
import {
	buildDeterministicProjection,
	buildProbabilisticProjection
} from '../../src/lib/domain/finance/retirement';
import type {
	ProbabilisticAssumptions,
	RetirementAssumptions
} from '../../src/lib/domain/finance/finance.types';

const assumptions: RetirementAssumptions = {
	currentAge: 40,
	partnerCurrentAge: 38,
	retirementAge: 60,
	partnerRetirementAge: 60,
	currentRetirementBalance: 450000,
	currentTaxableBalance: 120000,
	currentCashReserves: 40000,
	currentDebtBalance: 75000,
	annualEarnedIncome: 180000,
	annualRentalNetIncome: 12000,
	annualRetirementContribution: 24000,
	employerMatch: 7000,
	inflationRate: 0.025,
	returnRate: 0.065,
	incomeGrowthRate: 0.03,
	retirementSpendingTarget: 90000,
	withdrawalRate: 0.04,
	planningEndAge: 95,
	includeRentalInPlan: true,
	usingStarterAssumptions: false
};

const bounded: ProbabilisticAssumptions = {
	inflationRate: { min: 0.02, base: 0.025, max: 0.04 },
	returnRate: { min: 0.03, base: 0.065, max: 0.085 },
	incomeGrowthRate: { min: 0.01, base: 0.03, max: 0.04 },
	retirementSpendingTarget: { min: 80000, base: 90000, max: 105000 },
	annualRentalNetIncome: { min: 7000, base: 12000, max: 15000 },
	vacancyShock: { min: 0, base: 0.04, max: 0.12 },
	maintenanceShock: { min: 0.01, base: 0.04, max: 0.08 },
	retirementAge: { min: 58, base: 60, max: 63 },
	sequenceWindowYears: 10,
	iterations: 100
};

describe('buildDeterministicProjection', () => {
	it('produces an explainable retirement baseline', () => {
		const projection = buildDeterministicProjection(assumptions);

		expect(projection.projectedAssetsAtRetirement).toBeGreaterThan(0);
		expect(projection.requiredCapitalAtRetirement).toBeGreaterThan(0);
		expect(projection.yearsToRetirement).toBe(20);
	});
});

describe('buildProbabilisticProjection', () => {
	it('stays within bounded assumptions and returns risk bands', () => {
		const projection = buildProbabilisticProjection(assumptions, bounded);

		expect(projection.successRate).toBeGreaterThanOrEqual(0);
		expect(projection.successRate).toBeLessThanOrEqual(1);
		expect(projection.bands).toHaveLength(3);
		expect(projection.sensitivity.length).toBeGreaterThan(0);
	});
});
