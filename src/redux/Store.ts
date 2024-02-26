import { configureStore } from "@reduxjs/toolkit";
import { UserInfo } from "../models/UserModel";
import userSliceReducer from "./state/User";

// Definición del estado global de la aplicación.
export interface AppStore{
    user: UserInfo; // Información del usuario almacenada en el estado global
} 

// Configuración y creación de la tienda Redux.
export default configureStore<AppStore>({
    reducer: {
        user: userSliceReducer // Reductor para gestionar el estado del usuario
    }
});