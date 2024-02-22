import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Finca";

export const ObtenerFincas = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerFincas`;
    return await ProcesarDatosApi('GET', url, '');
}