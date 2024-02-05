import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";

export const ObtenerUsuarios = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerUsuarios`;
    return await ProcesarDatosApi('GET', url);
}

export const InsertarUsuario = async (data) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}