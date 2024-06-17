

/**
 * Página para el manejo de la las Entradas y Salidas
 * Permite ver, filtrar y editar las entradas y salidas
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import TableResponsive from "../../../components/table/tableDelete.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import '../../../css/EntradaYSalida.css'
import Topbar from "../../../components/topbar/Topbar.tsx";
import CrearEntradasSalidas from "../../../components/entradasysalidas/InsertarEntradaYSalida.tsx";
import EditarEntradaYSalida from "../../../components/entradasysalidas/EditarEntradaYSalida.tsx";
import { CambiarEstadoRegistroEntradaSalida, ObtenerDetallesRegistroEntradaSalidaExportar, ObtenerRegistroEntradaSalida } from "../../../servicios/ServicioEntradaYSalida.ts";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { IoAddCircleOutline, IoDocumentTextSharp } from "react-icons/io5";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";

interface DetalleEntradasSalidas {
    id: string;
    Producto: string;
    cantidad: string;
    PrecioUnitario: string;
    Total: string;
    iva: string;
}
/**
 * Componente funcional que representa la página de entradas y salidas
 */
function EntradasYSalidas() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de creacion de usuarios
    const [modalCrearEntradasYSalidas, setModalCrearEntradasYSalidas] = useState(false);
    // Estado para almacenar la información del usuario seleccionado
    // Estado para almacenar todos los usuarios asignados
    const [entradasYSalidas, setEntradasYSalidas] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [EntradasYSalidasFiltrados, setEntradasYSalidasFiltrados] = useState<any[]>([]);

    // Estado para el filtro por identificación de usuario
    const [filtroInput, setfiltroInput] = useState('');

    //puede que falten cambios a los datos seleccionados
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: 0,
        idRegistroEntradaSalida: 0,
        fecha: '',
        tipo: '',
        detallesCompraVenta: '',
        total: '',
        finca: '',
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    // Modal para crear la medicion
    const abrirCerrarModalCrearEntradasYSalidas = () => {
        setModalCrearEntradasYSalidas(!modalCrearEntradasYSalidas);
    }

    const handleAgregarEntradasYSalidas = async () => {
        // Lógica para agregar
        // Después de agregar se vuelven a cargar los datos
        await obtenerDatosEntradasYSalidas();
        abrirCerrarModalCrearEntradasYSalidas();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [filtroInput, entradasYSalidas]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para filtrar cada vez que cambie el filtro 
    const filtrarDatos = () => {
        const datosFiltrados = filtroInput
            ? entradasYSalidas.filter((datosTabla: any) =>
                datosTabla.finca.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.fecha.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.tipo.toLowerCase().includes(filtroInput.toLowerCase())
            )
            : entradasYSalidas;
        setEntradasYSalidasFiltrados(datosFiltrados);
    };


    const abrirCerrarModalEditar = () => {

        setModalEditar(!modalEditar);
    }

    const handleEditarEntradasYSalidas = async () => {

        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerDatosEntradasYSalidas();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosEntradasYSalidas();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosEntradasYSalidas = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const datosEntradasYSalidas = await ObtenerRegistroEntradaSalida();
            const fincasResponse = await ObtenerFincas();
            if (idEmpresa) {
                const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresa));

                // Extraer los identificadores de finca
                const idsFincasFiltradas = fincasFiltradas.map((finca: any) => finca.idFinca);
                
                // Filtrar con las parcelas del usuario actual
                const EntradasYSalidasFiltradas = datosEntradasYSalidas.filter((entradasYSalidas: any) => {
                    return idsFincasFiltradas.includes(entradasYSalidas.idFinca);
                }).map((entradasYSalidas: any) => ({
                    ...entradasYSalidas,
                    sEstado: entradasYSalidas.estado === 1 ? 'Activo' : 'Inactivo',
                }));

                //debo de poner 2 arreglos aca para poder cargar la tabla siempre que se cambia
                // la palabra del input de filtro

                setEntradasYSalidas(EntradasYSalidasFiltradas);
                setEntradasYSalidasFiltrados(EntradasYSalidasFiltradas);
            }

        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de la entrada o salida
    const toggleStatus = async (entradasYSalidas: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar la entrada o salida: " + entradasYSalidas.detallesCompraVenta + "  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idRegistroEntradaSalida: entradasYSalidas.idRegistroEntradaSalida, //aca revisar que si sea idOrdenCompra
                    };

                    const resultado = await CambiarEstadoRegistroEntradaSalida(datos);

                    if (parseInt(resultado.indicador) === 1) {
                        await obtenerDatosEntradasYSalidas();
                        Swal.fire({
                            icon: 'success',
                            title: '¡Se eliminó! ',
                            text: 'Actualización exitosa.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado", "", "error");
                }
            }
        });
    };



    // Columnas de la tabla
    const columns = [
        { key: 'fecha', header: 'Fecha' },
        { key: 'finca', header: 'Finca' },
        { key: 'tipo', header: 'Tipo' },
        { key: 'detallesCompraVenta', header: 'Detalles' },
        { key: 'total', header: 'Total' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    // Función para exportar datos a Excel
    const exportToExcel = async () => {
        const idsEntradasYSalidas = EntradasYSalidasFiltrados.map(item => item.idRegistroEntradaSalida).join(',');

        // Obtener los detalles de las entradas y salidas
        const detallesEntradasYSalidas: DetalleEntradasSalidas[] = await ObtenerDetallesRegistroEntradaSalidaExportar({ ListaIdsExportar: idsEntradasYSalidas });
        // Definir las columnas y sus encabezados
        const columns = [
            { key: 'idRegistroEntradaSalida', header: 'Numero de Orden' },
            { key: 'idDetalleRegistroEntradaSalida', header: 'ID Detalle' },
            { key: 'producto', header: 'Nombre del Producto' },
            { key: 'cantidad', header: 'Cantidad' },
            { key: 'precioUnitario', header: 'Precio Unitario' },
            { key: 'iva', header: 'IVA' },
            { key: 'total', header: 'Total' },

        ];

        // Filtrar los detalles para excluir el campo 'id'
        const detallesFiltrados = detallesEntradasYSalidas.map(({ id, ...rest }: DetalleEntradasSalidas) => rest);

        // Crear la hoja de cálculo con las claves como encabezados
        const ws = XLSX.utils.json_to_sheet(detallesFiltrados, { header: columns.map(col => col.key) });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');

        // Ajustar los encabezados
        XLSX.utils.sheet_add_aoa(ws, [columns.map(col => col.header)], { origin: 'A1' });

        // Generar el buffer de Excel
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        // Obtener la fecha actual en formato dd-mm-yyyy
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        // Nombrar el archivo con "Orden de compra" y la fecha actual
        const fileName = `Entradas y Salidas ${formattedDate}.xlsx`;

        saveAs(dataBlob, fileName);
    };



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Entradas y Salidas de la Finca" />
                <div className="content">
                    <div className="filtro-container">
                        <div className="filtro-item">

                            <label htmlFor="filtroIdentificacion">Filtrar:</label>
                            <input
                                type="text"
                                id="filtroIdentificacion"
                                value={filtroInput}
                                onChange={handleChangeFiltro}
                                placeholder="Finca, fecha o tipo"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px' }}
                                className="form-control"
                            />

                        </div>
                        <button onClick={() => abrirCerrarModalCrearEntradasYSalidas()} className="btn-crear-style" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear Registro</span>
                        </button>
                        <button onClick={exportToExcel} className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                            <IoDocumentTextSharp size={27} />
                            <span style={{ marginLeft: '5px' }}>Exportar</span>

                        </button>
                    </div>
                    <TableResponsive columns={columns} data={EntradasYSalidasFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Entrada o Salida"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>

                        <EditarEntradaYSalida
                            idFinca={selectedDatos.idFinca.toString()}
                            idRegistroEntradaSalida={selectedDatos.idRegistroEntradaSalida}
                            tipo={selectedDatos.tipo}
                            fecha={selectedDatos.fecha}
                            detallesCompraVenta={selectedDatos.detallesCompraVenta}
                            total={selectedDatos.total}

                            //aqui agregas las props que ocupa que reciba el componente, (todos los datos para editar)
                            onEdit={handleEditarEntradasYSalidas}
                        />
                    </div>
                </div>
            </Modal>

            {/* modal para crear medicion */}
            <Modal
                isOpen={modalCrearEntradasYSalidas}
                toggle={abrirCerrarModalCrearEntradasYSalidas}
                title="Crear entrada o salida"
                onCancel={abrirCerrarModalCrearEntradasYSalidas}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearEntradasSalidas
                            onAdd={handleAgregarEntradasYSalidas}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default EntradasYSalidas