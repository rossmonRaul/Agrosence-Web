import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Parcela";

export const ObtenerParcelas = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerParcelas`;
    return await ProcesarDatosApi('GET', url, '');
}

export const EditarParcelas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const GuardarParcelas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearParcela`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const CambiarEstadoParcelas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}