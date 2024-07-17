import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "CoberturaVegetal";

export const ObtenerRegistroCoberturaVegetal = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerCoberturaVegetal`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarCoberturaVegetal = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarCoberturaVegetal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarCoberturaVegetal = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarCoberturaVegetal`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoCoberturaVegetal = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoCoberturaVegetal`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerPuntoMedicionFincaParcela = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerPuntoMedicionFincaParcela`;
    return await ProcesarDatosApi('POST', url, data);
}