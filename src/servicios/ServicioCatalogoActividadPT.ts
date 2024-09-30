import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "CatalogoActividadPT";

export const ObtenerDatosPreparacionTerrenoActividad = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDatosPreparacionTerrenoActividad`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoActividadPrepTerreno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoActividadPrepTerreno`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarActividadPreparacionTerreno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarActividadPreparacionTerreno`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarActividadPreparacionTerreno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarActividadPreparacionTerreno`;
    return await ProcesarDatosApi('PUT', url, data);
}