import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { tailwind } from 'tailwind';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { computeCherryPickerRates, formatUsd } from './cherryPickerRates';

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
    const [pay, setPay] = useState('');
    const [tip, setTip] = useState('');
    const [miles, setMiles] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');

    const rates = useMemo(
        () =>
            computeCherryPickerRates(
                parseMoney(pay),
                parseMoney(tip),
                parsePositiveNumber(miles),
                parsePositiveNumber(durationMinutes)
            ),
        [pay, tip, miles, durationMinutes]
    );

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
                        Enter what an offer pays, how far it is, and how long you expect it to take.
                        Totals update as you type so you can compare gigs quickly.
                    </Text>
                </View>

                <View style={tailwind('bg-white rounded-xl m-2 p-2')}>
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
                        label="Miles (one way or total you care about)"
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
