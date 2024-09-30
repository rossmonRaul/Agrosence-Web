import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "UsoAgua";

export const ObtenerUsoAgua = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerUsoAgua`;
    return await ProcesarDatosApi('GET', url, '');
}

export const EditarRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ActualizarRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CrearRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CrearRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const CambiarEstadoRegistroSeguimientoUsoAgua = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoRegistroSeguimientoUsoAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}
