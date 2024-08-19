

/**
 * Página para el manejo de la mano obra
 * Permite ver, filtrar y editar las mano obra
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/tableDelete.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import CrearManoObra from "../../../components/manoObra/InsertarManoObra.tsx";
import { CambiarEstadoRegistroManoObra, ObtenerDatosRegistroManoObra } from "../../../servicios/ServicioManoObra.ts";
import EditarManoObra from "../../../components/manoObra/EditarManoObra.tsx";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { IoAddCircleOutline } from "react-icons/io5";



/**
 * Componente funcional que representa la página de mano obra
 */
function ManoObra() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de creacion de usuarios
    const [modalCrearManoObra, setModalCrearManoObra] = useState(false);
    // Estado para almacenar la información del usuario seleccionado
    // Estado para almacenar todos los usuarios asignados
    const [manoObra, setmanoObra] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [manoObraFiltrados, setManoObraFiltrados] = useState<any[]>([]);

    // Estado para el filtro por identificación de usuario
    const [filtroInput, setfiltroInput] = useState('');



    //puede que falten cambios a los datos seleccionados
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: 0,
        idRegistroManoObra: 0,
        actividad: '',
        fecha: '',
        trabajador: '',
        identificacion: '',
        horasTrabajadas: 0,
        pagoPorHora: '',
        totalPago: '',
        finca: ''
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    // Modal para crear la medicion
    const abrirCerrarModalCrearManoObra = () => {
        setModalCrearManoObra(!modalCrearManoObra);
    }

    const handleAgregarMedicion = async () => {
        // Lógica para agregar la medicion
        // Después de agregar la medicion se vuelven a cargar los datos
        await obtenerDatosManoObra();
        abrirCerrarModalCrearManoObra();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [filtroInput, manoObra]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para filtrar cada vez que cambie el filtro 
    const filtrarDatos = () => {
        const datosFiltrados = filtroInput
            ? manoObra.filter((datosTabla: any) =>
                datosTabla.finca.toLowerCase().includes(filtroInput.toLowerCase())
            )
            : manoObra;
        setManoObraFiltrados(datosFiltrados);
    };


    const abrirCerrarModalEditar = () => {

        setModalEditar(!modalEditar);
    }

    const handleEditarManoObra = async () => {

        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerDatosManoObra();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosManoObra();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosManoObra = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const datosManoObra = await ObtenerDatosRegistroManoObra();
            if (idEmpresa) {
                const fincasResponse = await ObtenerFincas();
                const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresa));

                // Extraer los identificadores de finca
                const idsFincasFiltradas = fincasFiltradas.map((finca: any) => finca.idFinca);

                // Filtrar registros de mano de obra usando los identificadores de finca
                const manoObraFiltradas = datosManoObra.filter((manoObra: any) => {
                    return idsFincasFiltradas.includes(manoObra.idFinca);
                }).map((ordenCompra: any) => ({
                    ...ordenCompra,
                    sEstado: ordenCompra.estado === 1 ? 'Activo' : 'Inactivo',
                }));


                setmanoObra(manoObraFiltradas);
                setManoObraFiltrados(manoObraFiltradas);
            }

        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };




    // Función para cambiar el estado de un mano obra
    const toggleStatus = async (manoObra: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar el registro de Mano Obra: " + manoObra.actividad + "  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idRegistroManoObra: manoObra.idRegistroManoObra,
                    };

                    const resultado = await CambiarEstadoRegistroManoObra(datos);

                    if (parseInt(resultado.indicador) === 1) {
                        await obtenerDatosManoObra();
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
        { key: 'fecha', header: 'Fecha' },
        { key: 'finca', header: 'Finca' },
        { key: 'actividad', header: 'Actividad' },
        { key: 'trabajador', header: 'Trabajador' },
        { key: 'horasTrabajadas', header: 'Horas Trabajadas' },
        { key: 'pagoPorHora', header: 'Pago por Hora' },
        { key: 'totalPago', header: 'Monto Total' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Mano Obra" />
                <div className="content">
                    <div className="filtro-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label htmlFor="filtroIdentificacion">Finca:</label>
                            <input
                                type="text"
                                id="filtroIdentificacion"
                                value={filtroInput}
                                onChange={handleChangeFiltro}
                                placeholder="Buscar por Finca"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalCrearManoObra()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear Registro</span>
                        </button>
                    </div>
                    <TableResponsive columns={columns} data={manoObraFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Mano Obra"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* modal para editar  */}
                        <EditarManoObra
                            idFinca={selectedDatos.idFinca}
                            idRegistroManoObra={selectedDatos.idRegistroManoObra}
                            fecha={selectedDatos.fecha}
                            actividad={selectedDatos.actividad}
                            trabajador={selectedDatos.trabajador}
                            identificacion={selectedDatos.identificacion}
                            horasTrabajadas={selectedDatos.horasTrabajadas}
                            pagoPorHora={selectedDatos.pagoPorHora}
                            totalPago={selectedDatos.totalPago}
                            onEdit={handleEditarManoObra}
                        />
                    </div>
                </div>
            </Modal>

            {/* modal para crear  */}
            <Modal
                isOpen={modalCrearManoObra}
                toggle={abrirCerrarModalCrearManoObra}
                title="Crear Mano Obra"
                onCancel={abrirCerrarModalCrearManoObra}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearManoObra
                            onAdd={handleAgregarMedicion}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default ManoObra