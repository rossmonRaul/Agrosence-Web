

/**
 * Página para el manejo de residuo.
 * Permite ver, filtrar y editar el manejo de residuo.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import EditarManejoResiduo from "../../../components/manejoResiduo/EditarManejoResiduo.tsx";
import CrearManejoResiduos from "../../../components/manejoResiduo/InsertarManejoResiduo.tsx";
import { ObtenerManejoResiduos, CambiarEstadoManejoResiduos} from "../../../servicios/ServicioResiduo.ts"
import { ObtenerUsuariosAsignados } from "../../../servicios/ServicioUsuario.ts"


/**
 * Componente funcional que representa la página de calidad de residuo.
 */
function ManejoResiduos() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de creacion de usuarios
    const [modalCrearManejoResiduos, setModalCrearManejoResiduos] = useState(false);
    // Estado para almacenar la información del usuario seleccionado
    // Estado para almacenar todos los usuarios asignados
    const [residuos, setResiduos] = useState<any[]>([]);

    // Estado para almacenar los datos filtrados
    const [ResiduosFiltrados, setResiduosFiltrados] = useState<any[]>([]);

    // Estado para el filtro por identificación de usuario
    const [filtroInput, setfiltroInput] = useState('');

    //puede que falten cambios a los datos seleccionados
    const [selectedDatos, setSelectedDatos] = useState({
        idFinca: 0,
        idParcela: 0,
        idManejoResiduos: 0,
        residuo: '',
        fechaGeneracion: '',
        fechaManejo: '',
        cantidad: 0,
        accionManejo: '',
        destinoFinal: '',
    });

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedDatos(fincaParcela);
        abrirCerrarModalEditar();
    };

    // Modal para crear la medicion
    const abrirCerrarModalCrearManejoResiduo = () => {
        setModalCrearManejoResiduos(!modalCrearManejoResiduos);
    }

    const handleAgregarMedicion = async () => {
        // Lógica para agregar la medicion
        // Después de agregar la medicion se vuelven a cargar los datos
        await obtenerDatosResiduos();
        abrirCerrarModalCrearManejoResiduo();
    };

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfiltroInput(e.target.value);
    };

    useEffect(() => {
        filtrarDatos();
    }, [filtroInput, residuos]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para filtrar los usuarios cada vez que cambie el filtro de identificación
    const filtrarDatos = () => {
        const datosFiltrados = filtroInput
            ? residuos.filter((datosTabla: any) =>
                datosTabla.finca.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.parcela.toLowerCase().includes(filtroInput.toLowerCase()) ||
                datosTabla.usuario.toLowerCase().includes(filtroInput.toLowerCase())
            )
            : residuos;
        setResiduosFiltrados(datosFiltrados);
    };


    const abrirCerrarModalEditar = () => {
        console.log();
        setModalEditar(!modalEditar);
    }

    const handleEditarResiduoUsuario = async () => {
        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await obtenerDatosResiduos();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosResiduos();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerDatosResiduos= async () => {
        try {
            const idEmpresa = localStorage.getItem('empresaUsuario');
            const idUsuario = localStorage.getItem('identificacionUsuario');
            const datosUsuarios = await ObtenerUsuariosAsignados({ idEmpresa: idEmpresa });
            const datosResiduos = await ObtenerManejoResiduos();

            const usuarioActual = datosUsuarios.find((usuario: any) => usuario.identificacion === idUsuario);

            if (!usuarioActual) {
                console.error('No se encontró el usuario actual');
                return;
            }

            const parcelasUsuarioActual = datosUsuarios.filter((usuario: any) => usuario.identificacion === idUsuario).map((usuario: any) => usuario.idParcela);
            
            // Filtrar las manejo de residuo de  de las parcelas del usuario actual
            const residuosFiltradas = datosResiduos.filter((residuo: any) => {
                return parcelasUsuarioActual.includes(residuo.idParcela);
            }).map((residuo: any) => ({
                ...residuo,
                sEstado: residuo.estado === 1 ? 'Activo' : 'Inactivo',
            }));

            //debo de poner 2 arreglos aca para poder cargar la tabla siempre que se cambia
            // la palabra del input de filtro
            
            setResiduos(residuosFiltradas);
            setResiduosFiltrados(residuosFiltradas);
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };


    // Función para cambiar el estado de un Residuo
    const toggleStatus = async (residuo: any) => {
        Swal.fire({
            title: "Actualizar",
            text: "¿Estás seguro de que deseas actualizar el estado del residuo: "+ residuo.residuo +"  ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idManejoResiduos: residuo.idManejoResiduos, //aca revisar que si sea idManejoResiduo
                    };
                    console.log(datos)
                    const resultado = await CambiarEstadoManejoResiduos(datos); //aca pones el servicio que se utliza para las manejoResiduo

                    if (parseInt(resultado.indicador) === 1) {
                        await obtenerDatosResiduos();
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
        { key: 'residuo', header: 'Residuo' },
        { key: 'fechaGeneracion', header: 'Fecha Generacion' },
        { key: 'fechaManejo', header: 'Fecha Manejo' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Manejo de Residuos" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalCrearManejoResiduo()} className="btn-crear">Crear Residuo</button>
                    <div className="filtro-container">
                        <label htmlFor="filtroIdentificacion">Filtrar:</label>
                        <input
                            type="text"
                            id="filtroIdentificacion"
                            value={filtroInput}
                            onChange={handleChangeFiltro}
                            placeholder="Buscar por Finca, Parcela o Usuario"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={ResiduosFiltrados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} />
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Manejo de Residuo"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* hay que modificar el nombre porque modifica mas datos */}
                        {/* <CambiarContrasenaAsignados */}
                        <EditarManejoResiduo
                            idFinca={selectedDatos.idFinca}
                            idParcela={selectedDatos.idParcela}
                            idManejoResiduos={selectedDatos.idManejoResiduos}
                            residuo={selectedDatos.residuo}
                            fechaGeneracion={selectedDatos.fechaGeneracion}
                            fechaManejo={selectedDatos.fechaManejo}
                            cantidad={selectedDatos.cantidad}
                            accionManejo={selectedDatos.accionManejo}
                            destinoFinal={selectedDatos.destinoFinal}

                            //aqui agregas las props que ocupa que reciba el componente, (todos los datos para editar)
                            onEdit={handleEditarResiduoUsuario}
                        />
                    </div>
                </div>
            </Modal>

            {/* modal para crear medicion */}
            <Modal
                isOpen={modalCrearManejoResiduos}
                toggle={abrirCerrarModalCrearManejoResiduo}
                title="Crear Manejo de Residuo"
                onCancel={abrirCerrarModalCrearManejoResiduo}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearManejoResiduos
                            onAdd={handleAgregarMedicion}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default ManejoResiduos