import {
	createStarterProbabilisticAssumptions,
	createStarterRetirementAssumptions
} from './finance.defaults';
import type {
	DeterministicProjection,
	FinanceInsights,
	ProbabilisticAssumptions,
	ProbabilisticProjection,
	RetirementAssumptions,
	RetirementPlannerModel,
	RetirementScenario,
	RetirementYearPoint
} from './finance.types';

function round(value: number) {
	return Number(value.toFixed(2));
}

function portfolioBase(assumptions: RetirementAssumptions) {
	return (
		assumptions.currentRetirementBalance +
		assumptions.currentTaxableBalance +
		assumptions.currentCashReserves
	);
}

function annualContribution(assumptions: RetirementAssumptions) {
	return assumptions.annualRetirementContribution + assumptions.employerMatch;
}

function retirementIncome(assumptions: RetirementAssumptions) {
	return (
		assumptions.annualEarnedIncome +
		(assumptions.includeRentalInPlan ? assumptions.annualRentalNetIncome : 0)
	);
}

export function buildDeterministicProjection(
	assumptions: RetirementAssumptions
): DeterministicProjection {
	const retirementAge = Math.max(assumptions.retirementAge, assumptions.currentAge + 1);
	const yearsToRetirement = retirementAge - assumptions.currentAge;
	let contribution = annualContribution(assumptions);
	let portfolio = portfolioBase(assumptions);
	const yearlyPath: RetirementYearPoint[] = [];

	for (let year = 0; year <= yearsToRetirement; year += 1) {
		const age = assumptions.currentAge + year;
		const inflatedSpend =
			assumptions.retirementSpendingTarget * (1 + assumptions.inflationRate) ** year;
		const requiredCapital = inflatedSpend / assumptions.withdrawalRate;

		yearlyPath.push({
			age,
			portfolio: round(portfolio),
			requiredCapital: round(requiredCapital)
		});

		portfolio = portfolio * (1 + assumptions.returnRate) + contribution;
		contribution = contribution * (1 + assumptions.incomeGrowthRate);
	}

	const finalPoint = yearlyPath[yearlyPath.length - 1];
	const requiredCapitalAtRetirement = finalPoint.requiredCapital;
	const projectedAssetsAtRetirement = finalPoint.portfolio;
	const readinessGap = projectedAssetsAtRetirement - requiredCapitalAtRetirement;
	const contributionSufficiencyRatio =
		annualContribution(assumptions) / Math.max(retirementIncome(assumptions), 1);

	let fiAge: number | null = null;
	for (const point of yearlyPath) {
		if (point.portfolio >= point.requiredCapital) {
			fiAge = point.age;
			break;
		}
	}

	return {
		yearsToRetirement,
		projectedAssetsAtRetirement,
		requiredCapitalAtRetirement,
		readinessGap: round(readinessGap),
		contributionSufficiencyRatio: round(contributionSufficiencyRatio),
		estimatedFiAge: fiAge,
		yearlyPath
	};
}

function createSeededRandom(seed: number) {
	let current = seed;
	return () => {
		current = (current * 1664525 + 1013904223) % 4294967296;
		return current / 4294967296;
	};
}

function sampleRange(range: { min: number; max: number }, random: () => number) {
	return range.min + (range.max - range.min) * random();
}

function runProbabilisticIteration(
	assumptions: RetirementAssumptions,
	ranges: ProbabilisticAssumptions,
	seed: number
) {
	const random = createSeededRandom(seed);
	const variableAssumptions: RetirementAssumptions = {
		...assumptions,
		returnRate: sampleRange(ranges.returnRate, random),
		inflationRate: sampleRange(ranges.inflationRate, random),
		incomeGrowthRate: sampleRange(ranges.incomeGrowthRate, random),
		retirementSpendingTarget: sampleRange(ranges.retirementSpendingTarget, random),
		annualRentalNetIncome:
			sampleRange(ranges.annualRentalNetIncome, random) *
			(1 - sampleRange(ranges.vacancyShock, random) - sampleRange(ranges.maintenanceShock, random)),
		retirementAge: Math.round(sampleRange(ranges.retirementAge, random))
	};

	return buildDeterministicProjection(variableAssumptions);
}

