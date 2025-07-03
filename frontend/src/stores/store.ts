import { configureStore } from '@reduxjs/toolkit';
import ClassroomStore from "@/stores/ClassroomStore.ts";
import SubjectStore from "@/stores/SubjectStore.ts";

export const store = configureStore({
    reducer: {
        classrooms: ClassroomStore,
        subjects: SubjectStore,
    },
});

export type RootState = ReturnType<typeof store.getState>;