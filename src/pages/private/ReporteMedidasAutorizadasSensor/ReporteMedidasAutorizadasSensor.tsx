import { useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/Reportes.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerReporteMedidasAutorizadasSensor } from "../../../servicios/ServicioReporte.ts";
import { IoFilter } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { exportToExcel } from '../../../utilities/exportReportToExcel.ts';
import Swal from 'sweetalert2';
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerParcelas } from '../../../servicios/ServicioParcelas';
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../../../img/AGROSENSER.png';

function formatFecha(pFecha: string) {
    const fecha = new Date(pFecha);
    
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    
    const hora = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    const seg = String(fecha.getSeconds()).padStart(2, '0');
    
    return `${dia}/${mes}/${anio} ${hora}:${min}:${seg}`;
}

function ReporteMedidasAutorizadasSensor() {    

    const [filtroInputInicio, setfiltroInputInicio] = useState('');
    const [filtroInputFin, setfiltroInputFin] = useState('');
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);
    const [parcelas, setParcelas] = useState<any[]>([]);

    // Estado para almacenar todos los usuarios asignados
    const [apiData, setApiData] = useState<any[]>([]);

    // Función para manejar cambios en la selección de finca
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        obtenerParcelas(parseInt(value));
    };

    // Función para manejar cambios en la selección de parcela
    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
    };

    // Función para validar las fechas
    const validarFechas = () => {
        const fechaInicio = new Date(filtroInputInicio).getTime();
        const fechaFin = new Date(filtroInputFin).getTime();
        const hoy = new Date().setHours(0, 0, 0, 0);

        if(!fechaInicio || !fechaFin){
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ingrese las fechas para realizar la búsqueda'
            });
            return false;
        }


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

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'filtroInicio') {
            setfiltroInputInicio(value);
        } else if (id === 'filtroFin') {
            setfiltroInputFin(value);
        }
    };

    // Función para filtrar datos
    const obtenerRegistros = async () => {
        try {

            // Se resetea la tabla
            setApiData([]);

            const dataSend = {
                idFinca: selectedFinca === "" ? 0 : selectedFinca,
                idParcela: selectedParcela === "" ? null : selectedParcela,
                idEmpresa: localStorage.getItem('empresaUsuario'),
                fechaInicio: filtroInputInicio,
                fechaFin: filtroInputFin
            }

            if (!validarFechas()) {
                return;
            }

            const datos = await ObtenerReporteMedidasAutorizadasSensor(dataSend);

            if(datos.length < 1){
                Swal.fire({
                    icon: 'warning',
                    text: 'No se encontraron registros con los parámetros ingresados'
                });
                return;
            }

            let datosN: any = [];

            datos.forEach((element: { fecha: string; }) => {   

                element.fecha = formatFecha(element.fecha);

                datosN.push(element)
            });

            // Actualizar datos de la tabla
            setApiData(datosN);
        } catch (error) {            
            console.error('Error al obtener los datos:', error);
        }
    };

    useEffect(() => {
        obtenerFincas();
        obtenerParcelas();
    }, []);

    const obtenerFincas = async () => {
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

    const obtenerParcelas = async (idFinca?: number) => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa?idEmpresa:"0"));

            if(idFinca)
                setParcelas(parcelasResponse.filter((x: { idFinca: number; }) => x.idFinca === idFinca));
            else
                setParcelas(parcelasResponse);
        } catch (error) {
            console.error('Error al obtener las parcelas:', error);
        }
    };

    const convertirImagenABase64 = (ruta:any):Promise<string> => {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                const reader = new FileReader();
                reader.onloadend = function () {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', ruta);
            xhr.responseType = 'blob';
            xhr.send();
        });
    };

    // Función para obtener la fecha y hora formateadas
    const getFormattedDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
    
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text("Mediciones Autorizadas de Sensor", 60, 10);
    
        const imgBase64 = await convertirImagenABase64(logo);
        const imgWidth = 30;
        const imgHeight = 30;
    
        doc.addImage(imgBase64, 'PNG', 170, -5, imgWidth, imgHeight);
    
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Usuario: " + userName, 14, 25);
    
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Fecha: " + getFormattedDateTime().slice(0, -9), 165, 25);
    
        autoTable(doc, {
          startY: 30,
          columns: [
            { key: 'euiSensor', header: 'EUI Sensor' },
            { key: 'nombreSensor', header: 'Nombre de Sensor' },
            { key: 'puntoMedicion', header: 'Punto de Medición' },
            { key: 'parcela', header: 'Parcela' },
            { key: 'finca', header: 'Finca' },
            { key: 'idMedicion', header: 'ID Medición' },
            { key: 'nombreMedicion', header: 'Nombre Medición' },
            { key: 'unidadMedida', header: 'Unidad Medida' },
            { key: 'nomenclatura', header: 'Nomenclatura' },
            { key: 'valor', header: 'Valor' },
            { key: 'fecha', header: 'Fecha' },
            { key: 'alerta', header: 'Alerta' }
          ],
          headStyles: { fillColor: [84, 132, 84], halign: 'center', valign: 'middle' },
          body: apiData,
          columnStyles: {
            euiSensor: { cellWidth: 'auto' },
            nombreSensor: { cellWidth: 'auto' },
            puntoMedicion: { cellWidth: 'auto' },
            parcela: { cellWidth: 'auto' },
            finca: { cellWidth: 'auto' },
            idMedicion: { cellWidth: 'auto' },
            nombreMedicion: { cellWidth: 'auto' },
            unidadMedida: { cellWidth: 'auto' },
            nomenclatura: { cellWidth: 'auto' },
            valor: { cellWidth: 'auto' },
            fecha: { cellWidth: 'auto' },
            alerta: { cellWidth: 'auto' }
          },
          styles: {fontSize: 5, halign: 'center', valign: 'middle'}
        });
    
        doc.save("MedidasAutorizadasSensor.pdf");
      };    

    // Columnas de la tabla
    const columns = [
        { key: 'euiSensor', header: 'EUI Sensor', width: 15 },
        { key: 'nombreSensor', header: 'Nombre de Sensor', width: 20 },
        { key: 'puntoMedicion', header: 'Punto de Medición', width: 25 },
        { key: 'parcela', header: 'Parcela', width: 25 },
        { key: 'finca', header: 'Finca', width: 25 },
        { key: 'idMedicion', header: 'ID Medición', width: 15 },
        { key: 'nombreMedicion', header: 'Nombre Medición', width: 45 },
        { key: 'unidadMedida', header: 'Unidad Medida', width: 20 },
        { key: 'nomenclatura', header: 'Nomenclatura', width: 15 },
        { key: 'valor', header: 'Valor', width: 15 },
        { key: 'fecha', header: 'Fecha', width: 20 },
        { key: 'alerta', header: 'Alerta', width: 35 }
    ];

    const reportName = "Reporte Medidas Autorizadas de Sensor";
    const userName = localStorage.getItem('nombreUsuario') || 'Usuario';

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Reporte Medidas Autorizadas de Sensor" />
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
                            <label htmlFor="filtroParcela" >Filtrar por Parcela:</label>
                            <select id="filtroParcela" value={selectedParcela || ''} onChange={handleParcelaChange} className="form-select">
                                <option value={''}>Todas las parcelas</option>
                                {parcelas.map(p => (
                                    <option key={p.idParcela} value={p.idParcela}>{p.nombre}</option>
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
                        <button onClick={obtenerRegistros} className="btn-filtrar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IoFilter size={27} />
                            <span style={{ marginLeft: '5px' }}>Filtrar</span>
                        </button>
                        {apiData.length > 0 && (
                            <>
                                <button onClick={() => generatePDF()} className="btn-exportar" style={{ display: "flex", justifyContent: "center", alignItems: "center",}}>
                                
                                <FontAwesomeIcon icon={faFilePdf} style={{ color: "#0CF25D", fontSize: "27px" }} />
                                <span style={{ marginLeft: "5px" }}>Imprimir</span>
                                </button>
                                
                                <button onClick={() => exportToExcel({ reportName, data: apiData, columns, userName })}  className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                                <FontAwesomeIcon icon={faFileExcel} style={{ color: "#0CF25D", fontSize: '27px' }} />                                
                                <span style={{ marginLeft: '5px' }}>Exportar</span>

                                </button>
                            </>
                        )                        
                        }                        
                    </div>
                    <br />
                    {apiData.length > 0 &&
                        <TableResponsive columns={columns} data={apiData} itemsPerPage={10}/>
                    }
                </div>
            </div>

        </Sidebar>
    )

}
export default ReporteMedidasAutorizadasSensor;