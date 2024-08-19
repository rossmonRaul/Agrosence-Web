
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/Reportes.css'
import TableResponsive from "../../../components/table/tableReport.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerReporteSalidaTotal } from "../../../servicios/ServicioReporte.ts";
import { IoFilter } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import { exportToExcel } from '../../../utilities/exportReportToExcel.ts';



function ReporteEntradas() {

    // Estado para almacenar todos los usuarios asignados
    const [apiData, setApiData] = useState<any[]>([]);


    // Estado para el filtro por identificación de usuario


    const [montoGasto, setMontoGasto] = useState('');
    const [filtroInputInicio, setfiltroInputInicio] = useState('');
    const [filtroInputFin, setfiltroInputFin] = useState('');
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);

    // Función para manejar cambios en la selección de finca
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
    };


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'filtroInicio') {
            setfiltroInputInicio(value);
        } else if (id === 'filtroFin') {
            setfiltroInputFin(value);
        }
    };

    // Función para validar las fechas
    const validarFechas = () => {
        const fechaInicio = new Date(filtroInputInicio).getTime();
        const fechaFin = new Date(filtroInputFin).getTime();
        const hoy = new Date().setHours(0, 0, 0, 0);

        if (fechaInicio > hoy) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La fecha de inicio no puede ser mayor que hoy.'
            });
            return false;
        }

        if (fechaInicio > fechaFin) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La fecha de inicio no puede ser mayor que la fecha de fin.'
            });
            return false;
        }

        if (fechaFin > hoy) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La fecha de fin no puede ser mayor que hoy.'
            });
            return false;
        }

        return true;
    };


    // Función para filtrar datos
    const filtrarDatos = async () => {


        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const formData = {
                fechaInicio: filtroInputInicio,
                fechaFin: filtroInputFin,
                idFinca: selectedFinca || '0',
                idEmpresa:  idEmpresa
            }

            if (!validarFechas()) {
                return;
            }


            if (idEmpresa) {
                const datos = await ObtenerReporteSalidaTotal(formData);

                // Calcular totales desde los datos obtenidos
                let gastoTotal = 0;

                datos.forEach((item: any) => {
                    gastoTotal += item.montoGasto;
                });

                // Función para formatear números
                const formatearNumero = (numero: number) => {
                    return numero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                // Crear nueva lista de datos con los totales formateados
                const datosConFormato = datos.map((item: any) => ({
                    ...item,
                    montoGastoFormateado: formatearNumero(item.montoGasto),

                }));

                // Actualizar estado con los totales calculados
                setMontoGasto(formatearNumero(gastoTotal));

                // Actualizar datos de la tabla
                setApiData(datosConFormato);
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }


    };



    useEffect(() => {
        obtenerDatos();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatos = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');

            if (idEmpresa) {
                const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                setFincas(fincasResponse);
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };


    // Columnas de la tabla
    const columns = [
        { key: 'fecha', header: 'Fecha', width: 10},
        { key: 'finca', header: 'Finca' , width: 20 },
        { key: 'detallesCompraVenta', header: 'Detalles' , width: 60},
        { key: 'tipo', header: 'Tipo', width: 10 },
        { key: 'montoGastoFormateado', header: 'Monto Gasto' , width: 15},
    ];

    const handleExport = () => {
        const nombreUsuario  = localStorage.getItem('nombreUsuario') || 'Usuario';
        const reportName = "Reporte de Salidas";
        exportToExcel({
            reportName,
            data: apiData,
            columns,
            userName: nombreUsuario,
            totales: ['Totales', '','', '', montoGasto]
        });
    };

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Reporte de Salidas" />
                <div className="content">
                    <div className="filtro-container" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div className="filtro-item" style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <div className="filtro-item" style={{ flexGrow: 0, display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                                <label htmlFor="filtroFinca" >Finca:</label>
                                <select 
                                id="filtroFinca" 
                                value={selectedFinca || ''} 
                                onChange={handleFincaChange} 
                                style={{ height: '45px', fontSize: '16px', padding: '10px', minWidth: '200px' }}
                                className="form-select" >
                                    <option value={''}>Todas las fincas</option>
                                    {fincas.map(finca => (
                                        <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filtro-item" style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                                <label htmlFor="filtroInicio">Fecha de Inicio:</label>
                                <input
                                    type="date"
                                    id="filtroInicio"
                                    value={filtroInputInicio}
                                    onChange={handleChangeFiltro}
                                    style={{ fontSize: '16px', padding: '10px', minWidth: '200px' }}
                                    className="form-control"
                                />
                            </div>
                            <div className="filtro-item" style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="filtroFin">Fecha de Fin:</label>
                                <input
                                    type="date"
                                    id="filtroFin"
                                    value={filtroInputFin}
                                    onChange={handleChangeFiltro}
                                    style={{ fontSize: '16px', padding: '10px', minWidth: '200px' }}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <button onClick={filtrarDatos} className="btn-filtrar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '10px' }}>
                            <IoFilter size={27} />
                            <span style={{ marginLeft: '5px' }}>Filtrar</span>
                        </button>
                        {apiData.length > 0 &&
                            <button onClick={handleExport} className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                            <FontAwesomeIcon icon={faFileExcel} style={{ color: "#0CF25D", fontSize: '27px' }} />                                
                            <span style={{ marginLeft: '5px' }}>Exportar</span>

                            </button>
                        }
                    </div>
                    {apiData.length > 0 &&
                        <TableResponsive columns={columns} data={apiData} totales={[montoGasto]} />

                    }
                </div>
            </div>

        </Sidebar>
    )

}
export default ReporteEntradas