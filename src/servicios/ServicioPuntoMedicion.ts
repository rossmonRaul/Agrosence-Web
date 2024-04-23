import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "PuntoMedicion";

export const ObtenerRegistroPuntoMedicion = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerRegistroPuntoMedicion`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CambiarEstadoRegistroPuntoMedicion = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoRegistroPuntoMedicion`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const InsertarRegistroPuntoMedicion = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarRegistroPuntoMedicion`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ModificarRegistroPuntoMedicion = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ModificarRegistroPuntoMedicion`;
    return await ProcesarDatosApi('PUT', url, data);
}

