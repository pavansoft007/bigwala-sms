import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Classroom from "@/types/Classroom.ts";

const initialState: Classroom[] = [];

const classroomSlice = createSlice({
    name: 'classrooms',
    initialState,
    reducers: {
        addClassroom: (state, action: PayloadAction<Classroom>) => {
            state.push(action.payload);
        },
        removeClassroom: (state, action: PayloadAction<Classroom>) => {
            state.splice(state.indexOf(action.payload), 1);
        },
        putClassrooms: (state, action: PayloadAction<Classroom[]>) => {
            state.splice(0, state.length);
            state.push(...action.payload);
        }
    },
});

export const { addClassroom ,removeClassroom ,putClassrooms } = classroomSlice.actions;
export default classroomSlice.reducer;
