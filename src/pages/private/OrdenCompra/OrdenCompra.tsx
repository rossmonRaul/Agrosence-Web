

/**
 * Página para el manejo de la orden de compra
 * Permite ver, filtrar y editar las ordenes de compra.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/tableDelete.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import CrearOrdenCompra from "../../../components/ordenCompra/InsertarOrdenCompra.tsx";

import { ObtenerUsuariosAsignados } from "../../../servicios/ServicioUsuario.ts"
import { CambiarEstadoOrdenDeCompra, ObtenerDatosOrdenDeCompra } from "../../../servicios/ServicioOrdenCompra.ts";
import EditarOrdenCompra from "../../../components/ordenCompra/EditarOrdenCompra.tsx";



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
        montoTotal: '',
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
    }, [filtroInput, ordenCompra]); // Ejecutar cada vez que el filtro o los datos originales cambien

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

    const obtenerDatosOrdenCompra= async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');
            const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });
            const datosOrdenCompra = await ObtenerDatosOrdenDeCompra();

            const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

            if (!usuarioActual) {
                console.error('No se encontró el usuario actual');
                return;
            }

            const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);
            
            // Filtrar con las parcelas del usuario actual
            const ordenCompraFiltradas = datosOrdenCompra.filter((ordenCompra: any) => {
                return parcelasUsuarioActual.includes(ordenCompra.idParcela);
            }).map((ordenCompra: any) => ({
                ...ordenCompra,
                sEstado: ordenCompra.estado === 1 ? 'Activo' : 'Inactivo',
            }));

            //debo de poner 2 arreglos aca para poder cargar la tabla siempre que se cambia
            // la palabra del input de filtro
            
            setOrdenCompra(ordenCompraFiltradas);
            setOrdenCompraFiltrados(ordenCompraFiltradas);
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de un Orden Compra
    const toggleStatus = async (ordenCompra: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar la Orden de Compra: "+ ordenCompra.numeroDeOrden +"  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idOrdenDeCompra: ordenCompra.idOrdenDeCompra, //aca revisar que si sea idOrdenCompra
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
        { key: 'fechaOrden', header: 'Fecha de Orden' },
        { key: 'fechaEntrega', header: 'Fecha de Entrega' },
        { key: 'productosAdquiridos', header: 'Producto Adquirido' },
        { key: 'cantidad', header: 'Cantidad' },
        { key: 'precioUnitario', header: 'Precio Unitario' },
        { key: 'montoTotal', header: 'Monto Total' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Sección de Orden de Compra" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalCrearOrdenCompra()} className="btn-crear">Crear Orden</button>
                    <div className="filtro-container">
                        <label htmlFor="filtroIdentificacion">Filtrar:</label>
                        <input
                            type="text"
                            id="filtroIdentificacion"
                            value={filtroInput}
                            onChange={handleChangeFiltro}
                            placeholder="Buscar por Finca, Parcela o Número de Orden"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={OrdenCompraFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>
            
            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Orden Compra"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* hay que modificar el nombre porque modifica mas datos */}
                        {/* <CambiarContrasenaAsignados */}
                        <EditarOrdenCompra
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idOrdenDeCompra={selectedDatos.idOrdenDeCompra}
                            numeroDeOrden={selectedDatos.numeroDeOrden}
                            fechaEntrega={selectedDatos.fechaEntrega}
                            fechaOrden={selectedDatos.fechaOrden}
                            productosAdquiridos={selectedDatos.productosAdquiridos}
                            cantidad={selectedDatos.cantidad.toString()}
                            proveedor={selectedDatos.proveedor}
                            precioUnitario={selectedDatos.precioUnitario}
                            montoTotal={selectedDatos.montoTotal}
                            observaciones={selectedDatos.observaciones}

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
                title="Crear Orden de Compra"
                onCancel={abrirCerrarModalCrearOrdenCompra}
            >
                <div className='form-container'>
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