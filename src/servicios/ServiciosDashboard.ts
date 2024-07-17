import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Dashboard";

export const ObtenerFincasParcelasDeEmpresaPorUsuario = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerFincasParcelasDeEmpresaPorUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerMedicionesSensores = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerMedicionesSensores`;
    return await ProcesarDatosApi('POST', url, data);
}
