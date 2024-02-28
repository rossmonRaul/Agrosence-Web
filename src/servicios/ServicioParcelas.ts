import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Parcela";

export const ObtenerParcelas = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerParcelas`;
    return await ProcesarDatosApi('GET', url, '');
}