import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "RegistroEntradaSalida";

/*Metodos GET */
export const ObtenerRegistroEntradaSalida = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDatosRegistroEntradaSalida`;
    return await ProcesarDatosApi('GET', url, '');
}
export const ObtenerRegistroSalidaPorFecha = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDatosRegistroSalidaPorFecha`;
    return await ProcesarDatosApi('GET', url, '');
}


/*Metodos POST */
export const InsertarRegistroEntradaSalida = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarRegistroEntradaSalida`;
    return await ProcesarDatosApi('POST', url, data);
}
export const ObtenerDetalleRegistroEntradaSalidaPorId = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDetalleRegistroEntradaSalidaPorId`;
    return await ProcesarDatosApi('POST', url, data);
}
export const ObtenerDetallesRegistroEntradaSalidaExportar = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDetallesRegistroEntradaSalidaExportar`;
    return await ProcesarDatosApi('POST', url, data);
}


/*Metodos PUT */
export const ModificarRegistroEntradaSalida = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ModificarRegistroEntradaSalida`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroEntradaSalida = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoRegistroEntradaSalida`;
    return await ProcesarDatosApi('PUT', url, data);
}
