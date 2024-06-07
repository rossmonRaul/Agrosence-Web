import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Reporte";

/*Metodos GET */
export const ObtenerReporteEntradaSalidaTotal = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerReporteEntradaSalidaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteEntradaTotal = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerReporteEntradaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteSalidaTotal = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerReporteSalidaTotal`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReporteOrdenDeCompra= async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerReporteOrdenDeCompra`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerReportePlanilla = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerReportePlanilla`;
    return await ProcesarDatosApi('POST', url, data);
}