
import { useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/Reportes.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";

import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtieneReporteMedicionesSensor } from "../../../servicios/ServicioReporte.ts";
import { IoDocumentTextSharp } from "react-icons/io5";
import { exportToExcel } from '../../../utilities/exportReportToExcel.ts';


function ReporteMedicionesSensor() {    

    // Estado para almacenar todos los usuarios asignados
    const [apiData, setApiData] = useState<any[]>([]);

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
        { key: 'idMedicion', header: 'ID Medición', width: 15 },
        { key: 'nombre', header: 'Nombre', width: 40 },
        { key: 'unidadMedida', header: 'Unidad Medida', width: 35 },
        { key: 'nomenclatura', header: 'Nomenclatura', width: 15 },
        { key: 'estadoPalabra', header: 'Estado', width: 15 }
    ];

    //
    const reportName = "Reporte Medidas de Sensor";
    const userName = localStorage.getItem('nombreUsuario') || 'Usuario';

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Reporte Medidas de Sensor" />
                <div className="content">
                    <div className="filtro-container">
                        {apiData.length > 0 &&
                            <button onClick={() => exportToExcel({ reportName, data: apiData, columns, userName })}  className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

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