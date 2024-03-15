import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Cultivos";

export const ObtenerCalidadCultivos = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerCalidadCultivos`;
    return await ProcesarDatosApi('GET', url, '');
}

export const EditarCalidadCultivo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/EditarCalidadCultivo`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const AgregarCalidadCultivo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/AgregarCalidadCultivo`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const CambiarEstadoCalidadCultivo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoCalidadCultivo`;
    return await ProcesarDatosApi('PUT', url, data);
}