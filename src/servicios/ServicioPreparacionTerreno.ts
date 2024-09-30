import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "PreparacionTerreno";

export const ObtenerDatosPreparacionTerreno = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDatosPreparacionTerreno`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerDatosPreparacionTerrenoActividad = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDatosPreparacionTerrenoActividad`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerDatosPreparacionTerrenoMaquinaria = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDatosPreparacionTerrenoMaquinaria`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoPreparacionTerreno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoPreparacionTerreno`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarPreparacionTerrenos = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarPreparacionTerreno`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarPreparacionTerreno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarPreparacionTerreno`;
    return await ProcesarDatosApi('PUT', url, data);
}


