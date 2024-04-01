import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "UsoAgua";

export const ObtenerEficienciaRiego = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerEficienciaRiego`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarRegistroEficienciaRiego = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarRegistroEficienciaRiego`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CrearRegistroEficienciaRiego = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearRegistroEficienciaRiego`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoEficienciaRiego = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoRegistroEficienciaRiego`;
    return await ProcesarDatosApi('PUT', url, data);
}