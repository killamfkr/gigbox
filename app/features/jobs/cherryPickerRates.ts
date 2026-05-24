/** Rates for comparing gig offers (pay + tip vs. miles and time). */
export type CherryPickerRates = {
    totalPay: number;
    payPerMile: number | null;
    payPerHour: number | null;
};

export function computeCherryPickerRates(
    pay: number,
    tip: number,
    miles: number,
    durationMinutes: number
): CherryPickerRates {
    const totalPay = (Number.isFinite(pay) ? pay : 0) + (Number.isFinite(tip) ? tip : 0);
    const safeMiles = Number.isFinite(miles) && miles > 0 ? miles : 0;
    const safeMinutes = Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 0;
    const hours = safeMinutes / 60;

    return {
        totalPay,
        payPerMile: safeMiles > 0 ? totalPay / safeMiles : null,
        payPerHour: hours > 0 ? totalPay / hours : null,
    };
}

export function formatUsd(n: number | null): string {
    if (n === null || !Number.isFinite(n)) {
        return '—';
    }
    return `$${n.toFixed(2)}`;
}
