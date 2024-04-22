import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "RiesgoNatural";

export const ObtenerRiesgosNaturales = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerRiesgosNaturales`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarRiesgoNatural = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarRiesgoNatural`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRiesgoNatural = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarRiesgoNatural`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoRiesgoNatural = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoRiesgoNatural`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarDocumentacionRiesgoNatural = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarDocumentacionRiesgoNatural`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerDocumentacionRiesgoNatural = async (data:any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDocumentacionRiesgoNatural`;
    return await ProcesarDatosApi('POST', url, data);
}

export const DesactivarDocumentoRiesgoNatural = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/DesactivarDocumentoRiesgoNatural`;
    return await ProcesarDatosApi('PUT', url, data);
}