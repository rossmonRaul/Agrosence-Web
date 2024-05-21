import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "RegistroManoObra";

/*Metodos GET */
export const ObtenerDatosRegistroManoObra = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDatosRegistroManoObra`;
    return await ProcesarDatosApi('GET', url, '');
}


/*Metodos POST */
export const InsertarRegistroManoObra= async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarRegistroManoObra`;
    return await ProcesarDatosApi('POST', url, data);
}


/*Metodos PUT */
export const ModificarRegistroManoObra = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ModificarRegistroManoObra`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoRegistroManoObra = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoRegistroManoObra`;
    return await ProcesarDatosApi('PUT', url, data);
}
