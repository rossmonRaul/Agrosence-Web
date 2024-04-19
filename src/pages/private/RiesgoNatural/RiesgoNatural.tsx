
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { CambiarEstadoRiesgoNatural, ObtenerRiesgosNaturales} from "../../../servicios/ServicioRiesgoNatural.ts"
import { ObtenerUsuariosAsignados } from "../../../servicios/ServicioUsuario.ts"
import CrearRiesgosNaturales from "../../../components/riesgonatural/InsertarRiesgosNaturales.tsx";
import EditarRiesgoNatural from "../../../components/riesgonatural/EditarRiesgosNaturales.tsx";
import TableResponsiveDelete from "../../../components/table/tableDelete.tsx";


/**
 * Componente funcional que representa la página de riesgo natural.
 */
function RiesgoNatural() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal
    const [modalCrearRiesgos, setModalCrearRiesgos] = useState(false);
    const [riesgos, setRiesgos] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [RiesgosFiltrados, setRiesgosFiltrados] = useState<any[]>([]);
    const [filtroInput, setfiltroInput] = useState('');

    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: 0,
        idParcela: 0,
        idRiesgoNatural: '',
        fecha:'',
        riesgoNatural: '',
        practicaPreventiva: '',
        responsable: '',
        resultadoPractica: '',
        accionesCorrectivas: '',
        observaciones: '',
        nombreFinca: '',
        nombreParcela: '',
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    // Modal para crear la medicion
    const abrirCerrarModalCrearRiesgoNatural = () => {
        setModalCrearRiesgos(!modalCrearRiesgos);
    }

    const handleAgregarRiesgo= async () => {
        await obtenerDatosRiesgos();
        abrirCerrarModalCrearRiesgoNatural();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [filtroInput, riesgos]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para filtrar los usuarios cada vez que cambie el filtro de identificación
    const filtrarDatos = () => {
        const datosFiltrados = filtroInput
            ? riesgos.filter((datosTabla: any) =>
                datosTabla.nombreFinca.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.nombreParcela.toLowerCase().includes(filtroInput.toLowerCase())
            )
            : riesgos;
        setRiesgosFiltrados(datosFiltrados);
    };


    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }

    const handleEditarRiesgoNatural = async () => {
        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerDatosRiesgos();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosRiesgos();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosRiesgos= async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');
            const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });
            const datosRiesgos = await ObtenerRiesgosNaturales();

            const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

            if (!usuarioActual) {
                console.error('No se encontró el usuario actual');
                return;
            }

            const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);
            
            // Filtrar las manejo de riesgo de  de las parcelas del usuario actual
            const riesgosFiltradas = datosRiesgos.filter((riesgo: any) => {
                return parcelasUsuarioActual.includes(riesgo.idParcela);
            }).map((riesgo: any) => ({
                ...riesgo,
                sEstado: riesgo.estado === 1 ? 'Activo' : 'Inactivo',
            }));
            
            setRiesgos(riesgosFiltradas);
            setRiesgosFiltrados(riesgosFiltradas);
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de un Riesgo
    const toggleStatus = async (riesgo: any) => {
        Swal.fire({
            title: "Eliminar",
            text: "¿Estás seguro de que deseas eliminar el riesgo: "+ riesgo.riesgoNatural +"  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idRiesgoNatural: riesgo.idRiesgoNatural, 
                    };
                    
                    const resultado = await CambiarEstadoRiesgoNatural(datos); 

                    if (parseInt(resultado.indicador) === 1) {
                        await obtenerDatosRiesgos();
                        Swal.fire({
                            icon: 'success',
                            title: '¡Eliminacion exitosa! ',
                            text: 'Se puedo eliminar el riesgo.',
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
        { key: 'fecha', header: 'Fecha' },
        { key: 'nombreFinca', header: 'Finca' },
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'riesgoNatural', header: 'Riesgo' },
        { key: 'responsable', header: 'Responsable' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Riesgos Naturales" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalCrearRiesgoNatural()} className="btn-crear">Crear Riesgo</button>
                    <div className="filtro-container">
                        <label htmlFor="filtroIdentificacion">Filtrar:</label>
                        <input
                            type="text"
                            id="filtroIdentificacion"
                            value={filtroInput}
                            onChange={handleChangeFiltro}
                            placeholder="Buscar por Finca o Parcela"
                            className="form-control"
                        />
                    </div>
                    <TableResponsiveDelete columns={columns} data={RiesgosFiltrados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Manejo de Riesgo"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        
                        <EditarRiesgoNatural
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idRiesgoNatural={selectedDatos.idRiesgoNatural}
                            riesgoNatural={selectedDatos.riesgoNatural}
                            fecha={selectedDatos.fecha}
                            practicaPreventiva={selectedDatos.practicaPreventiva}
                            responsable={selectedDatos.responsable}
                            resultadoPractica={selectedDatos.resultadoPractica}
                            accionesCorrectivas={selectedDatos.accionesCorrectivas}
                            observaciones={selectedDatos.observaciones}

                            
                            onEdit={handleEditarRiesgoNatural}
                        />
                    </div>
                </div>
            </Modal>

            {/* modal para crear riesgo */}
            <Modal
                isOpen={modalCrearRiesgos}
                toggle={abrirCerrarModalCrearRiesgoNatural}
                title="Riesgos Naturales"
                onCancel={abrirCerrarModalCrearRiesgoNatural}
            >
                <div className='form-container'>
                     <div className='form-group'>
                        <CrearRiesgosNaturales
                            onAdd={handleAgregarRiesgo}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default RiesgoNatural