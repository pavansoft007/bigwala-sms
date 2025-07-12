import { configureStore } from '@reduxjs/toolkit';
import ClassroomStore from "@/stores/ClassroomStore.ts";
import SubjectStore from "@/stores/SubjectStore.ts";
import userInfo from "@/stores/UserInfo.ts";

export const store = configureStore({
    reducer: {
        classrooms: ClassroomStore,
        subjects: SubjectStore,
        userInfo: userInfo,
    },
});

export type RootState = ReturnType<typeof store.getState>;