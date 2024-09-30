import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "ContenidoDeNitrogeno";

export const ObtenerRegistroContenidoDeNitrogeno = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerContenidoDeNitrogeno`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoRegistroContenidoDeNitrogeno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoContenidoDeNitrogeno`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroContenidoDeNitrogeno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarContenidoDeNitrogeno`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarRegistroContenidoDeNitrogeno = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarContenidoDeNitrogeno`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerPuntoMedicionFincaParcela = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerPuntoMedicionFincaParcela`;
    return await ProcesarDatosApi('POST', url, data);
}
