import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Platform } from 'react-native';
import { tailwind } from 'tailwind';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { computeCherryPickerRates, formatUsd } from './cherryPickerRates';
import { parseCherryRules, evaluateCherryOffer } from './evaluateCherryOffer';
import { setCherryRule, resetCherryRules, CherryPickerRulesState } from './cherryPickerSlice';
import { RootState } from '../../store';
import { isNativeCherryDriverAvailable } from './cherryPickerNativeBridge';

function parseMoney(raw: string): number {
    const n = parseFloat(raw.replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
}

function parsePositiveNumber(raw: string): number {
    const n = parseFloat(raw.replace(/,/g, ''));
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

const LabeledInput = ({
    label,
    value,
    onChangeText,
    prefix,
    suffix,
    placeholder,
    keyboardType,
}: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    prefix?: string;
    suffix?: string;
    placeholder: string;
    keyboardType?: 'default' | 'decimal-pad' | 'numeric';
}) => (
    <View style={tailwind('flex-col m-2')}>
        <Text style={tailwind('text-base text-black mb-1')}>{label}</Text>
        <View style={tailwind('flex-row items-center rounded-lg bg-gray-100 pl-2 pr-2')}>
            {prefix ? (
                <Text style={tailwind('text-lg text-black')}>{prefix}</Text>
            ) : null}
            <TextInput
                style={tailwind('flex-1 text-lg text-black py-2')}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType ?? 'decimal-pad'}
                returnKeyType="done"
            />
            {suffix ? (
                <Text style={tailwind('text-lg text-black font-bold pr-1')}>{suffix}</Text>
            ) : null}
        </View>
    </View>
);

