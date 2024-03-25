import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Cultivos";

export const ObtenerProductividadCultivos = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerProductividadCultivo`;
    return await ProcesarDatosApi('GET', url, '');
}

export const EditarProductividadCultivo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarProductividadCultivo`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const AgregarProductividadCultivo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearProductividadCultivo`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const CambiarEstadoProductividadCultivo = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarEstadoProductividadCultivo`;
    return await ProcesarDatosApi('PUT', url, data);
}

