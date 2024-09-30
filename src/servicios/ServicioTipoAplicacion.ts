import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "TipoAplicacion";

// export const ObtenerInfo = async () => {
//     //const url = `${controlador}/ObtenerUsuarios`;
//     const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerUsuariosPorRol2`;
//     return await ProcesarDatosApi('GET', url, '');
// }

export const ObtenerInfo = async () => {
    const url = `https://65eb6f9543ce16418933d9a4.mockapi.io/${controlador}/obtenerdatos`;
    return await ProcesarDatosApi('GET', url, '');
}

// Funciones con URLs locales
export const ObtenerTipoAplicacion = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerTipoAplicacion`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoTipoAplicacion = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoTipoAplicacion`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarTipoAplicacion = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarTipoAplicacion`;
    return await ProcesarDatosApi('POST', url, data);
}

export const EditarTipoAplicacion = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ActualizarTipoAplicacion`;
    return await ProcesarDatosApi('PUT', url, data);
}