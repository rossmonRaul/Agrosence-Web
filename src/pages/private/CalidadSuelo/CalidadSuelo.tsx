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


/**
 * Componente funcional que representa la página de calidad de suelo.
 */
function CalidadSuelo() {
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de creacion de usuarios
    const [modalCrearMedicionSuelo, setModalCrearMedicionSuelo] = useState(false);
    // Estado para almacenar la información del usuario seleccionado
    const [selectedFincaParcela, setSelectedFincaParcela] = useState({
        idFinca: 0,
        idParcela: 0,
    });
    // Estado para almacenar todos los usuarios asignados
    const [mediciones, setMediciones] = useState<any[]>([]);
    // Estado para obtener el estado del usuario que inició sesión
    const userLoginState = useSelector((store: AppStore) => store.user);

    // Funciones para manejar el estado de los modales
    const openModal = (fincaParcela: any) => {
        setSelectedFincaParcela(fincaParcela);
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

    
    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }

    const handleEditarMedicionUsuario = async () => {
        // Después de editar exitosamente, actualiza la lista de usuarios Asignados
        await ObtenerDatosMediciones();
        abrirCerrarModalEditar();
    };


    useEffect(() => {
        obtenerDatosMediciones();
    }, []); // Ejecutar solo una vez al montar el componente

    // Función para obtener todos las mediciones 
    const obtenerDatosMediciones = async () => {
        try {

            const datos= await ObtenerDatosMediciones(); //aca le pones el nombre del servicio que vas a usar para traer los datos
            const datosConEstado = datos.map((mediciones: any) => ({
                ...mediciones,
                sEstado: mediciones.estado === 1 ? 'Activo' : 'Inactivo',
            }));
            setMediciones(datosConEstado.filter(/** aca agregas los filtros por finca y parcela de acuerdo a la finca y parcela del usuario*/));
        } catch (error) {
            console.error('Error al obtener las mediciones:', error);
        }
    };

    
    // Función para cambiar el estado de un usuario
    const toggleStatus = async (medicionSuelo : any) => {
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
                        idMedicionesSuelo: medicionSuelo.idMecionesSuelo, //aca revisar que si sea idMedicionesSuelo
                    };
                    const resultado = await CambiarEstadoMedicionSuelo(datos); //aca pones el servicio que se utliza para las mediciones del suelo
                    if (parseInt(resultado.indicador) === 1) {
                        await ObtenerDatosMediciones();
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
        { key: '', header: 'Usuario' },
        { key: '', header: 'Finca' },
        { key: '', header: 'Parcela' },
        { key: '', header: 'Fecha' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

  

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Estudio de Calidad de Suelo" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalCrearMedicion()} className="btn-crear">Crear Medicion</button>
                    <TableResponsive columns={columns} data={mediciones} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"}/>
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Medicion Suelo"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* hay que modificar el nombre porque modifica mas datos */}
                        {/* <CambiarContrasenaAsignados */}
                        <EditarMedicionSuelo
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
                title="Crear Medicion"
                onCancel={abrirCerrarModalCrearMedicion}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearMedicionSuelo
                            //aca van las props del componente que va a crear
                            onAdd={handleAgregarMedicion}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>
    )
}
export default CalidadSuelo