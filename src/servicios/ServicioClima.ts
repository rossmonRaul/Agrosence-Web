import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Clima";

/*Metodos GET */
export const ObtenerRegistroCondicionesMeteorologica = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerRegistroCondicionesMeteorologica`;
    return await ProcesarDatosApi('GET', url, '');
}


/*Metodos POST */
export const InsertarRegistroCondicionesMeteorologicas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarRegistroCondicionesMeteorologicas`;
    return await ProcesarDatosApi('POST', url, data);
}


/*Metodos PUT */
export const ModificarRegistroSeguimientoCondicionesMeteorologicas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ModificarRegistroSeguimientoCondicionesMeteorologicas`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroCondicionesMeteorologicas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoRegistroCondicionesMeteorologicas`;
    return await ProcesarDatosApi('PUT', url, data);
}
