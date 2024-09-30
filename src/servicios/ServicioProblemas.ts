import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "PlagasYEnfermedades";

export const ObtenerRegistroSeguimientoPlagasyEnfermedades = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ModificarRegistroSeguimientoPlagasyEnfermedades = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroSeguimientoPlagasyEnfermedades = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoRegistroSeguimientoPlagasyEnfermedades = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoRegistroSeguimientoPlagasYEnfermedades`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarDocumentacionProblemasDePlagas= async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarDocumentacionProblemasDePlagas`;
    return await ProcesarDatosApi('POST', url, data);
}
export const ObtenerDocumentacionProblemasDePlagas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDocumentacionProblemasDePlagas`;
    return await ProcesarDatosApi('POST', url, data);
}

export const DesactivarDocumentoProblemasDePlagas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/DesactivarDocumentoProblemasDePlagas`;
    return await ProcesarDatosApi('PUT', url, data);
}