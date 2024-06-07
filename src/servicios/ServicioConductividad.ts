import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "UsoAgua";

export const ObtenerConductividadElectricaEstresHidrico = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerConductividadElectricaEstresHidrico`;
    return await ProcesarDatosApi('GET', url, '');
}
