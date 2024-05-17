

/**
 * Página para el manejo de la las Entradas y Salidas
 * Permite ver, filtrar y editar las entradas y salidas
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/tableDelete.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerUsuariosAsignados } from "../../../servicios/ServicioUsuario.ts"
import CrearEntradasSalidas from "../../../components/entradasysalidas/InsertarEntradaYSalida.tsx";
import EditarEntradaYSalida from "../../../components/entradasysalidas/EditarEntradaYSalida.tsx";
import { CambiarEstadoRegistroEntradaSalida, ObtenerRegistroEntradaSalida } from "../../../servicios/ServicioEntradaYSalida.ts";



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
        cantidad: 0,
        precioUnitario: '',
        montoTotal: '',
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
                datosTabla.finca.toLowerCase().includes(filtroInput.toLowerCase())
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

    const obtenerDatosEntradasYSalidas= async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');
            const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });
            const datosEntradasYSalidas = await ObtenerRegistroEntradaSalida();

            const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);
            
            if (!usuarioActual) {
                console.error('No se encontró el usuario actual');
                return;
            }

            const fincasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idFinca);
            
            // Filtrar con las parcelas del usuario actual
            const EntradasYSalidasFiltradas = datosEntradasYSalidas.filter((entradasYSalidas: any) => {
                return fincasUsuarioActual.includes(entradasYSalidas.idFinca);
            }).map((entradasYSalidas: any) => ({
                ...entradasYSalidas,
                sEstado: entradasYSalidas.estado === 1 ? 'Activo' : 'Inactivo',
            }));

            //debo de poner 2 arreglos aca para poder cargar la tabla siempre que se cambia
            // la palabra del input de filtro
            
            setEntradasYSalidas(EntradasYSalidasFiltradas);
            setEntradasYSalidasFiltrados(EntradasYSalidasFiltradas);
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de la entrada o salida
    const toggleStatus = async (entradasYSalidas: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar la entrada o salida: "+ entradasYSalidas.detallesCompraVenta +"  ?",
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
        { key: 'tipo', header: 'Tipo' },
        { key: 'detallesCompraVenta', header: 'Detalles' },
        { key: 'cantidad', header: 'Cantidad' },
        { key: 'precioUnitario', header: 'Precio Unitario (₡)' },
        { key: 'montoTotal', header: 'Monto Total (₡)'},
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Entradas y Salidas de la Finca" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalCrearEntradasYSalidas()} className="btn-crear">Crear Entrada o Salida</button>
                    <div className="filtro-container">
                        <label htmlFor="filtroIdentificacion">Filtrar:</label>
                        <input
                            type="text"
                            id="filtroIdentificacion"
                            value={filtroInput}
                            onChange={handleChangeFiltro}
                            placeholder="Buscar por Finca"
                            className="form-control"
                        />
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
                            idFinca={selectedDatos.idFinca}
                            idRegistroEntradaSalida={selectedDatos.idRegistroEntradaSalida}
                            tipo={selectedDatos.tipo}
                            fecha={selectedDatos.fecha}
                            detalles={selectedDatos.detallesCompraVenta}
                            cantidad={selectedDatos.cantidad}
                            precioUnitario={selectedDatos.precioUnitario}
                            montoTotal={selectedDatos.montoTotal}

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