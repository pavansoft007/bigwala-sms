import { configureStore } from '@reduxjs/toolkit';
import ClassroomStore from "@/stores/ClassroomStore.ts";

export const store = configureStore({
    reducer: {
        classrooms: ClassroomStore,
    },
});

export type RootState = ReturnType<typeof store.getState>;