import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Modal from "../../../components/modal/Modal";
import Topbar from "../../../components/topbar/Topbar";
import {
    ObtenerDatosPreparacionTerrenoActividad,
    CambiarEstadoActividadPrepTerreno,
    InsertarActividadPreparacionTerreno,
    ModificarActividadPreparacionTerreno
} from "../../../servicios/ServicioCatalogoActividadPT";
import Swal from "sweetalert2";
import '../../../css/FormSeleccionEmpresa.css';
import InsertarCatalogoActividades from "../../../components/catalogoActividadesPT/InsertarCatalogoActividades";
import EditarCatalogoActividades from "../../../components/catalogoActividadesPT/EditarCatalogoActividades";
import { IoAddCircleOutline } from "react-icons/io5";

function CatalogoActividadesPT() {
    const [filtroNombreActividad, setFiltroNombreActividad] = useState('');
    const [datosActividades, setDatosActividades] = useState<any[]>([]);
    const [datosActividadesFiltradas, setDatosActividadesFiltradas] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedActividad, setSelectedActividad] = useState({
        idActividad: 0,
        nombre: '',
        descripcion: '',
        usuarioCreacionModificacion: localStorage.getItem('identificacionUsuario') || ''
    });

    useEffect(() => {
        const obtenerActividades = async () => {
            try {
                const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
                const actividadesActivas = actividadesResponse.filter((actividad: any) => actividad.estado === 1); // Filtrar solo las actividades con estado 1
                console.log(actividadesActivas);
                setDatosActividades(actividadesActivas);
                setDatosActividadesFiltradas(actividadesActivas);
            } catch (error) {
                console.error('Error al obtener actividades:', error);
            }
        };

        obtenerActividades();
    }, []);

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombreActividad(e.target.value);
    };

    useEffect(() => {
        filtrarActividad();
    }, [filtroNombreActividad]);

    const filtrarActividad = () => {
        const actividadesFiltradas = filtroNombreActividad
            ? datosActividades.filter((actividad: any) =>
                actividad.nombre.toLowerCase().includes(filtroNombreActividad.toLowerCase())
            )
            : datosActividades;
        setDatosActividadesFiltradas(actividadesFiltradas);
    };

    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    const openModal = (actividad: any) => {
        setSelectedActividad({
            ...actividad,
            usuarioCreacionModificacion: localStorage.getItem('identificacionUsuario') || ''
        });
        abrirCerrarModalEditar();
    };

    const handleInsertarActividad = async (nuevaActividad: any) => {
        try {
            nuevaActividad.usuarioCreacionModificacion = localStorage.getItem('identificacionUsuario') || '';
            await InsertarActividadPreparacionTerreno(nuevaActividad);
            const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
            const actividadesActivas = actividadesResponse.filter((actividad: any) => actividad.estado === 1);
            setDatosActividades(actividadesActivas);
            setDatosActividadesFiltradas(actividadesActivas);
            abrirCerrarModalInsertar();
        } catch (error) {
            console.error('Error al insertar actividad:', error);
        }
    };

    const handleModificarActividad = async (actividadModificada: any) => {
        try {
            actividadModificada.usuarioCreacionModificacion = localStorage.getItem('identificacionUsuario') || '';
            await ModificarActividadPreparacionTerreno(actividadModificada);
            const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
            const actividadesActivas = actividadesResponse.filter((actividad: any) => actividad.estado === 1);
            setDatosActividades(actividadesActivas);
            setDatosActividadesFiltradas(actividadesActivas);
            abrirCerrarModalEditar();
        } catch (error) {
            console.error('Error al modificar actividad:', error);
        }
    };

    const toggleStatus = async (actividad: any) => {
        Swal.fire({
            title: actividad.estado === 1 ? "Eliminar Actividad" : "Activar Actividad",
            text: actividad.estado === 1
                ? "¿Estás seguro de que deseas eliminar esta actividad?"
                : "¿Estás seguro de que deseas activar esta actividad?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idActividad: actividad.idActividad,
                        nombre: actividad.nombre,
                        usuarioCreacionModificacion: localStorage.getItem('identificacionUsuario') || ''
                    };
                    const resultado = await CambiarEstadoActividadPrepTerreno(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: actividad.estado === 1 ? '¡Actividad Eliminada!' : '¡Actividad Activada!',
                            text: 'Operación exitosa.',
                        });
                        const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
                        const actividadesActivas = actividadesResponse.filter((actividad: any) => actividad.estado === 1);
                        setDatosActividades(actividadesActivas);
                        setDatosActividadesFiltradas(actividadesActivas);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    }
                } catch (error) {
                    Swal.fire("Error al actualizar el estado", "", "error");
                }
            }
        });
    };

    const columns2 = [
        { key: 'nombre', header: 'Nombre de actividades' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Catálogo de Actividades" />
                <div className="content">
                    <div className="filtro-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="filtro-item" style={{ width: '300px', marginTop: '5px' }}>
                            <label htmlFor="filtroNombreActividad">Actividad:</label>
                            <input
                                type="text"
                                id="filtroNombreActividad"
                                value={filtroNombreActividad}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese el nombre de la Actividad"
                                className="form-control"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '250px', marginTop: '0px' }}
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                        <IoAddCircleOutline size={27} />
                        <span style={{ marginLeft: '5px' }}>Ingresar nueva actividad</span>
                        </button>
                    </div>
                    <TableResponsive
                        columns={columns2}
                        data={datosActividadesFiltradas}
                        openModal={openModal}
                        btnActionName={"Editar"}
                        toggleStatus={toggleStatus}
                    />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar Nueva Actividad"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container' style={{ width: '350px' }}>
                    <div className='form-group'>
                        <InsertarCatalogoActividades onAdd={handleInsertarActividad} />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Actividad"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container' style={{ width: '350px' }}>
                    <div className='form-group'>
                        <EditarCatalogoActividades
                            idActividad={selectedActividad.idActividad}
                            nombre={selectedActividad.nombre}
                            onEdit={handleModificarActividad}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default CatalogoActividadesPT;
