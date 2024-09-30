import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "RegistroManoObra";

/* Métodos GET */
export const ObtenerDatosRegistroManoObra = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDatosRegistroManoObra`;
    return await ProcesarDatosApi('GET', url, '');
}

/* Métodos POST */
export const InsertarRegistroManoObra = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarRegistroManoObra`;
    return await ProcesarDatosApi('POST', url, data);
}

/* Métodos PUT */
export const ModificarRegistroManoObra = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarRegistroManoObra`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroManoObra = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoRegistroManoObra`;
    return await ProcesarDatosApi('PUT', url, data);
}