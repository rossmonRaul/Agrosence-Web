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
import { CambiarEstadoEmpresas, ObtenerEmpresas } from "../../../servicios/ServicioEmpresas.ts";
import EditarEmpresa from "../../../components/empresa/EditarEmpresa.tsx";
import CrearEmpresa from "../../../components/empresa/CrearEmpresa.tsx";
import Swal from "sweetalert2";
import { IoAddCircleOutline } from "react-icons/io5";

// Componente funcional que representa la página de administración de empresas.
function AdministrarEmpresas() {
    // Estado para el filtro por nombre de empresa
    const [filtroNombre, setFiltroNombre] = useState('')
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [modalInsertar, setModalInsertar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [selectedEmpresa, setSelectedEmpresa] = useState({
        idEmpresa: '',
        nombre: ''
    });
    // Estado para almacenar todas las empresas
    const [empresas, setEmpresa] = useState<any[]>([]);
    // Estado para almacenar las empresas filtradas
    const [empresasFiltrados, setEmpresasFiltrados] = useState<any[]>([]);

    // Obtener las empresas al cargar la página
    useEffect(() => {
        obtenerEmpresas();
    }, []); // Ejecutar solo una vez al montar el componente

    // Función para obtener todas las empresas
    const obtenerEmpresas = async () => {
        try {
            const empresas = await ObtenerEmpresas();

            const empresasConSEstado = empresas.map((empresa: any) => ({
                ...empresa,
                sEstado: empresa.estado === 1 ? 'Activo' : 'Inactivo',
            }));
            setEmpresa(empresasConSEstado);
            setEmpresasFiltrados(empresasConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
        } catch (error) {
            console.error('Error al obtener empresas:', error);
        }
    };

    // Filtrar las empresas cada vez que cambie el filtro de nombre
    useEffect(() => {
        filtrarEmpresas();
    }, [filtroNombre, empresas]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para manejar el cambio en el filtro de nombre
    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombre(e.target.value);
    };

    // Función para filtrar las empresas por nombre
    const filtrarEmpresas = () => {
        const empresaFiltrados = filtroNombre
            ? empresas.filter((empresa: any) =>
                empresa.nombre.includes(filtroNombre)
            )
            : empresas;
        setEmpresasFiltrados(empresaFiltrados);
    };

    // Funciones para manejar la apertura y cierre de los modales
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    }


    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }


    const openModal = (empresa: any) => {
        setSelectedEmpresa(empresa);
        abrirCerrarModalEditar();
    };

    // Función para cambiar el estado de una empresa
    const toggleStatus = (empresa: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado de la empresa: " + empresa.nombre + "?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idEmpresa: empresa.idEmpresa,
                        nombre: empresa.nombre
                    };
                    const resultado = await CambiarEstadoEmpresas(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerEmpresas();
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
    const handleEditarEmpresa = async () => {
        await obtenerEmpresas();
        abrirCerrarModalEditar();
    };

    const handleAgregarEmpresa = async () => {
        await obtenerEmpresas();
        abrirCerrarModalInsertar();
    };

    // Definición de las columnas de la tabl
    const columns = [
        { key: 'nombre', header: 'Nombre Empresa' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Administrar Empresas" />
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
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', backgroundColor: '#548454', color: 'white', borderColor: '#548454' }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Crear empresa</span>
                        </button>
                    </div>
                    <TableResponsive columns={columns} data={empresasFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />

                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar empresa"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearEmpresa
                            onAdd={handleAgregarEmpresa}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar empresa"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarEmpresa
                            nombrebase={selectedEmpresa.nombre}
                            idEmpresa={selectedEmpresa.idEmpresa}
                            onEdit={handleEditarEmpresa}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>


    )
}
export default AdministrarEmpresas