import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Empresa";

export const ObtenerEmpresas = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerEmpresas`;
    return await ProcesarDatosApi('GET', url, '');
}

export const EditarEmpresas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarEmpresa`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const GuardarEmpresas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const CambiarEstadoEmpresas = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoEmpresa`;
    return await ProcesarDatosApi('PUT', url, data);
}