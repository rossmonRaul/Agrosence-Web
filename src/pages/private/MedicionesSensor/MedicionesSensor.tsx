

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import '../../../css/AdministacionAdministradores.css';
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { CambiarEstadoMedicionSensor, ObtenerMedicionesSensor } from "../../../servicios/ServicioMedicionesSensor.ts";
import Swal from "sweetalert2";
import InsertarMedicionSensor from "../../../components/medicionesSensor/InsertarMedicionesSensor.tsx";
import EditarMedicionesSensor from "../../../components/medicionesSensor/EditarMedicionesSensor.tsx";


function MedicionesSensor() {
   
    const [filtroNombre, setFiltroNombre] = useState('')
     // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [modalInsertar, setModalInsertar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [selectedMedicion, setSelectedMedicion] = useState({
        idMedicion: '',
        nombre: '',
        unidadMedida: ''
    });
    
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

    
    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }


    const openModal = (medicion: any) => {
        setSelectedMedicion(medicion);
        abrirCerrarModalEditar();
    };

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
                    const datos = {
                        idMedicion: medicion.idMedicion
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
                } catch (error) {
                    Swal.fire("Error al asignar al usuario", "", "error");
                }
            }
        });
    };

    // Funciónes para manejar la edición y la adicion de una medicion (actualizar tabla)
    const handleEditarMedicion= async () => {
        await obtenerMediciones();
        abrirCerrarModalEditar();
    };

    const handleAgregarMedicion = async () => {
        await obtenerMediciones();
        abrirCerrarModalInsertar();
    };

    // Definición de las columnas de la tabl
    const columns = [
        { key: 'nombre', header: 'Nombre Medicion' },
        { key: 'unidadMedida', header: 'Unidad Medida' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Mediciones de Sensor" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Crear Medición</button>
                    <div className="filtro-container">
                        <label htmlFor="filtroNombre">Filtrar por nombre:</label>
                        <input
                            type="text"
                            id="filtroNombre"
                            value={filtroNombre}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese el nombre"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={medicionesFiltrados} openModal={openModal}  btnActionName={"Editar"} toggleStatus={toggleStatus} />
   
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar Medicion"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <InsertarMedicionSensor
                            onAdd={handleAgregarMedicion}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Medicion"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarMedicionesSensor
                            nombrebase={selectedMedicion.nombre}
                            idMedicion={selectedMedicion.idMedicion}
                            unidadMedida={selectedMedicion.unidadMedida}
                            onEdit={handleEditarMedicion}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>


    )
}
export default MedicionesSensor