export function buildProbabilisticProjection(
	assumptions: RetirementAssumptions,
	ranges: ProbabilisticAssumptions
): ProbabilisticProjection {
	const results = Array.from({ length: ranges.iterations }, (_, index) =>
		runProbabilisticIteration(assumptions, ranges, index + 1)
	).sort((left, right) => left.projectedAssetsAtRetirement - right.projectedAssetsAtRetirement);

	const successful = results.filter((result) => result.readinessGap >= 0).length;
	const pick = (percentile: number) =>
		results[Math.min(results.length - 1, Math.floor(results.length * percentile))];
	const downside = pick(0.1);
	const median = pick(0.5);
	const upside = pick(0.9);

	const sensitivity = [
		{
			label: 'Investment return range',
			impact: round(ranges.returnRate.max - ranges.returnRate.min)
		},
		{
			label: 'Retirement spending range',
			impact: round(
				(ranges.retirementSpendingTarget.max - ranges.retirementSpendingTarget.min) /
					Math.max(ranges.retirementSpendingTarget.base, 1)
			)
		},
		{
			label: 'Retirement age flexibility',
			impact: round(ranges.retirementAge.max - ranges.retirementAge.min)
		},
		{
			label: 'Inflation uncertainty',
			impact: round(ranges.inflationRate.max - ranges.inflationRate.min)
		}
	].sort((left, right) => right.impact - left.impact);

	const guardrails: string[] = [];
	if (successful / Math.max(results.length, 1) < 0.65) {
		guardrails.push('Plan success is too dependent on optimistic assumptions.');
	}
	if (downside.readinessGap < 0) {
		guardrails.push('Downside path produces a retirement funding shortfall.');
	}
	if (ranges.retirementSpendingTarget.max > assumptions.retirementSpendingTarget * 1.1) {
		guardrails.push('Retirement spending uncertainty is a major driver of the result.');
	}

	return {
		successRate: round(successful / Math.max(results.length, 1)),
		bands: [
			{
				label: 'downside',
				assetsAtRetirement: downside.projectedAssetsAtRetirement,
				readinessGap: downside.readinessGap
			},
			{
				label: 'median',
				assetsAtRetirement: median.projectedAssetsAtRetirement,
				readinessGap: median.readinessGap
			},
			{
				label: 'upside',
				assetsAtRetirement: upside.projectedAssetsAtRetirement,
				readinessGap: upside.readinessGap
			}
		],
		guardrails,
		sensitivity
	};
}

export function createRetirementScenarios(base: RetirementAssumptions): RetirementScenario[] {
	return [
		{
			id: 'save-more',
			label: 'Save more',
			assumptions: {
				...base,
				annualRetirementContribution: base.annualRetirementContribution * 1.2
			}
		},
		{
			id: 'spend-less',
			label: 'Spend less',
			assumptions: {
				...base,
				retirementSpendingTarget: base.retirementSpendingTarget * 0.9
			}
		},
		{
			id: 'retire-later',
			label: 'Retire later',
			assumptions: {
				...base,
				retirementAge: base.retirementAge + 2,
				partnerRetirementAge: base.partnerRetirementAge + 2
			}
		}
	];
}

export function createRetirementPlannerModel(insights: FinanceInsights): RetirementPlannerModel {
	const coreHousehold = insights.cashflowViews.find((view) => view.mode === 'core-household');
	const annualEarnedIncome = coreHousehold?.incomeTotal ?? 0;
	const annualRentalNetIncome = insights.rentalProperties.reduce(
		(sum, property) => sum + property.netCashflow,
		0
	);
	const annualHouseholdSpend = coreHousehold?.expenseTotal ?? 0;
	const assumptions = createStarterRetirementAssumptions({
		annualEarnedIncome,
		annualRentalNetIncome,
		annualHouseholdSpend
	});
	const probabilisticAssumptions = createStarterProbabilisticAssumptions(assumptions);
	const scenarios = createRetirementScenarios(assumptions);

	return {
		assumptions,
		deterministic: buildDeterministicProjection(assumptions),
		scenarios: scenarios.map((scenario) => ({
			label: scenario.label,
			projection: buildDeterministicProjection(scenario.assumptions)
		})),
		probabilisticAssumptions,
		probabilistic: buildProbabilisticProjection(assumptions, probabilisticAssumptions)
	};
}
