/**  esta pantalla se est'a usando para la creacion de usuarios por parte del administrador */

/**
 * Página para las mediciones de suelo.
 * Permite ver, filtrar y editar las mediciones de suelo.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";
import EditarMedicionSuelo from "../../../components/calidadsuelo/EditarMedicionSuelo.tsx";
import CrearMedicionSuelo from "../../../components/calidadsuelo/CrearMedicionSuelo.tsx";
import { ObtenerMedicionesSuelo, CambiarEstadoMedicionesSuelo } from "../../../servicios/ServicioSuelos.ts"
import { ObtenerUsuariosAsignados } from "../../../servicios/ServicioUsuario.ts"


/**
 * Componente funcional que representa la página de calidad de suelo.
 */
function CalidadSuelo() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de creacion de usuarios
    const [modalCrearMedicionSuelo, setModalCrearMedicionSuelo] = useState(false);
    // Estado para almacenar la información del usuario seleccionado
    // Estado para almacenar todos los usuarios asignados
    const [mediciones, setMediciones] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [MedicionesFiltradas, setMedicionesFiltradas] = useState<any[]>([]);

    // Estado para el filtro por identificación de usuario
    const [filtroInput, setfiltroInput] = useState('');

    // Estado para obtener el estado del usuario que inició sesión
    const userLoginState = useSelector((store: AppStore) => store.user);

    // Estado para almacenar los usuarios asignados filtrados
    const [datosFiltrados, setdatosFiltrados] = useState<any[]>([]);

    //puede que falten cambios a los datos seleccionados
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: 0,
        idParcela: 0,
        idMedicionesSuelo: 0,
        calidadAgua: 0,
        conductividadElectrica: 0,
        densidadAparente: 0,
        desleimiento: 0,
        estabilidadAgregados: 0,
        infiltracion: 0,
        lombrices: 0,
        medicionesCalidadSuelo: '',
        nitratosSuelo: 0,
        observaciones: '',
        pH: 0,
        respiracionSuelo: 0
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    // Modal para crear la medicion
    const abrirCerrarModalCrearMedicion = () => {
        setModalCrearMedicionSuelo(!modalCrearMedicionSuelo);
    }

    const handleAgregarMedicion = async () => {
        // Lógica para agregar la medicion
        // Después de agregar la medicion se vuelven a cargar los datos
        await obtenerDatosMediciones();
        abrirCerrarModalCrearMedicion();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [filtroInput, mediciones]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para filtrar los usuarios cada vez que cambie el filtro de identificación
    const filtrarDatos = () => {
        const datosFiltrados = filtroInput
            ? mediciones.filter((datosTabla: any) =>
                datosTabla.usuario.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.finca.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.parcela.toLowerCase().includes(filtroInput.toLowerCase())
            )
            : mediciones;
        setMedicionesFiltradas(datosFiltrados);
    };


    const abrirCerrarModalEditar = () => {
        console.log();
        setModalEditar(!modalEditar);
    }

    const handleEditarMedicionUsuario = async () => {
        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerDatosMediciones();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosMediciones();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosMediciones = async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');
            const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });
            const datosMedicionesSuelo = await ObtenerMedicionesSuelo();

            const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

            if (!usuarioActual) { 
                console.error('No se encontró el usuario actual');
                return;
            }

            const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);

            // Filtrar las mediciones de suelo de las parcelas del usuario actual
            const medicionesFiltradas = datosMedicionesSuelo.filter((medicion: any) => {
                return parcelasUsuarioActual.includes(medicion.idParcela);
            }).map((medicion: any) => ({
                ...medicion,
                sEstado: medicion.estado === 1 ? 'Activo' : 'Inactivo',
            }));

            //debo de poner 2 arreglos aca para poder cargar la tabla siempre que se cambia
            // la palabra del input de filtro
            setMediciones(medicionesFiltradas);
            setMedicionesFiltradas(medicionesFiltradas);
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de un usuario
    const toggleStatus = async (medicionSuelo: any) => {
        Swal.fire({
            title: "Actualizar",
            text: "¿Estás seguro de que deseas actualizar el estado de la medicion:  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idMedicionesSuelo: medicionSuelo.idMedicionesSuelo, //aca revisar que si sea idMedicionesSuelo
                    };

                    const resultado = await CambiarEstadoMedicionesSuelo(datos); //aca pones el servicio que se utliza para las mediciones del suelo

                    if (parseInt(resultado.indicador) === 1) {
                        await obtenerDatosMediciones();
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
        { key: 'usuario', header: 'Usuario' },
        { key: 'finca', header: 'Finca' },
        { key: 'parcela', header: 'Parcela' },
        { key: 'fechaCreacion', header: 'Fecha' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Estudio de Calidad de Suelo" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalCrearMedicion()} className="btn-crear">Crear Medición</button>
                    <div className="filtro-container">
                        <label htmlFor="filtroFincaParcelaUsuario">Filtrar:</label>
                        <input
                            type="text"
                            id="filtroFincaParcelaUsuario"
                            value={filtroInput}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese la finca, parcela o el usuario"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={MedicionesFiltradas} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Medición Suelo"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* hay que modificar el nombre porque modifica mas datos */}
                        {/* <CambiarContrasenaAsignados */}
                        <EditarMedicionSuelo
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idMedicionesSuelo={selectedDatos.idMedicionesSuelo}
                            calidadAgua={selectedDatos.calidadAgua}
                            conductividadElectrica={selectedDatos.conductividadElectrica}
                            densidadAparente={selectedDatos.densidadAparente}
                            desleimiento={selectedDatos.desleimiento}
                            estabilidadAgregados={selectedDatos.estabilidadAgregados}
                            infiltracion={selectedDatos.infiltracion}
                            lombrices={selectedDatos.lombrices}
                            medicionesCalidadSuelo={selectedDatos.medicionesCalidadSuelo}
                            nitratosSuelo={selectedDatos.nitratosSuelo}
                            observaciones={selectedDatos.observaciones}
                            pH={selectedDatos.pH}
                            respiracionSuelo={selectedDatos.respiracionSuelo}

                            //aqui agregas las props que ocupa que reciba el componente, (todos los datos para editar)
                            onEdit={handleEditarMedicionUsuario}
                        />
                    </div>
                </div>
            </Modal>

            {/* modal para crear medicion */}
            <Modal
                isOpen={modalCrearMedicionSuelo}
                toggle={abrirCerrarModalCrearMedicion}
                title="Crear Medición"
                onCancel={abrirCerrarModalCrearMedicion}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearMedicionSuelo
                            onAdd={handleAgregarMedicion}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default CalidadSuelo