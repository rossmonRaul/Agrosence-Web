import { configureStore } from "@reduxjs/toolkit";
import { UserInfo } from "../models/UserModel";
import userSliceReducer from "./state/User";

export interface AppStore{
    user: UserInfo;
}

export default configureStore<AppStore>({
    reducer: {
        user: userSliceReducer
    }
});