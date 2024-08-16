import { baseURL } from "../constants";
import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Reporte";

/* Métodos GET */
export const ObtenerReporteEntradaSalidaTotal = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerReporteEntradaSalidaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteEntradaTotal = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerReporteEntradaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteSalidaTotal = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerReporteSalidaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteOrdenDeCompra = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerReporteOrdenDeCompra`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReportePlanilla = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerReportePlanilla`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteSensores = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerObtenerReporteSensores`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtieneReporteMedicionesSensor = async () => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtieneReporteMedicionesSensor`;
    return await ProcesarDatosApi('POST', url, null);
}

export const ObtenerReporteMedidasAutorizadasSensor = async (data: any) => {
    const url = `${baseURL}/api/v1.0/${controlador}/ObtenerReporteMedidasAutorizadasSensor`;
    return await ProcesarDatosApi('POST', url, data);
}