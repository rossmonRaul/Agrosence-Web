

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import '../../../css/AdministacionAdministradores.css';
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { CambiarEstadoMedicionSensor, ObtenerMedicionesSensor } from "../../../servicios/ServicioMedicionesSensor.ts";
import Swal from "sweetalert2";
import InsertarMedicionSensor from "../../../components/medicionesSensor/InsertarMedicionesSensor.tsx";
import TableResponsiveState from "../../../components/table/tableState.tsx";
import { IoAddCircleOutline } from "react-icons/io5";


function MedicionesSensor() {

    const [filtroNombre, setFiltroNombre] = useState('')

    // Estado para controlar la apertura y cierre del modal de inserción
    const [modalInsertar, setModalInsertar] = useState(false);


    const [mediciones, setMediciones] = useState<any[]>([]);

    const [medicionesFiltrados, setMedicionesFiltrados] = useState<any[]>([]);

    // Obtener las mediciones al cargar la página
    useEffect(() => {
        obtenerMediciones();
    }, []); // Ejecutar solo una vez al montar el componente

    // Función para obtener todas las mediciones
    const obtenerMediciones = async () => {
        try {
            const mediciones = await ObtenerMedicionesSensor();

            const medicionesConSEstado = mediciones.map((medicion: any) => ({
                ...medicion,
                sEstado: medicion.estado === 1 ? 'Activo' : 'Inactivo',
            }));
            setMediciones(medicionesConSEstado);
            setMedicionesFiltrados(medicionesConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
        } catch (error) {
            console.error('Error al obtener mediciones:', error);
        }
    };

    // Filtrar las mediciones cada vez que cambie el filtro de nombre
    useEffect(() => {
        filtrarMediciones();
    }, [filtroNombre, mediciones]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para manejar el cambio en el filtro de nombre
    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombre(e.target.value);
    };

    // Función para filtrar las mediciones por nombre
    const filtrarMediciones = () => {
        const medicionFiltrados = filtroNombre
            ? mediciones.filter((mediciones: any) =>
                mediciones.nombre.includes(filtroNombre)
            )
            : mediciones;
        setMedicionesFiltrados(medicionFiltrados);
    };

    // Funciones para manejar la apertura y cierre de los modales
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    }

    // Función para cambiar el estado de una medicion
    const toggleStatus = (medicion: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado de la medicion: " + medicion.nombre + "?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const idUsuario = localStorage.getItem('identificacionUsuario');

                    if (idUsuario !== null) {
                        const datos = {
                            idMedicion: medicion.idMedicion,
                            usuarioCreacionModificacion: idUsuario
                        };
                        const resultado = await CambiarEstadoMedicionSensor(datos);
                        if (parseInt(resultado.indicador) === 1) {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Estado Actualizado! ',
                                text: 'Actualización exitosa.',
                            });
                            await obtenerMediciones();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error al actualizar el estado.',
                                text: resultado.mensaje,
                            });
                        };
                    } else {
                        console.error('El valor de identificacionUsuario en localStorage es nulo.');
                    }

                } catch (error) {
                    Swal.fire("Error al asignar al usuario", "", "error");
                }
            }
        });
    };

    // Funciones para manejar el estado de los modales
    const openModal = () => {

    };

    const handleAgregarMedicion = async () => {
        await obtenerMediciones();
        abrirCerrarModalInsertar();
    };

    // Definición de las columnas de la tabl
    const columns = [
        { key: 'nombre', header: 'Nombre Medición' },
        { key: 'unidadMedida', header: 'Unidad Medida' },
        { key: 'nomenclatura', header: 'Nomenclatura' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    return (
        <Sidebar>
            <div className="main-container" style={{  width: '90%' }}>
                <Topbar />
                <BordeSuperior text="Mediciones de Sensor" />
                <div className="content">
                    <div className="filtro-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label htmlFor="filtroNombre">Nombre:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                value={filtroNombre}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese el nombre"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px',backgroundColor: '#548454', color: 'white', borderColor: '#548454' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear medición</span>
                        </button>
                    </div>
                    <TableResponsiveState columns={columns} data={medicionesFiltrados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} />

                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar medición"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container' style={{  width: '90%' }}>
                    <div className='form-group'>
                        <InsertarMedicionSensor
                            onAdd={handleAgregarMedicion}
                        />
                    </div>
                </div>
            </Modal>



        </Sidebar>


    )
}
export default MedicionesSensor