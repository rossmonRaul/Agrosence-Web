import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "TipoFertilizante";

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
export const ObtenerTipoFertilizantes = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerTipoFertilizantes`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoTipoFertilizantes = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoTipoFertilizantes`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarTipoFertilizantes = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/InsertarTipoFertilizantes`;
    return await ProcesarDatosApi('POST', url, data);
}

export const EditarTipoFertilizantes = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ActualizarTipoFertilizantes`;
    return await ProcesarDatosApi('PUT', url, data);
}