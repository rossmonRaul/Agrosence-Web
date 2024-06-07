import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "OrdenDeCompra";

/* Métodos GET */
export const ObtenerDatosOrdenDeCompra = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDatosOrdenDeCompra`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerUltimoIdOrdenDeCompra = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerUltimoIdOrdenDeCompra`;
    return await ProcesarDatosApi('GET', url, '');
}

/* Métodos POST */
export const InsertarOrdenDeCompra = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarOrdenDeCompra`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerDetalleOrdenDeCompraPorId = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDetalleOrdenDeCompraPorId`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerDetallesOrdenDeCompraExportar = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerDetallesOrdenDeCompraExportar`;
    return await ProcesarDatosApi('POST', url, data);
}

/* Métodos PUT */
export const ModificarOrdenDeCompra = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarOrdenDeCompra`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoOrdenDeCompra = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoOrdenDeCompra`;
    return await ProcesarDatosApi('PUT', url, data);
}