export function CherryPickerScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const rules = useSelector((state: RootState): CherryPickerRulesState => state.cherryPicker);

    const [pay, setPay] = useState('');
    const [tip, setTip] = useState('');
    const [miles, setMiles] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');

    const payN = parseMoney(pay);
    const tipN = parseMoney(tip);
    const milesN = parsePositiveNumber(miles);
    const minutesN = parsePositiveNumber(durationMinutes);

    const rates = useMemo(
        () => computeCherryPickerRates(payN, tipN, milesN, minutesN),
        [payN, tipN, milesN, minutesN]
    );

    const parsedRules = useMemo(() => parseCherryRules(rules), [rules]);

    const decision = useMemo(
        () =>
            evaluateCherryOffer(
                {
                    totalPay: rates.totalPay,
                    miles: milesN,
                    minutes: minutesN,
                    rates,
                },
                parsedRules
            ),
        [rates, milesN, minutesN, parsedRules]
    );

    const nativeDriver = isNativeCherryDriverAvailable();

    const verdictStyle =
        decision.verdict === 'accept'
            ? tailwind('bg-green-100 border-green-500')
            : decision.verdict === 'decline'
            ? tailwind('bg-red-100 border-red-400')
            : tailwind('bg-gray-100 border-gray-300');

    const verdictTitle =
        decision.verdict === 'accept'
            ? 'Accept (by your rules)'
            : decision.verdict === 'decline'
            ? 'Decline (by your rules)'
            : 'Needs more info';

    return (
        <View style={tailwind('flex-1 bg-gray-100 pt-10')}>
            <View style={tailwind('flex-row w-full items-center px-2 mb-2')}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={tailwind('flex-row items-center p-2')}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                >
                    <Ionicons name="chevron-back" size={28} color="black" />
                    <Text style={tailwind('text-lg font-bold text-black')}>Back</Text>
                </Pressable>
            </View>
            <ScrollView
                style={tailwind('flex-1')}
                contentContainerStyle={tailwind('pb-10')}
                keyboardShouldPersistTaps="handled"
            >
                <View style={tailwind('px-3 pb-2')}>
                    <Text style={tailwind('text-3xl font-bold text-black')}>Cherry Picker</Text>
                    <Text style={tailwind('text-base text-black mt-2')}>
                        Type what you see on an offer: pay, tip, miles, and how long you think the job
                        will take. Gigbox updates dollars per mile and per hour live, then compares the
                        offer to the thresholds you set below.
                    </Text>
                    <Text style={tailwind('text-sm text-gray-700 mt-2')}>
                        {Platform.OS === 'ios'
                            ? 'iOS does not allow third-party apps to float on top of Uber, Lyft, or DoorDash. Use split view (where available) or switch apps quickly while you decide.'
                            : 'Floating over other apps and auto-tapping Accept or Decline needs a native Android accessibility driver. This Expo build does not ship that driver yet; use split-screen or quick-switch for now.'}{' '}
                        {nativeDriver
                            ? 'A native driver is available on this device; overlay controls will appear here in a future update.'
                            : ''}
                    </Text>
                    <Text style={tailwind('text-sm text-gray-700 mt-2')}>
                        Automated accept or decline can violate driver-app terms and risk deactivation.
                        Gigbox shows guidance only; you still confirm the tap in Uber, Lyft, or
                        DoorDash unless you later install a companion tool you trust.
                    </Text>
                </View>

                <View style={[tailwind('rounded-xl m-2 p-4 border-2'), verdictStyle]}>
                    <Text style={tailwind('text-xl font-bold text-black')}>{verdictTitle}</Text>
                    {decision.reasons.map((line, i) => (
                        <Text key={i} style={tailwind('text-base text-black mt-2')}>
                            {line}
                        </Text>
                    ))}
                </View>

                <View style={tailwind('bg-white rounded-xl m-2 p-2')}>
                    <Text style={tailwind('text-lg font-bold text-black m-2')}>This offer</Text>
                    <LabeledInput
                        label="Job pay"
                        value={pay}
                        onChangeText={setPay}
                        prefix="$ "
                        placeholder="0"
                    />
                    <LabeledInput
                        label="Tip (optional)"
                        value={tip}
                        onChangeText={setTip}
                        prefix="$ "
                        placeholder="0"
                    />
                    <LabeledInput
                        label="Miles (distance you care about)"
                        value={miles}
                        onChangeText={setMiles}
                        suffix=" mi"
                        placeholder="0"
                    />
                    <LabeledInput
                        label="Estimated time on this job"
                        value={durationMinutes}
                        onChangeText={setDurationMinutes}
                        suffix=" min"
                        placeholder="0"
                    />
                </View>

                <View style={tailwind('bg-white rounded-xl m-2 p-2')}>
                    <Text style={tailwind('text-lg font-bold text-black m-2')}>
                        Your thresholds (saved on this device)
                    </Text>
                    <Text style={tailwind('text-sm text-gray-600 mx-2 mb-1')}>
                        Leave a field blank to turn that rule off. Decline-style caps use maximum miles
                        or minutes.
                    </Text>
                    <LabeledInput
                        label="Minimum pay + tip"
                        value={rules.minTotalPay}
                        onChangeText={(v) =>
                            dispatch(setCherryRule({ field: 'minTotalPay', value: v }))
                        }
                        prefix="$ "
                        placeholder="off"
                    />
                    <LabeledInput
                        label="Minimum pay per mile"
                        value={rules.minPayPerMile}
                        onChangeText={(v) =>
                            dispatch(setCherryRule({ field: 'minPayPerMile', value: v }))
                        }
                        prefix="$ "
                        placeholder="off"
                    />
                    <LabeledInput
                        label="Minimum pay per hour"
                        value={rules.minPayPerHour}
                        onChangeText={(v) =>
                            dispatch(setCherryRule({ field: 'minPayPerHour', value: v }))
                        }
                        prefix="$ "
                        placeholder="off"
                    />
                    <LabeledInput
                        label="Maximum miles (decline above this)"
                        value={rules.maxMiles}
                        onChangeText={(v) => dispatch(setCherryRule({ field: 'maxMiles', value: v }))}
                        suffix=" mi"
                        placeholder="off"
                    />
                    <LabeledInput
                        label="Maximum minutes (decline above this)"
                        value={rules.maxJobMinutes}
                        onChangeText={(v) =>
                            dispatch(setCherryRule({ field: 'maxJobMinutes', value: v }))
                        }
                        suffix=" min"
                        placeholder="off"
                    />
                    <Pressable
                        onPress={() => dispatch(resetCherryRules())}
                        style={tailwind('m-2 p-2 border rounded-lg items-center')}
                    >
                        <Text style={tailwind('text-black font-bold')}>Clear all thresholds</Text>
                    </Pressable>
                </View>

                <View style={tailwind('bg-white rounded-xl m-2 p-4')}>
                    <Text style={tailwind('text-lg font-bold text-black mb-3')}>Rates</Text>
                    <View style={tailwind('flex-row justify-between py-2 border-b border-gray-200')}>
                        <Text style={tailwind('text-base text-black')}>Pay + tip</Text>
                        <Text style={tailwind('text-base font-bold text-black')}>
                            {formatUsd(rates.totalPay)}
                        </Text>
                    </View>
                    <View style={tailwind('flex-row justify-between py-2 border-b border-gray-200')}>
                        <Text style={tailwind('text-base text-black')}>Per mile</Text>
                        <Text style={tailwind('text-base font-bold text-black')}>
                            {formatUsd(rates.payPerMile)}
                        </Text>
                    </View>
                    <View style={tailwind('flex-row justify-between py-2')}>
                        <Text style={tailwind('text-base text-black')}>Per hour</Text>
                        <Text style={tailwind('text-base font-bold text-black')}>
                            {formatUsd(rates.payPerHour)}
                        </Text>
                    </View>
                    {rates.payPerMile === null || rates.payPerHour === null ? (
                        <Text style={tailwind('text-sm text-gray-600 mt-2')}>
                            Add miles and minutes above to see per-mile and hourly rates.
                        </Text>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
}
