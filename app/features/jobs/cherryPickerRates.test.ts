import { computeCherryPickerRates, formatUsd } from './cherryPickerRates';

describe('computeCherryPickerRates', () => {
    it('computes per-mile and per-hour from pay, tip, miles, and minutes', () => {
        const r = computeCherryPickerRates(10, 2, 5, 30);
        expect(r.totalPay).toBe(12);
        expect(r.payPerMile).toBeCloseTo(2.4);
        expect(r.payPerHour).toBeCloseTo(24);
    });

    it('returns null rates when miles or duration are missing', () => {
        expect(computeCherryPickerRates(10, 0, 0, 60).payPerMile).toBeNull();
        expect(computeCherryPickerRates(10, 0, 10, 0).payPerHour).toBeNull();
    });
});

describe('formatUsd', () => {
    it('formats finite numbers', () => {
        expect(formatUsd(1.2)).toBe('$1.20');
    });

    it('returns em dash for null', () => {
        expect(formatUsd(null)).toBe('—');
    });
});
