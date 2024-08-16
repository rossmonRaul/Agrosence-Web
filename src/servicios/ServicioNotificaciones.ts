import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Notificaciones";

export const ObtenerNotificaciones = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerNotificaciones`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarNotificaciones = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarNotificaciones`;
    return await ProcesarDatosApi('POST', url, data);
}

export const EliminarNotificaciones = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/EliminarNotificaciones`;
    return await ProcesarDatosApi('PUT', url, data);
}

