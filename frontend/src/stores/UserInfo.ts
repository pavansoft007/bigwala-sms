import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import UserData from "@/types/UserInfo.ts";

const initialState: UserData = {
    admin_name: '',
    school_name: '',
    role_name: '',
    permissions: []
};

const userInfo = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        putData: (state, action: PayloadAction<UserData>) => {
            state.admin_name = action.payload.admin_name;
            state.school_name = action.payload.school_name;
            state.role_name = action.payload.role_name;
            state.permissions = action.payload.permissions;
        }
    },
});

export const { putData } = userInfo.actions;
export default userInfo.reducer;