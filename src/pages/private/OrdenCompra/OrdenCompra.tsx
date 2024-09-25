

/**
 * Página para el manejo de la orden de compra
 * Permite ver, filtrar y editar las ordenes de compra.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/OrdenCompra.css'
import TableResponsive from "../../../components/table/tableDelete.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import CrearOrdenCompra from "../../../components/ordenCompra/InsertarOrdenCompra.tsx";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { CambiarEstadoOrdenDeCompra, ObtenerDatosOrdenDeCompra, ObtenerDetallesOrdenDeCompraExportar } from "../../../servicios/ServicioOrdenCompra.ts";
import EditarOrdenCompra from "../../../components/ordenCompra/EditarOrdenCompra.tsx";
import { IoAddCircleOutline, IoDocumentTextSharp } from "react-icons/io5";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";


interface DetalleOrdenCompra {
    id: string;
    idOrdenDeCompra: string;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    iva: number;
    total: number;
}


/**
 * Componente funcional que representa la página de orden de compra
 */
function OrdenCompra() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de creacion de usuarios
    const [modalCrearOrdenCompra, setModalCrearOrdenCompra] = useState(false);
    // Estado para almacenar la información del usuario seleccionado
    // Estado para almacenar todos los usuarios asignados
    const [ordenCompra, setOrdenCompra] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [OrdenCompraFiltrados, setOrdenCompraFiltrados] = useState<any[]>([]);

    // Estado para el filtro por identificación de usuario
    const [filtroInput, setfiltroInput] = useState('');

    //puede que falten cambios a los datos seleccionados
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: 0,
        idParcela: 0,
        idOrdenDeCompra: 0,
        numeroDeOrden: '',
        fechaOrden: '',
        fechaEntrega: '',
        cantidad: 0,
        proveedor: '',
        productosAdquiridos: '',
        precioUnitario: '',
        total: '',
        observaciones: '',
        finca: '',
        parcela: '',
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    // Modal para crear la medicion
    const abrirCerrarModalCrearOrdenCompra = () => {
        setModalCrearOrdenCompra(!modalCrearOrdenCompra);
    }

    const handleAgregarMedicion = async () => {
        // Lógica para agregar la medicion
        // Después de agregar la medicion se vuelven a cargar los datos
        await obtenerDatosOrdenCompra();
        abrirCerrarModalCrearOrdenCompra();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [filtroInput, ordenCompra]);

    // Función para exportar datos a Excel
    const exportToExcel = async () => {
        const idsOrdenCompra = OrdenCompraFiltrados.map(item => item.idOrdenDeCompra).join(',');

        // Obtener los detalles de la orden de compra
        const detallesOrdenCompra: DetalleOrdenCompra[] = await ObtenerDetallesOrdenDeCompraExportar({ ListaIdsExportar: idsOrdenCompra });


        // Definir las columnas y sus encabezados
        const columns = [
            { key: 'idOrdenDeCompra', header: 'Numero de Orden' },
            { key: 'idDetalleOrdenDeCompra', header: 'ID Detalle' },
            { key: 'producto', header: 'Nombre del Producto' },
            { key: 'cantidad', header: 'Cantidad' },
            { key: 'precioUnitario', header: 'Precio Unitario' },
            { key: 'iva', header: 'IVA' },
            { key: 'total', header: 'Total' },

        ];

        // Filtrar los detalles para excluir el campo 'id'
        const detallesFiltrados = detallesOrdenCompra.map(({ id, ...rest }: DetalleOrdenCompra) => rest);

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
        const fileName = `Orden de Compra ${formattedDate}.xlsx`;

        saveAs(dataBlob, fileName);
    };

    // Función para filtrar cada vez que cambie el filtro 
    const filtrarDatos = () => {
        const datosFiltrados = filtroInput
            ? ordenCompra.filter((datosTabla: any) =>
                datosTabla.finca.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.parcela.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.numeroDeOrden.toLowerCase().includes(filtroInput.toLowerCase())
            )
            : ordenCompra;
        setOrdenCompraFiltrados(datosFiltrados);
    };


    const abrirCerrarModalEditar = () => {

        setModalEditar(!modalEditar);
    }

    const handleEditarOrdenCompra = async () => {

        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerDatosOrdenCompra();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosOrdenCompra();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosOrdenCompra = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const datosOrdenCompra = await ObtenerDatosOrdenDeCompra();

            
            if (idEmpresa) {
                const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresa));

                // Extraer los identificadores de finca
                const idsFincasFiltradas = fincasFiltradas.map((finca: any) => finca.idFinca)

                // Filtrar con las parcelas del usuario actual
                const ordenCompraFiltradas = datosOrdenCompra.filter((ordenCompra: any) => {
                    return idsFincasFiltradas.includes(ordenCompra.idFinca);
                }).map((ordenCompra: any) => ({
                    ...ordenCompra,
                    sEstado: ordenCompra.estado === 1 ? 'Activo' : 'Inactivo',
                }));


                //debo de poner 2 arreglos aca para poder cargar la tabla siempre que se cambia
                // la palabra del input de filtro

                setOrdenCompra(ordenCompraFiltradas);
                setOrdenCompraFiltrados(ordenCompraFiltradas);
            }
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de un Orden Compra
    const toggleStatus = async (ordenCompra: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar la Orden de Compra: " + ordenCompra.numeroDeOrden + "  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        IdOrdenDeCompra: ordenCompra.idOrdenDeCompra,
                    };

                    const resultado = await CambiarEstadoOrdenDeCompra(datos);


                    if (parseInt(resultado.indicador) === 1) {
                        await obtenerDatosOrdenCompra();
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
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
        { key: 'numeroDeOrden', header: 'Numero de orden' },
        { key: 'finca', header: 'Finca' },
        { key: 'fechaOrden', header: 'Fecha de Orden' },
        { key: 'fechaEntrega', header: 'Fecha de Entrega' },
        { key: 'observaciones', header: 'Observaciones' },
        { key: 'proveedor', header: 'Proveedor' },
        { key: 'total', header: 'Monto Total' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Sección de Orden de Compra" />
                <div className="content">
                    <div className="filtro-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ flexGrow: 1 }}>

                            <label htmlFor="filtroIdentificacion">Número de orden o finca:</label>
                            <input
                                type="text"
                                id="filtroIdentificacion"
                                value={filtroInput}
                                onChange={handleChangeFiltro}
                                placeholder="Número de orden o finca"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px' }}
                                className="form-control"
                            />

                        </div>
                        <button onClick={() => abrirCerrarModalCrearOrdenCompra()} className="btn-crear-style" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '10px',backgroundColor: '#548454', color: 'white', borderColor: '#548454' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear orden de compra</span>
                        </button>
                        <button onClick={exportToExcel} className="btn-exportar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '10px' }}>

                            <IoDocumentTextSharp size={27} />
                            <span style={{ marginLeft: '5px' }}>Exportar</span>

                        </button>
                    </div>
                    <TableResponsive columns={columns} data={OrdenCompraFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar orden de compra"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container' style={{  width: '90%' }}>
                    <div className='form-group'>
                        {/* hay que modificar el nombre porque modifica mas datos */}
                        {/* <CambiarContrasenaAsignados */}
                        <EditarOrdenCompra
                            idFinca={selectedDatos.idFinca.toString()}
                            idParcela={selectedDatos.idParcela.toString()}
                            idOrdenDeCompra={selectedDatos.idOrdenDeCompra}
                            numeroDeOrden={selectedDatos.numeroDeOrden}
                            fechaEntrega={selectedDatos.fechaEntrega}
                            fechaOrden={selectedDatos.fechaOrden}
                            total={selectedDatos.total}
                            observaciones={selectedDatos.observaciones}
                            proveedor={selectedDatos.proveedor}

                            //aqui agregas las props que ocupa que reciba el componente, (todos los datos para editar)
                            onEdit={handleEditarOrdenCompra}
                        />
                    </div>
                </div>
            </Modal>

            {/* modal para crear medicion */}
            <Modal
                isOpen={modalCrearOrdenCompra}
                toggle={abrirCerrarModalCrearOrdenCompra}
                title="Crear orden de compra"
                onCancel={abrirCerrarModalCrearOrdenCompra}
            >
                <div className='form-container' style={{  width: '90%' }}>
                    <div className='form-group'>
                        <CrearOrdenCompra
                            onAdd={handleAgregarMedicion}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default OrdenCompra