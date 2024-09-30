import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Sensor";

export const ObtenerEstadoSensores = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerEstadoSensores`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerSensores = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerSensores`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerMedicionesAutorizadasSensor = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerMedicionesAutorizadasSensor`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarMedicionAutorizadaSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarMedicionAutorizadaSensor`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarSensores = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarSensores`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ModificarMedicionAutorizadaSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarMedicionAutorizadaSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const EliminarMedicionesAutorizadasSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/EliminarMedicionesAutorizadasSensor`;
    return await ProcesarDatosApi('DELETE', url, data);
}
