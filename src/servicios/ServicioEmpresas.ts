import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Empresa";

export const ObtenerEmpresas = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerEmpresas`;
    return await ProcesarDatosApi('GET', url, '');
}