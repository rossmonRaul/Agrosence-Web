import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "SaludDeLaPlanta";

export const ObtenerSaludDeLaPlanta = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerSaludDeLaPlanta`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarSaludDeLaPlanta = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ActualizarSaludDeLaPlanta`;
    return await ProcesarDatosApi('PUT', url, data);
} 

export const InsertarSaludDeLaPlanta = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarSaludDeLaPlanta`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoSaludDeLaPlanta = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoSaludDeLaPlanta`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarDocumentacionSaludDeLaPlanta = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarDocumentacionSaludDeLaPlanta`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerDocumentacionSaludDeLaPlanta = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDocumentacionSaludDeLaPlanta`;
    return await ProcesarDatosApi('POST', url, data);
}

export const DesactivarDocumentoSaludDeLaPlanta = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/DesactivarDocumentoSaludDeLaPlanta`;
    return await ProcesarDatosApi('PUT', url, data);
}
