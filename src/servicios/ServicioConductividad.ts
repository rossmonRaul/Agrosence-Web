import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "UsoAgua";

export const ObtenerConductividadElectricaEstresHidrico = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerConductividadElectricaEstresHidrico`;
    return await ProcesarDatosApi('GET', url, '');
}
