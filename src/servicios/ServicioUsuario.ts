import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";

export const ObtenerUsuariosAdministradores = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerUsuariosPorRol2`;
    return await ProcesarDatosApi('GET', url, '');
}

export const InsertarUsuario = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarUsuarioAdministrador = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/GuardarUsuarioPorSuperUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ValidarUsuario = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ValidarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarUsuarioAdministrador = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}
