
import { useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/Reportes.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtieneReporteMedicionesSensor } from "../../../servicios/ServicioReporte.ts";
import { IoDocumentTextSharp } from "react-icons/io5";

function ReporteMedicionesSensor() {    

    // Estado para almacenar todos los usuarios asignados
    const [apiData, setApiData] = useState<any[]>([]);

    // Función para obtener la fecha y hora formateadas
    const getFormattedDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    };

    // Función para exportar datos a Excel
    const exportToExcel = () => {
        try {
            // Crear una hoja de cálculo vacía
            const ws = XLSX.utils.aoa_to_sheet([]);

            // Ajustar los encabezados según los nombres de columnas definidos
            const headers = columns.map(col => col.header); // Obtener los encabezados de las columnas
            XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' }); // Agregar los encabezados a la hoja de cálculo

            // Añadir los datos a la hoja de cálculo
            apiData.forEach((dataRow, index) => {
                const rowData = columns.map(col => dataRow[col.key] ?? ''); // Obtener los datos en el orden correcto

                // Agregar los datos a la hoja de cálculo
                XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: `A${index + 2}` }); // +2 porque A1 es para encabezados                
            });

            // Crear un nuevo libro de Excel y agregar la hoja de cálculo
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Medidas de Sensor');

            // Escribir el libro de Excel en un búfer
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

            // Obtener la fecha y hora formateadas para el nombre del archivo
            const formattedDateTime = getFormattedDateTime();

            // Crear el nombre del archivo con la fecha y hora
            const fileName = `reporte_medidas_sensor_${formattedDateTime}.xlsx`;

            // Crear un blob con los datos del búfer para descargar
            const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

            // Utilizar la función saveAs de file-saver para descargar el archivo con el nombre generado
            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
        }
    };

    // Función para filtrar datos
    const obtenerRegistros = async () => {
        try {
            const datos = await ObtieneReporteMedicionesSensor();

            // Actualizar datos de la tabla
            setApiData(datos);
        } catch (error) {            
            console.error('Error al obtener los datos:', error);
        }
    };

    useEffect(() => {
        obtenerRegistros();
      }, []);

    // Columnas de la tabla
    const columns = [
        { key: 'idMedicion', header: 'ID Medición' },
        { key: 'nombre', header: 'Nombre' },
        { key: 'unidadMedida', header: 'Unidad Medida' },
        { key: 'nomenclatura', header: 'Nomenclatura' },
        { key: 'estadoPalabra', header: 'Estado' }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Reporte Medidas de Sensor" />
                <div className="content">
                    <div className="filtro-container">
                        {apiData.length > 0 &&
                            <button onClick={exportToExcel} className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                                <IoDocumentTextSharp size={27} />
                                <span style={{ marginLeft: '5px' }}>Exportar</span>

                            </button>
                        }                        
                    </div>
                    <br />
                    {apiData.length > 0 &&
                        <TableResponsive columns={columns} data={apiData} itemsPerPage={15}/>
                    }
                    {apiData.length < 1 &&
                            <h2><br />No se encontraron registros de medidas de sensor</h2>
                    }
                </div>
            </div>

        </Sidebar>
    )

}
export default ReporteMedicionesSensor