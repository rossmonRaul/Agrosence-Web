import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "ContenidoDeClorofila";

export const ObtenerRegistroContenidoDeClorofila = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerContenidoDeClorofila`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoRegistroContenidoDeClorofila = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoContenidoDeClorofila`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroContenidoDeClorofila = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarContenidoDeClorofila`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarRegistroContenidoDeClorofila = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarContenidoDeClorofila`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerPuntoMedicionFincaParcela = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerPuntoMedicionFincaParcela`;
    return await ProcesarDatosApi('POST', url, data);
}


