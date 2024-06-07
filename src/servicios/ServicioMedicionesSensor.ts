import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Sensor";

export const ObtenerMedicionesSensor = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerMedicionesSensor`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ModificarMedicionesSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarMedicionesSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const InsertarMedicionesSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarMedicionesSensor`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const CambiarEstadoMedicionSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoMedicionSensor`;
    return await ProcesarDatosApi('PUT', url, data);
}
