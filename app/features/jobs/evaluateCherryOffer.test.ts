import { parseCherryRules, evaluateCherryOffer } from './evaluateCherryOffer';
import { computeCherryPickerRates } from './cherryPickerRates';

describe('parseCherryRules', () => {
    it('treats empty strings as disabled rules', () => {
        const p = parseCherryRules({
            minPayPerMile: '',
            minPayPerHour: '',
            minTotalPay: '',
            maxMiles: '',
            maxJobMinutes: '',
        });
        expect(p.minPayPerMile).toBeNull();
        expect(p.maxMiles).toBeNull();
    });

    it('parses numeric thresholds', () => {
        const p = parseCherryRules({
            minPayPerMile: '2',
            minPayPerHour: '20',
            minTotalPay: '8',
            maxMiles: '12',
            maxJobMinutes: '45',
        });
        expect(p.minPayPerMile).toBe(2);
        expect(p.maxJobMinutes).toBe(45);
    });
});

describe('evaluateCherryOffer', () => {
    const rates = computeCherryPickerRates(12, 0, 4, 30);

    it('returns incomplete when no rules are enabled', () => {
        const parsed = parseCherryRules({
            minPayPerMile: '',
            minPayPerHour: '',
            minTotalPay: '',
            maxMiles: '',
            maxJobMinutes: '',
        });
        const r = evaluateCherryOffer({ totalPay: 12, miles: 4, minutes: 30, rates }, parsed);
        expect(r.verdict).toBe('incomplete');
    });

    it('accepts when all active rules pass', () => {
        const parsed = parseCherryRules({
            minPayPerMile: '2',
            minPayPerHour: '20',
            minTotalPay: '5',
            maxMiles: '',
            maxJobMinutes: '',
        });
        const r = evaluateCherryOffer({ totalPay: 12, miles: 4, minutes: 30, rates }, parsed);
        expect(r.verdict).toBe('accept');
    });

    it('declines when pay per mile is too low', () => {
        const parsed = parseCherryRules({
            minPayPerMile: '5',
            minPayPerHour: '',
            minTotalPay: '',
            maxMiles: '',
            maxJobMinutes: '',
        });
        const r = evaluateCherryOffer({ totalPay: 12, miles: 4, minutes: 30, rates }, parsed);
        expect(r.verdict).toBe('decline');
    });
});
