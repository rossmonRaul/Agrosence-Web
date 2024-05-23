

/**
 * Página para el manejo de la flujo de caja
 * Permite ver, filtrar y editar las flujo caja.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/FlujoCaja.css'
import TableResponsive from "../../../components/table/tableDelete.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerRegistroSalidaPorFecha } from "../../../servicios/ServicioEntradaYSalida.ts";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";



/**
 * Componente funcional que representa la página de flujo de caja
 */
function FlujoCaja() {

    // Estado para almacenar todos los usuarios asignados
    const [flujoCaja, setflujoCaja] = useState<any[]>([]);


    // Estado para almacenar los datos filtrados
    const [flujoCajaFiltrados, setFlujoCajaFiltrados] = useState<any[]>([]);

    // Estado para el filtro por identificación de usuario

    const [filtroInputInicio, setfiltroInputInicio] = useState('');
    const [filtroInputFin, setfiltroInputFin] = useState('');
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);



    // Funciones para manejar el estado de los modales
    const openModal = () => {

    };

    // Función para exportar datos a Excel
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(flujoCajaFiltrados, { header: columns.map(col => col.key) });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');

        // Ajustar los encabezados
        XLSX.utils.sheet_add_aoa(ws, [columns.map(col => col.header)], { origin: 'A1' });

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        // Obtener la fecha actual en formato dd-mm-yyyy
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        // Nombrar el archivo con "Flujo de Caja" y la fecha actual
        const fileName = `Flujo de Caja ${formattedDate}.xlsx`;

        saveAs(dataBlob, fileName);
    };

    // Función para manejar cambios en la selección de finca
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        // Filtrar 
        const flujoCajaFiltradas = flujoCaja.filter((flujoCaja: any) => {
            return value.includes(flujoCaja.idFinca);
        }).map((ordenCompra: any) => ({
            ...ordenCompra,
        }));

        setFlujoCajaFiltrados(flujoCajaFiltradas);
    };


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'filtroInicio') {
            setfiltroInputInicio(value);
        } else if (id === 'filtroFin') {
            setfiltroInputFin(value);
        }
    };

    useEffect(() => {
        filtrarDatos();
    }, [selectedFinca, filtroInputInicio, filtroInputFin]); // Ejecutar cada vez que el filtro o los datos originales cambien


    // Función para formatear fecha dd/mm/yyyy a mm/dd/yyyy
    const formatDate = (inputDate: string | undefined) => {
        if (!inputDate) return null;
        const [day, month, year] = inputDate.split('/');
        return `${year}-${month}-${day}`;
    };

    // Función para filtrar datos
    const filtrarDatos = () => {

        // Convertir las fechas formateadas en objetos Date
        const fechaInicio = filtroInputInicio ? new Date(filtroInputInicio) : null;
        const fechaFin = filtroInputFin ? new Date(filtroInputFin) : null;

        const filteredData = flujoCaja.filter(item => {


            // Formatear fecha del flujo de caja sin modificar las fechas de entrada
            const fechaItemFormatted = formatDate(item.fecha);
            if (!fechaItemFormatted) {
                return false;
            }

            const fechaItem = new Date(fechaItemFormatted);

            // Comparar fechas formateadas
            const fechaInicioMatch = fechaInicio ? fechaItem >= fechaInicio : true;
            const fechaFinMatch = fechaFin ? fechaItem <= fechaFin : true;

            return fechaInicioMatch && fechaFinMatch;
        });

        // Filtrar por finca si está seleccionada
        if (selectedFinca) {
            // Filtrar 
            const filteredDataConFinca = filteredData.filter((flujoCaja: any) => {
                return selectedFinca.includes(flujoCaja.idFinca);
            }).map((ordenCompra: any) => ({
                ...ordenCompra,
            }));
            setFlujoCajaFiltrados(filteredDataConFinca);
        } else {
            setFlujoCajaFiltrados(filteredData);
        }

    };



    useEffect(() => {
        obtenerDatosFlujoCaja();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosFlujoCaja = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');

            const datosFlujoCaja = await ObtenerRegistroSalidaPorFecha();

            if (idEmpresa) {
                const fincasResponse = await ObtenerFincas();
                const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresa));
                
                // Extraer los identificadores de finca
                const idsFincasFiltradas = fincasFiltradas.map((finca: any) => finca.idFinca);

                // Filtrar 
                const flujoCajaFiltradas = datosFlujoCaja.filter((flujoCaja: any) => {
                    return idsFincasFiltradas.includes(flujoCaja.idFinca);
                }).map((ordenCompra: any) => ({
                    ...ordenCompra,
                }));

                setFincas(fincasFiltradas);
                setflujoCaja(flujoCajaFiltradas);
            }

        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };

    const toggleStatus = async () => {

    };

    // Columnas de la tabla
    const columns = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'finca', header: 'Finca' },
        { key: 'tipo', header: 'Tipo' },
        { key: 'detallesCompraVenta', header: 'Detalles' },
        { key: 'precioUnitario', header: 'Precio Unitario' },
        { key: 'cantidad', header: 'Cantidad' },
        { key: 'montoTotal', header: 'Monto Total' },
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Flujo de caja" />
                <div className="content">

                    <div className="filtro-container">
                        <div className="filtro-item">
                            <label htmlFor="filtroFinca" className="form-label">Filtrar por Finca:</label>
                            <select id="filtroFinca" value={selectedFinca || ''} onChange={handleFincaChange} className="form-select" >
                                <option value={''}>Todas las fincas</option>
                                {fincas.map(finca => (
                                    <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filtro-item">
                            <label htmlFor="filtroInicio">Fecha de Inicio:</label>
                            <input
                                type="date"
                                id="filtroInicio"
                                value={filtroInputInicio}
                                onChange={handleChangeFiltro}
                                className="form-control"
                            />
                        </div>
                        <div className="filtro-item">
                            <label htmlFor="filtroFin">Fecha de Fin:</label>
                            <input
                                type="date"
                                id="filtroFin"
                                value={filtroInputFin}
                                onChange={handleChangeFiltro}
                                className="form-control"
                            />
                        </div>

                        <button onClick={exportToExcel} className="btn-importar">Exportar</button>
                    </div>

                    <TableResponsive columns={columns} data={flujoCajaFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

        </Sidebar>
    )

}
export default FlujoCaja