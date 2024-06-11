
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/Reportes.css'
import TableResponsive from "../../../components/table/tableReport.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerReporteEntradaSalidaTotal } from "../../../servicios/ServicioReporte.ts";
import { IoDocumentTextSharp, IoFilter } from "react-icons/io5";


function ReporteEntradasYSalidas() {

    // Estado para almacenar todos los usuarios asignados
    const [apiData, setApiData] = useState<any[]>([]);


    // Estado para el filtro por identificación de usuario

    const [montoGasto, setMontoGasto] = useState('');
    const [montoIngreso, setMontoIngreso] = useState('');
    const [montoBalance, setMontoBalance] = useState('');
    const [filtroInputInicio, setfiltroInputInicio] = useState('');
    const [filtroInputFin, setfiltroInputFin] = useState('');
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);

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

            // Agregar los totales al final del archivo
            const totalRow = ['Totales', '', '', montoIngreso, montoGasto, montoBalance];
            XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${apiData.length + 2}` }); // Agregar después de los datos

            // Crear un nuevo libro de Excel y agregar la hoja de cálculo
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');

            // Escribir el libro de Excel en un búfer
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

            // Obtener la fecha y hora formateadas para el nombre del archivo
            const formattedDateTime = getFormattedDateTime();

            // Crear el nombre del archivo con la fecha y hora
            const fileName = `reporte_entradas_salidas_${formattedDateTime}.xlsx`;

            // Crear un blob con los datos del búfer para descargar
            const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

            // Utilizar la función saveAs de file-saver para descargar el archivo con el nombre generado
            saveAs(dataBlob, fileName);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
        }
    };

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

    // Función para filtrar datos
    const filtrarDatos = async () => {


        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const formData = {
                fechaInicio: filtroInputInicio,
                fechaFin: filtroInputFin,
                idFinca: selectedFinca
            }

            if (idEmpresa) {
                const datos = await ObtenerReporteEntradaSalidaTotal(formData);
                // Calcular totales desde los datos obtenidos
                let gastoTotal = 0;
                let ingresoTotal = 0;
                let balanceTotal = 0;

                datos.forEach((item: any) => {
                    gastoTotal += item.montoGasto;
                    ingresoTotal += item.montoIngreso;
                });
                
                balanceTotal = ingresoTotal - gastoTotal;


                // Función para formatear números
                const formatearNumero = (numero: number) => {
                    return numero.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                // Crear nueva lista de datos con los totales formateados
                const datosConFormato = datos.map((item: any) => ({
                    ...item,
                    montoGastoFormateado: formatearNumero(item.montoGasto),
                    montoIngresoFormateado: formatearNumero(item.montoIngreso),
                    balanceFormateado: formatearNumero(item.balance)
                }));

                // Actualizar estado con los totales calculados
                setMontoGasto(formatearNumero(gastoTotal));
                setMontoIngreso(formatearNumero(ingresoTotal));
                setMontoBalance(formatearNumero(balanceTotal));

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
                const fincasResponse = await ObtenerFincas();

                const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresa));


                setFincas(fincasFiltradas);
            }

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };


    // Columnas de la tabla
    const columns = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'detallesCompraVenta', header: 'Detalles' },
        { key: 'tipo', header: 'Tipo' },
        { key: 'montoIngresoFormateado', header: 'Monto Ingreso' },
        { key: 'montoGastoFormateado', header: 'MontoGasto' },
        { key: 'balanceFormateado', header: 'Balance' },
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Reporte de Entradas y Salidas" />
                <div className="content">

                    <div className="filtro-container">
                        <div >
                            <label htmlFor="filtroFinca" >Filtrar por Finca:</label>
                            <select id="filtroFinca" value={selectedFinca || ''} onChange={handleFincaChange} className="form-select" >
                                <option value={''}>Todas las fincas</option>
                                {fincas.map(finca => (
                                    <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div >
                            <label htmlFor="filtroInicio">Fecha de Inicio:</label>
                            <input
                                type="date"
                                id="filtroInicio"
                                value={filtroInputInicio}
                                onChange={handleChangeFiltro}
                                className="form-control"
                            />
                        </div>
                        <div >
                            <label htmlFor="filtroFin">Fecha de Fin:</label>
                            <input
                                type="date"
                                id="filtroFin"
                                value={filtroInputFin}
                                onChange={handleChangeFiltro}
                                className="form-control"
                            />
                        </div>
                        <button onClick={filtrarDatos} className="btn-filtrar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IoFilter size={27} />
                            <span style={{ marginLeft: '5px' }}>Filtrar</span>
                        </button>
                        {apiData.length > 0 &&
                            <button onClick={exportToExcel} className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                                <IoDocumentTextSharp size={27} />
                                <span style={{ marginLeft: '5px' }}>Exportar</span>

                            </button>
                        }
                    </div>
                    {apiData.length > 0 &&
                        <TableResponsive columns={columns} data={apiData} totales={[montoIngreso, montoGasto, montoBalance]} />
                    }

                </div>
            </div>

        </Sidebar>
    )

}
export default ReporteEntradasYSalidas