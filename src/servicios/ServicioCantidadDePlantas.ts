import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "CantidadDePlantas";

export const ObtenerRegistroCantidadDePlantas = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerCantidadDePlantas`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoRegistroCantidadDePlantas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoCantidadDePlantas`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroCantidadDePlantas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarCantidadDePlantas`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarRegistroCantidadDePlantas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarCantidadDePlantas`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerPuntoMedicionFincaParcela = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerPuntoMedicionFincaParcela`;
    return await ProcesarDatosApi('POST', url, data);
}


