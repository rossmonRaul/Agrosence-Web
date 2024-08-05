import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Cultivos";

/*Metodos GET */
export const ObtenerProductividadCultivos = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerProductividadCultivo`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerRotacionCultivoSegunEstacionalidad = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerRotacionCultivoSegunEstacionalidad`;
    return await ProcesarDatosApi('GET', url, '');
}
export const ObtenerMedidasCultivos = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerMedidasCultivos`;
    return await ProcesarDatosApi('GET', url, '');
}
/*Metodos POST */
export const InsertarRotacionCultivoSegunEstacionalidad = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarRotacionCultivoSegunEstacionalidad`;
    return await ProcesarDatosApi('POST', url, data);
}

export const AgregarProductividadCultivo = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CrearProductividadCultivo`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarMedidasCultivos = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarMedidasCultivos`;
    return await ProcesarDatosApi('POST', url, data);
}

/*Metodos PUT */
export const EditarProductividadCultivo = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ActualizarProductividadCultivo`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ModificarRotacionCultivoSegunEstacionalidad = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarRotacionCultivoSegunEstacionalidad`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ModificarMedidasCultivos = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ModificarMedidasCultivos`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoProductividadCultivo = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoProductividadCultivo`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRotacionCultivo = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoRotacionCultivo`;
    return await ProcesarDatosApi('PUT', url, data);
}


export const CambiarEstadoMedidasCultivos = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoMedidasCultivos`;
    return await ProcesarDatosApi('PUT', url, data);
}