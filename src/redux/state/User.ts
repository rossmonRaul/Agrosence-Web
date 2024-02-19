import {createSlice} from "@reduxjs/toolkit";
import { Roles, UserInfo } from "../../models";
import { clearLocalStorage, persisLocalStorage } from "../../utilities";


export const EmptyUserState: UserInfo= {
    identificacion: '',
    email: '',
    idFinca: 0,
    idParcela: 0,
    idEmpresa: 0,
    rol: Roles.UsuarioSinLogeo,
    estado: 0
};


export const UserKey = 'user';

export const userSlice = createSlice({
    name: 'user',
    initialState: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : EmptyUserState,
    reducers:{
        createUser: (state, action) => {
            persisLocalStorage<UserInfo>(UserKey,action.payload);
            return action.payload;
        },
        updateUser: (state, action) =>  {
            const result = {...state, ...action.payload};
            persisLocalStorage<UserInfo>(UserKey,result);
            return result;
        },
        resetUser: () => {
            clearLocalStorage(UserKey);
            return EmptyUserState;
        }
    }
});

export const {createUser, updateUser, resetUser} = userSlice.actions;

export default userSlice.reducer;