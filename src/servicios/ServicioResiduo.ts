import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Residuo";

export const ObtenerManejoResiduos = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerManejoResiduos`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ModificarManejoResiduos = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarManejoResiduos`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarManejoResiduos = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarManejoResiduos`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoManejoResiduos = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoManejoResiduos`;
    return await ProcesarDatosApi('PUT', url, data);
}