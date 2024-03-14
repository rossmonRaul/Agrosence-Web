import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "MedicionesSuelo";

export const ObtenerMedicionesSuelo = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDatosMedicionesSuelo`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ModificarMedicionesSuelo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ModificarMedicionesSuelo`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarMedicionesSuelo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarMedicionesSuelo`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoMedicionesSuelo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoMedicionesSuelo`;
    return await ProcesarDatosApi('PUT', url, data);
}