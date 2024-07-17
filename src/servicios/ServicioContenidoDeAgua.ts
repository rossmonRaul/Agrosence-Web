import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "ContenidoDeAgua";

export const ObtenerRegistroContenidoDeAgua = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerContenidoDeAgua`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoRegistroContenidoDeAgua = async(data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoContenidoDeAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroContenidoDeAgua= async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarContenidoDeAgua`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarRegistroContenidoDeAgua = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarContenidoDeAgua`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerPuntoMedicionFincaParcela = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerPuntoMedicionFincaParcela`;
    return await ProcesarDatosApi('POST', url, data);
}


