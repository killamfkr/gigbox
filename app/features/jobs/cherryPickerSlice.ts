import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** User thresholds for comparing an offer (strings match TextInput wiring; empty = rule off). */
export type CherryPickerRulesState = {
    minPayPerMile: string;
    minPayPerHour: string;
    minTotalPay: string;
    maxMiles: string;
    maxJobMinutes: string;
};

const initialState: CherryPickerRulesState = {
    minPayPerMile: '',
    minPayPerHour: '',
    minTotalPay: '',
    maxMiles: '',
    maxJobMinutes: '',
};

const cherryPickerSlice = createSlice({
    name: 'cherryPicker',
    initialState,
    reducers: {
        setCherryRule: (
            state,
            action: PayloadAction<{ field: keyof CherryPickerRulesState; value: string }>
        ) => {
            const { field, value } = action.payload;
            state[field] = value;
        },
        resetCherryRules: () => initialState,
    },
});

export const { setCherryRule, resetCherryRules } = cherryPickerSlice.actions;
export default cherryPickerSlice.reducer;
