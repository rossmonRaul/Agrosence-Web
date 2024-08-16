import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Finca";

export const ObtenerFincas = async (idEmpresa: number) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerFincas?idEmpresa=${idEmpresa}`;
    return await ProcesarDatosApi('GET', url, '');
}

export const EditarFincas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ActualizarFinca`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const GuardarFincas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CrearFinca`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoFincas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoFinca`;
    return await ProcesarDatosApi('PUT', url, data);
}

