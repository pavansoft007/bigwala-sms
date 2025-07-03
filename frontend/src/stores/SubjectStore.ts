import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Subject from "@/types/Subject.ts";

const initialState: Subject[] = [];

const subjectSlice = createSlice({
    name: 'subjects',
    initialState,
    reducers: {
        addSubject: (state, action: PayloadAction<Subject>) => {
            state.push(action.payload);
        },
        removeSubject: (state, action: PayloadAction<Subject>) => {
            state.splice(state.indexOf(action.payload), 1);
        },
        putSubject: (state, action: PayloadAction<Subject[]>) => {
            state.splice(0, state.length);
            state.push(...action.payload);
        }
    },
});

export const { addSubject ,removeSubject ,putSubject } = subjectSlice.actions;
export default subjectSlice.reducer;
