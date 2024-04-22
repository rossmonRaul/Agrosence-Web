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
import { CambiarEstadoFincas, ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import EditarFinca from "../../../components/finca/EditarFinca.tsx";
import CrearFinca from "../../../components/finca/CrearFinca.tsx";
import Swal from "sweetalert2";

// Componente funcional que representa la página de administración de empresas.
function AdministrarFincas() {
    // Estado para el filtro por nombre de empresa
    const [filtroNombre, setFiltroNombre] = useState('')
    // Estado para controlar la apertura y cierre del modal de edición
    const [modalEditar, setModalEditar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [modalInsertar, setModalInsertar] = useState(false);
    // Estado para controlar la apertura y cierre del modal de inserción
    const [selectedFinca, setSelectedFinca] = useState({
        idFinca: '',
        nombre: '',
        ubicacion:''
    });
    // Estado para almacenar todas las empresas
    const [fincas, setFinca] = useState<any[]>([]);
    // Estado para almacenar las empresas filtradas
    const [fincasFiltrados, setFincasFiltrados] = useState<any[]>([]);


    // Obtener las empresas al cargar la página
    useEffect(() => {
        obtenerFincas();
    }, []); // Ejecutar solo una vez al montar el componente

    // Función para obtener todas las empresas
    const obtenerFincas = async () => {
        try {
            // Recuperar el valor guardado en localStorage
            const idEmpresaUsuario = localStorage.getItem('empresaUsuario');

            if (idEmpresaUsuario) {
                // Si se encuentra el valor en localStorage, lo utilizamos para filtrar las fincas
                const fincas = await ObtenerFincas();

                const fincasEmpresaUsuario = fincas.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));

                const fincasConSEstado = fincasEmpresaUsuario.map((finca: any) => ({
                    ...finca,
                    sEstado: finca.estado === 1 ? 'Activo' : 'Inactivo',
                }));

                setFincasFiltrados(fincasConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
            }
        } catch (error) {
            console.error('Error al obtener fincas:', error);
        }
    };

    // Filtrar las empresas cada vez que cambie el filtro de nombre
    useEffect(() => {
        filtrarFincas();
    }, [filtroNombre, fincas]); // Ejecutar cada vez que el filtro o los datos originales cambien

    // Función para manejar el cambio en el filtro de nombre
    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombre(e.target.value);
    };    

    // Función para filtrar las empresas por nombre sin key sensitive
    const filtrarFincas = () => {
        const fincaFiltrados = filtroNombre
            ? fincas.filter((finca: any) =>
                finca.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
            )
            : fincas;
        setFincasFiltrados(fincaFiltrados);
    };

    // Funciones para manejar la apertura y cierre de los modales
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);

    }

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }


    const openModal = (finca: any) => {
        setSelectedFinca(finca);
        abrirCerrarModalEditar();
    };

    // Función para cambiar el estado de una empresa
    const toggleStatus = (finca: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado de la finca: " + finca.nombre + "?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idFinca: finca.idFinca,
                        nombre: finca.nombre
                    };
                    const resultado = await CambiarEstadoFincas(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerFincas();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado de la finca", "", "error");
                }
            }
        });
    };

    // Funciónes para manejar la edición y la adicion de una empresa (actualizar tabla)
    const handleEditarFinca = async () => {
        await obtenerFincas();
        abrirCerrarModalEditar();
    };

    const handleAgregarFinca = async () => {
        await obtenerFincas();
        abrirCerrarModalInsertar();
    };

    // Definición de las columnas de la tabl
    const columns = [
        { key: 'nombre', header: 'Nombre Finca' },
        { key: 'ubicacion', header: 'Ubicación' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Administrar Fincas" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Crear Finca</button>
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
                    <TableResponsive columns={columns} data={fincasFiltrados} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />

                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar Finca"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearFinca
                            onAdd={handleAgregarFinca}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Finca"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarFinca
                            nombreEditar={selectedFinca.nombre}
                            idFinca={selectedFinca.idFinca}
                            ubicacion={selectedFinca.ubicacion}
                            onEdit={handleEditarFinca}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>


    )
}
export default AdministrarFincas