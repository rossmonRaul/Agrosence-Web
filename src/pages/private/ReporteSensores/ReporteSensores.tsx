
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/Reportes.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerReporteSensores } from "../../../servicios/ServicioReporte.ts";
import { IoDocumentTextSharp, IoFilter } from "react-icons/io5";


function ReporteSensores() {

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
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');

            // Escribir el libro de Excel en un búfer
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

            // Obtener la fecha y hora formateadas para el nombre del archivo
            const formattedDateTime = getFormattedDateTime();

            // Crear el nombre del archivo con la fecha y hora
            const fileName = `reporte_sensores_${formattedDateTime}.xlsx`;

            // Crear un blob con los datos del búfer para descargar
            const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

            // Utilizar la función saveAs de file-saver para descargar el archivo con el nombre generado
            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
        }
    };

    useEffect(() => {
         obtenerDatos();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatos = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            if (idEmpresa) {

                const formData = {
                    idEmpresa: idEmpresa
                }
                const datos = await ObtenerReporteSensores(formData);

                // Actualizar datos de la tabla
                setApiData(datos);
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };
    
    // Columnas de la tabla
    const columns = [
        { key: 'idSensor', header: 'Id Sensor' },
        { key: 'identificadorSensor', header: 'EUI' },
        { key: 'nombreSensor', header: 'Nombre' },
        { key: 'codigoPuntoMedicion', header: 'Punto Medicion' },
        { key: 'parcela', header: 'Parcela' },
        { key: 'finca', header: 'Finca' },
        { 
        key: 'estadoSensor', 
        header: 'Estado',
        getColor: (value: string) => {
            switch (value) {
                case 'Activo':
                    return 'FF00FF00'; // Verde
                case 'En mantenimiento':
                    return 'FFFFA500'; // Anaranjado
                case 'Apagado':
                    return 'FFFF0000'; // Rojo
                case 'Fuera de servicio':
                    return 'FF8B0000'; // Rojo oscuro
                default:
                    return 'FF000000'; // Negro por defecto
            }
        }
    },
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Reporte de Sensores" />
                <div className="content">
                <div className="filtro-container"></div>
                {apiData.length > 0 &&
                        <button onClick={exportToExcel} className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IoDocumentTextSharp size={27} />
                            <span style={{ marginLeft: '5px' }}>Exportar</span>
                        </button>
                    }
                    {apiData.length > 0 &&
                        <TableResponsive columns={columns} data={apiData} />
                    }
                </div>
            </div>

        </Sidebar>
    )

}
export default ReporteSensores