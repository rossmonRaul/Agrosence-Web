import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";

export const ObtenerUsuarios = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerUsuarios`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarUsuario = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ValidarUsuario = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ValidarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}