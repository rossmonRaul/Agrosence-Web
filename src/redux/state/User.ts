import {createSlice} from "@reduxjs/toolkit";
import { Roles, UserInfo } from "../../models";
import { clearSessionStorage, persisSessionStorage } from "../../utilities";

// Estado inicial del usuario cuando no hay sesión activa.
export const EmptyUserState: UserInfo= {
    identificacion: '',
    nombre: '',
    email: '',
    idFinca: 0,
    idParcela: 0,
    idEmpresa: 0,
    idRol: Roles.UsuarioSinLogeo,
    estado: 0
};

// Clave para almacenar y recuperar la información del usuario en el almacenamiento de sesión.
export const UserKey = 'user';

export const userSlice = createSlice({
    name: 'user',
    initialState: sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user') as string) : EmptyUserState,  // Estado inicial del slice, se recupera del almacenamiento de sesión si está disponible
    reducers:{
        // Acción para crear un nuevo usuario en el estado y persistirlo en el almacenamiento de sesión.
        createUser: (state, action) => {
            persisSessionStorage<UserInfo>(UserKey,action.payload);
            return action.payload;
        },
        // Acción para actualizar la información del usuario en el estado y persistir los cambios en el almacenamiento de sesión.
        updateUser: (state, action) =>  {
            const result = {...state, ...action.payload};
            persisSessionStorage<UserInfo>(UserKey,result);
            return result;
        },
        // Acción para restablecer el estado del usuario a su valor inicial y eliminar la información del almacenamiento de sesión.
        resetUser: () => {
            clearSessionStorage(UserKey);
            return EmptyUserState;
        }
    }
});

// Exportación de las acciones creadas por el slice de usuario.
export const {createUser, updateUser, resetUser} = userSlice.actions;

// Exportación del reductor generado por el slice de usuario.
export default userSlice.reducer;