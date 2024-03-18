import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Fertilizante";

// export const ObtenerInfo = async () => {
//     //const url = `${controlador}/ObtenerUsuarios`;
//     const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerUsuariosPorRol2`;
//     return await ProcesarDatosApi('GET', url, '');
// }

export const ObtenerInfo = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://65eb6f9543ce16418933d9a4.mockapi.io/${controlador}/obtenerdatos`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerManejoFertilizantes = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerManejoFertilizantes`;
    return await ProcesarDatosApi('GET', url, '');
}

export const CambiarEstadoManejoFertilizantes = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoManejoFertilizantes`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarManejoFertilizantes = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarManejoFertilizantes`;
    return await ProcesarDatosApi('POST', url, data);
}

export const EditarManejoFertilizantes = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarManejoFertilizantes`;
    return await ProcesarDatosApi('PUT', url, data);
}