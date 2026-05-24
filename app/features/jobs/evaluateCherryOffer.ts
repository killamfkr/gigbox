import { CherryPickerRates } from './cherryPickerRates';

export type ParsedCherryRule = {
    minPayPerMile: number | null;
    minPayPerHour: number | null;
    minTotalPay: number | null;
    maxMiles: number | null;
    maxJobMinutes: number | null;
};

export type CherryVerdict = 'accept' | 'decline' | 'incomplete';

function parseOptionalMin(raw: string): number | null {
    const n = parseFloat(String(raw).replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) {
        return null;
    }
    return n;
}

/** Upper-bound rules: values > 0 enable the cap. */
function parseOptionalMax(raw: string): number | null {
    const n = parseFloat(String(raw).replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) {
        return null;
    }
    return n;
}

export function parseCherryRules(rules: {
    minPayPerMile: string;
    minPayPerHour: string;
    minTotalPay: string;
    maxMiles: string;
    maxJobMinutes: string;
}): ParsedCherryRule {
    return {
        minPayPerMile: parseOptionalMin(rules.minPayPerMile),
        minPayPerHour: parseOptionalMin(rules.minPayPerHour),
        minTotalPay: parseOptionalMin(rules.minTotalPay),
        maxMiles: parseOptionalMax(rules.maxMiles),
        maxJobMinutes: parseOptionalMax(rules.maxJobMinutes),
    };
}

function anyRuleEnabled(parsed: ParsedCherryRule): boolean {
    return Object.values(parsed).some((v) => v !== null);
}

export function evaluateCherryOffer(
    offer: {
        totalPay: number;
        miles: number;
        minutes: number;
        rates: CherryPickerRates;
    },
    parsedRules: ParsedCherryRule
): { verdict: CherryVerdict; reasons: string[] } {
    const reasons: string[] = [];

    if (!anyRuleEnabled(parsedRules)) {
        return { verdict: 'incomplete', reasons: ['Set at least one threshold below to get Accept or Decline.'] };
    }

    if (parsedRules.minPayPerMile != null) {
        if (offer.miles <= 0 || offer.rates.payPerMile === null) {
            reasons.push('Enter miles to evaluate your minimum pay per mile.');
        }
    }
    if (parsedRules.maxMiles != null && offer.miles <= 0) {
        reasons.push('Enter miles to evaluate your maximum distance rule.');
    }
    if (parsedRules.minPayPerHour != null) {
        if (offer.minutes <= 0 || offer.rates.payPerHour === null) {
            reasons.push('Enter minutes to evaluate your minimum pay per hour.');
        }
    }
    if (parsedRules.maxJobMinutes != null && offer.minutes <= 0) {
        reasons.push('Enter minutes to evaluate your maximum time rule.');
    }

    if (reasons.length > 0) {
        return { verdict: 'incomplete', reasons };
    }

    if (parsedRules.minTotalPay != null && offer.totalPay < parsedRules.minTotalPay) {
        reasons.push(
            `Pay + tip $${offer.totalPay.toFixed(2)} is below your minimum $${parsedRules.minTotalPay.toFixed(2)}.`
        );
    }
    if (parsedRules.minPayPerMile != null && offer.rates.payPerMile != null) {
        if (offer.rates.payPerMile < parsedRules.minPayPerMile) {
            reasons.push(
                `Per mile $${offer.rates.payPerMile.toFixed(2)} is below your minimum $${parsedRules.minPayPerMile.toFixed(2)}.`
            );
        }
    }
    if (parsedRules.minPayPerHour != null && offer.rates.payPerHour != null) {
        if (offer.rates.payPerHour < parsedRules.minPayPerHour) {
            reasons.push(
                `Per hour $${offer.rates.payPerHour.toFixed(2)} is below your minimum $${parsedRules.minPayPerHour.toFixed(2)}.`
            );
        }
    }
    if (parsedRules.maxMiles != null && offer.miles > parsedRules.maxMiles) {
        reasons.push(
            `${offer.miles.toFixed(1)} mi exceeds your maximum ${parsedRules.maxMiles.toFixed(1)} mi.`
        );
    }
    if (parsedRules.maxJobMinutes != null && offer.minutes > parsedRules.maxJobMinutes) {
        reasons.push(
            `${Math.round(offer.minutes)} min exceeds your maximum ${Math.round(parsedRules.maxJobMinutes)} min.`
        );
    }

    if (reasons.length > 0) {
        return { verdict: 'decline', reasons };
    }
    return { verdict: 'accept', reasons: ['This offer meets all of your active thresholds.'] };
}
