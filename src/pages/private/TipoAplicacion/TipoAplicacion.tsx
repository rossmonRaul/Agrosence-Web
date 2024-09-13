import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar.tsx";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerTipoAplicacion, CambiarEstadoTipoAplicacion } from "../../../servicios/ServicioTipoAplicacion.ts";
import InsertarTipoAplicacion from "../../../components/TipoAplicacion/InsertarTipoAplicacion.tsx"; // Asegúrate de tener este componente
import EditarTipoAplicacion from "../../../components/TipoAplicacion/EditarTipoAplicacion.tsx";
import '../../../css/FormSeleccionEmpresa.css'
import '../../../css/ordenCompra.css'
import { IoAddCircleOutline } from "react-icons/io5";

function AdministrarTipoAplicacion() {
    const [tipoAplicaciones, setTipoAplicaciones] = useState<any[]>([]);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [TipoAplicacion, setTipoAplicacion] = useState<any[]>([]);
    const [selectedDatos, setSelectedDatos] = useState({
        idTipoAplicacion: '',
        nombre: '',
    });

    // Obtener los datos de tipoAplicación al cargar la página
    useEffect(() => {
        const obtenerTipoAplicaciones = async () => {
            try {
                const tipoAplicacionesResponse = await ObtenerTipoAplicacion();
                setTipoAplicaciones(tipoAplicacionesResponse);
            } catch (error) {
                console.error('Error al obtener los tipos de aplicación:', error);
            }
        };
        obtenerTipoAplicaciones();
    }, []);

    const columns = [
        { key: 'nombre', header: 'Nombre' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    const openModal = (TipoAplicacion: any) => {
        setSelectedDatos(TipoAplicacion);
        abrirCerrarModalEditar();
    };

    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };


    // Función para obtener la información de tipo aplicación después de insertar
    const obtenerInfo = async () => {
        try {
            const datosTipoAplicacion = await ObtenerTipoAplicacion();
            setTipoAplicaciones(datosTipoAplicacion);
        } catch (error) {
            console.error('Error al obtener los datos de los tipos de aplicación:', error);
        }
    };

    const handleEditarTipoAplicacion = async () => {
        await obtenerInfo();
        abrirCerrarModalEditar();
    };


    const handleAgregarTipoAplicacion = async () => {
        await obtenerInfo();
        abrirCerrarModalInsertar();
    };

    const toggleStatus = async (parcela: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idTipoAplicacion: parcela.idTipoAplicacion
                    };
                    const resultado = await CambiarEstadoTipoAplicacion(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerInfo();
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


    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Administrar Tipo Aplicación" />
                <div className="content" col-md-12>
                    <button onClick={abrirCerrarModalInsertar} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px',backgroundColor: '#548454', color: 'white', borderColor: '#548454' }}>
                        <IoAddCircleOutline size={27} />
                        <span style={{ marginLeft: '5px' }}>Agregar tipo aplicación</span>
                    </button>
                    <TableResponsive columns={columns} data={tipoAplicaciones} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Agregar tipo aplicación"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        {/* este es el componente para crear el tipo de aplicación */}
                        <InsertarTipoAplicacion
                            onAdd={handleAgregarTipoAplicacion}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar manejo de fertilizantes"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarTipoAplicacion

                            idTipoAplicacion={selectedDatos.idTipoAplicacion}

                            nombre={selectedDatos.nombre}
                            onEdit={handleEditarTipoAplicacion}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarTipoAplicacion;
