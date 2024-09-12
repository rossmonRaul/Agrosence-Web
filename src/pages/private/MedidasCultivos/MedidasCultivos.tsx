/**
 * Página para administrar las empresas.
 * Permite ver, filtrar, editar y cambiar el estado de las empresas.
 */

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import '../../../css/AdministacionAdministradores.css';
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { CambiarEstadoMedidasCultivos, ObtenerMedidasCultivos } from "../../../servicios/ServicioCultivo.ts";
import Swal from "sweetalert2";
import CrearMedidasCultivos from "../../../components/medidasCultivos/CrearMedidasCultivos.tsx";
import EditarMedidasCultivos from "../../../components/medidasCultivos/EditarMedidasCultivos.tsx";
import TableDelete from "../../../components/table/tableDelete.tsx";
import { IoAddCircleOutline } from "react-icons/io5";

// Componente funcional que representa la página de administración de empresas.
function MedidasCultivos() {
    // Estado para el filtro por nombre de empresa
    const [filtroNombre, setFiltroNombre] = useState('')
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [modalInsertar, setModalInsertar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [selectedMedidasCultivo, setSelectedMedidasCultivo] = useState({
        idMedidasCultivos: '',
        medida: ''
    });
    // Estado para almacenar todas las empresas
    const [medidasCultivo, setMedidasCultivo] = useState<any[]>([]);
    // Estado para almacenar las empresas filtradas
    const [medidasCultivoFiltrados, setMedidasCultivoFiltrados] = useState<any[]>([]);

    // Obtener las empresas al cargar la página
    useEffect(() => {
        obtenerMedidasCultivo();
    }, []); // Ejecutar solo una vez al montar el componente

    // Función para obtener todas las empresas
    const obtenerMedidasCultivo = async () => {
        try {
            const medidasCultivo = await ObtenerMedidasCultivos();

            const medidasCultivoConSEstado = medidasCultivo.map((empresa: any) => ({
                ...empresa,
                sEstado: empresa.estado === 1 ? 'Activo' : 'Inactivo',
            }));
            setMedidasCultivo(medidasCultivoConSEstado);
            setMedidasCultivoFiltrados(medidasCultivoConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
        } catch (error) {
            console.error('Error al obtener Medidas Cultivo:', error);
        }
    };

    // Filtrar las empresas cada vez que cambie el filtro de nombre
    useEffect(() => {
        filtrarMedidasCultivo();
    }, [filtroNombre, medidasCultivo]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para manejar el cambio en el filtro de nombre
    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombre(e.target.value);
    };

    // Función para filtrar las empresas por nombre
    const filtrarMedidasCultivo = () => {
        const medidasCultivoFiltrados = filtroNombre
            ? medidasCultivo.filter((medidaCultivo: any) =>
                medidaCultivo.medida.includes(filtroNombre)
            )
            : medidasCultivo;
        setMedidasCultivoFiltrados(medidasCultivoFiltrados);
    };

    // Funciones para manejar la apertura y cierre de los modales
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    }


    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }


    const openModal = (medidasCultivo: any) => {
        setSelectedMedidasCultivo(medidasCultivo);
        abrirCerrarModalEditar();
    };

    // Función para cambiar el estado de una empresa
    const toggleStatus = (medidasCultivo: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado de la medida del cultivo: " + medidasCultivo.medida + "?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idMedidasCultivo: medidasCultivo.idMedidasCultivos,
                        medida: medidasCultivo.medida
                    };
                    const resultado = await CambiarEstadoMedidasCultivos(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerMedidasCultivo();
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

    // Funciónes para manejar la edición y la adicion de una empresa (actualizar tabla)
    const handleEditarMedidasCultivo = async () => {
        await obtenerMedidasCultivo();
        abrirCerrarModalEditar();
    };

    const handleAgregarMedidasCultivo = async () => {
        await obtenerMedidasCultivo();
        abrirCerrarModalInsertar();
    };

    // Definición de las columnas de la tabl
    const columns = [
        { key: 'medida', header: 'Medida' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Medidas de Cultivos" />
                <div className="content">
                    <div className="filtro-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label htmlFor="filtroNombre">Medida:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                value={filtroNombre}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese la medida"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                                className="form-control"
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear medida</span>
                        </button>
                    </div>
                    <TableDelete columns={columns} data={medidasCultivoFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} useTrashIcon={true} />

                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar medida"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearMedidasCultivos
                            onAdd={handleAgregarMedidasCultivo}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar medida"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarMedidasCultivos
                            medida={selectedMedidasCultivo.medida}
                            idMedidasCultivo={selectedMedidasCultivo.idMedidasCultivos}
                            onEdit={handleEditarMedidasCultivo}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>


    )
}
export default MedidasCultivos