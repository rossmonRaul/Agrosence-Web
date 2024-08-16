
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/Reportes.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerReporteSensores } from "../../../servicios/ServicioReporte.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { exportToExcel } from '../../../utilities/exportReportToExcel.ts';

function ReporteSensores() {

    // Estado para almacenar todos los usuarios asignados
    const [apiData, setApiData] = useState<any[]>([]);


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
    
    //
    const reportName = "Reporte de Sensores";
    const userName = localStorage.getItem('nombreUsuario') || 'Usuario';


    // Columnas de la tabla con propiedad de ancho
    const columns = [
        { key: 'idSensor', header: 'Id Sensor', width: 15 },
        { key: 'identificadorSensor', header: 'EUI', width: 20 },
        { key: 'nombreSensor', header: 'Nombre', width: 20 },
        { key: 'codigoPuntoMedicion', header: 'Punto Medicion', width: 20 },
        { key: 'parcela', header: 'Parcela', width: 30 },
        { key: 'finca', header: 'Finca', width: 30 },
        { key: 'estadoSensor', header: 'Estado', width: 20 },
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Reporte de Sensores" />
                <div className="content">
                <div className="filtro-container"></div>
                {apiData.length > 0 &&
                        <button onClick={() => exportToExcel({ reportName, data: apiData, columns, userName })} className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faFileExcel} style={{ color: "#0CF25D", fontSize: '27px' }} />                                
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