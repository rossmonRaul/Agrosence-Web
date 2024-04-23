import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Sensor";

export const ObtenerEstadoSensores = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerEstadoSensores`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerSensores = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerSensores`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarSensores = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarSensores`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarSensor = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ModificarSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoSensor = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}