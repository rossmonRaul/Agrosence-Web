import {createSlice} from "@reduxjs/toolkit";
import { Roles, UserInfo } from "../../models";
import { clearSessionStorage, persisSessionStorage } from "../../utilities";


export const EmptyUserState: UserInfo= {
    identificacion: '',
    email: '',
    idFinca: 0,
    idParcela: 0,
    idEmpresa: 0,
    idRol: Roles.UsuarioSinLogeo,
    estado: 0
};


export const UserKey = 'user';

export const userSlice = createSlice({
    name: 'user',
    initialState: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : EmptyUserState,
    reducers:{
        createUser: (state, action) => {
            persisSessionStorage<UserInfo>(UserKey,action.payload);
            return action.payload;
        },
        updateUser: (state, action) =>  {
            const result = {...state, ...action.payload};
            persisSessionStorage<UserInfo>(UserKey,result);
            return result;
        },
        resetUser: () => {
            clearSessionStorage(UserKey);
            return EmptyUserState;
        }
    }
});

export const {createUser, updateUser, resetUser} = userSlice.actions;

export default userSlice.reducer;