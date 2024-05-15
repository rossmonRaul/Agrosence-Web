import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "OrdenDeCompra";

/*Metodos GET */
export const ObtenerDatosOrdenDeCompra = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerDatosOrdenDeCompra`;
    return await ProcesarDatosApi('GET', url, '');
}


/*Metodos POST */
export const InsertarOrdenDeCompra = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/InsertarOrdenDeCompra`;
    return await ProcesarDatosApi('POST', url, data);
}


/*Metodos PUT */
export const ModificarOrdenDeCompra= async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ModificarOrdenDeCompra`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoOrdenDeCompra = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CambiarOrdenDeCompra`;
    return await ProcesarDatosApi('PUT', url, data);
}
