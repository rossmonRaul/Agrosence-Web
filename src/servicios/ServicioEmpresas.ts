import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Empresa";

/*Metodos GET */
export const ObtenerEmpresas = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerEmpresas`;
    return await ProcesarDatosApi('GET', url, '');
}

/*Metodos PUT */
export const EditarEmpresas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ActualizarEmpresa`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
/*Metodos POST */
export const GuardarEmpresas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CrearEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}
 
/*Metodos PUT */
export const CambiarEstadoEmpresas = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/CambiarEstadoEmpresa`;
    return await ProcesarDatosApi('PUT', url, data);
}
