
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerUsuariosAsignados } from "../../../servicios/ServicioUsuario.ts"
import '../../../css/OrdenCompra.css'
import EditarSaludDeLaPlanta from "../../../components/saludPlanta/EditarSaludPlanta.tsx";

import TableResponsiveDetails from "../../../components/table/tableDetails.tsx";
import { CambiarEstadoSaludDeLaPlanta, ObtenerSaludDeLaPlanta } from "../../../servicios/ServicioSaludPlanta.ts";
import CrearSaludDeLaPlanta from "../../../components/saludPlanta/InsertarSaludPlanta.tsx";
import DetallesSaludDeLaPlanta from "../../../components/saludPlanta/DetallesSaludPlanta.tsx";
import { IoAddCircleOutline } from "react-icons/io5";


/**
 * Componente funcional que representa la página de riesgo natural.
 */
function SaludPlanta() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    const [modalDetalles, setModalDetalles] = useState(false);
    // Estado para controlar la apertura y cierre del modal
    const [modalCrearSaludDeLaPlanta, setModalCrearSaludDeLaPlanta] = useState(false);
    const [saludDeLaPlanta, setSaludDeLaPlanta] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [SaludDeLaPlantaFiltrados, setSaludDeLaPlantaFiltrados] = useState<any[]>([]);
    const [filtroInput, setfiltroInput] = useState('');

    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: '',
        idParcela: '',
        idSaludDeLaPlanta: '',
        fecha: '',
        cultivo: '',
        idColorHojas: '',
        idTamanoFormaHoja: '',
        idEstadoTallo: '',
        idEstadoRaiz: '',
        usuarioCreacionModificacion: ''
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    const openModalDetalles = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalDetalles();
    };


    // Modal para crear la medicion
    const abrirCerrarModalCrearSaludDeLaPlanta = () => {
        setModalCrearSaludDeLaPlanta(!modalCrearSaludDeLaPlanta);
    }

    const handleAgregarSaludDeLaPlanta = async () => {
        await obtenerSaludDeLaPlanta();
        abrirCerrarModalCrearSaludDeLaPlanta();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [filtroInput, saludDeLaPlanta]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para filtrar los usuarios cada vez que cambie el filtro de finca
    const filtrarDatos = () => {
        const datosFiltrados = filtroInput
            ? saludDeLaPlanta.filter((datosTabla: any) =>
                datosTabla.nombreFinca.toLowerCase().includes(filtroInput.toLowerCase())
            )
            : saludDeLaPlanta;
        setSaludDeLaPlantaFiltrados(datosFiltrados);
    };

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }
    const abrirCerrarModalDetalles = () => {
        setModalDetalles(!modalDetalles);
    }
    const handleEditarSaludDeLaPlanta = async () => {
        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerSaludDeLaPlanta();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerSaludDeLaPlanta();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerSaludDeLaPlanta = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');

            const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });

            const datosSaludDeLaPlanta = await ObtenerSaludDeLaPlanta();

            const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

            if (!usuarioActual) {
                console.error('No se encontró el usuario actual');
                return;
            }

            const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

            // Filtrar las manejo de riesgo de  de las parcelas del usuario actual
            const saludDeLaPlantaFiltradas = datosSaludDeLaPlanta.filter((saludDeLaPlanta: any) => {
                return parcelasUsuarioActual.includes(saludDeLaPlanta.idParcela);
            }).map((saludDeLaPlanta: any) => ({
                ...saludDeLaPlanta,
                sEstado: saludDeLaPlanta.estado === 1 ? 'Activo' : 'Inactivo',
            }));

            setSaludDeLaPlanta(saludDeLaPlantaFiltradas);
            setSaludDeLaPlantaFiltrados(saludDeLaPlantaFiltradas);
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de un Riesgo
    const toggleStatus = async (saludPlanta: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar la salud de la planta: " + saludPlanta.cultivo + "  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idSaludDeLaPlanta: saludPlanta.idSaludDeLaPlanta,
                    };

                    const resultado = await CambiarEstadoSaludDeLaPlanta(datos);

                    if (parseInt(resultado.indicador) === 1) {

                        /*este await recarga la tabla con los nuevos datos actualizados*/
                        await obtenerSaludDeLaPlanta();
                        Swal.fire({
                            icon: 'success',
                            title: '¡Eliminacion exitosa! ',
                            text: 'Se eliminó el registro salud de la planta.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al eliminar',
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
        { key: 'nombreFinca', header: 'Finca' },
        { key: 'fecha', header: 'Fecha' },
        { key: 'cultivo', header: 'Cultivo' },
        { key: 'colorHojas', header: 'Color de hojas' },
        // { key: 'tamanoFormaHoja', header: 'Tamaño de la forma de la hoja' },
        // { key: 'estadoTallo', header: 'Estado del tallo' },
        // { key: 'estadoRaiz', header: 'Estado de la raiz' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Salud de la Planta" />
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
                        <button onClick={() => abrirCerrarModalCrearSaludDeLaPlanta()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear salud de la planta</span>
                            </button>
                    </div>
                    <TableResponsiveDetails columns={columns} data={SaludDeLaPlantaFiltrados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} openModalDetalles={openModalDetalles} btnActionNameDetails={"Detalles"} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar salud de la planta"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarSaludDeLaPlanta
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idSaludDeLaPlanta={(selectedDatos.idSaludDeLaPlanta).toString()}
                            fecha={selectedDatos.fecha}
                            cultivo={(selectedDatos.cultivo).toString()}
                            idColorHojas={selectedDatos.idColorHojas}
                            idTamanoFormaHoja={selectedDatos.idTamanoFormaHoja}
                            idEstadoTallo={selectedDatos.idEstadoTallo}
                            idEstadoRaiz={selectedDatos.idEstadoRaiz}
                            onEdit={handleEditarSaludDeLaPlanta}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalDetalles}
                toggle={abrirCerrarModalDetalles}
                title="Detalles salud de la planta"
                onCancel={abrirCerrarModalDetalles}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <DetallesSaludDeLaPlanta
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idSaludDeLaPlanta={(selectedDatos.idSaludDeLaPlanta).toString()}
                            fecha={selectedDatos.fecha}
                            cultivo={(selectedDatos.cultivo).toString()}
                            idColorHojas={selectedDatos.idColorHojas}
                            idTamanoFormaHoja={selectedDatos.idTamanoFormaHoja}
                            idEstadoTallo={selectedDatos.idEstadoTallo}
                            idEstadoRaiz={selectedDatos.idEstadoRaiz}
                            onEdit={handleEditarSaludDeLaPlanta}
                        />
                    </div>
                </div>
            </Modal>
            {/* modal para crear riesgo */}
            <Modal
                isOpen={modalCrearSaludDeLaPlanta}
                toggle={abrirCerrarModalCrearSaludDeLaPlanta}
                title="Salud de la planta"
                onCancel={abrirCerrarModalCrearSaludDeLaPlanta}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearSaludDeLaPlanta
                            onAdd={handleAgregarSaludDeLaPlanta}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default SaludPlanta