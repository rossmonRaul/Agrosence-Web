import { useEffect, useState } from "react";
import { Logout } from "../../../components/logout"
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerEmpresas } from "../../../servicios/ServicioEmpresas.ts";
import EditarEmpresa from "../../../components/empresa/EditarEmpresa.tsx";
import CrearEmpresa from "../../../components/empresa/CrearEmpresa.tsx";




function AdministrarEmpresas() {
    const [filtroNombre, setFiltroNombre] = useState('')
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);


    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    }

    const [selectedEmpresa, setSelectedEmpresa] = useState({
        idEmpresa: '',
        nombre: ''
    });

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }


    const openModal = (empresa: any) => {
        setSelectedEmpresa(empresa);
        abrirCerrarModalEditar();
    };


    const [empresas, setEmpresa] = useState<any[]>([]);
    const [empresasFiltrados, setEmpresasFiltrados] = useState<any[]>([]);

    useEffect(() => {
        obtenerEmpresas();
    }, []); // Ejecutar solo una vez al montar el componente

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

    useEffect(() => {
        filtrarEmpresas();
    }, [filtroNombre, empresas]); // Ejecutar cada vez que el filtro o los datos originales cambien

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroNombre(e.target.value);
    };

    const filtrarEmpresas = () => {
        const empresaFiltrados = filtroNombre
            ? empresas.filter((empresa: any) =>
                empresa.nombre.includes(filtroNombre)
            )
            : empresas;
        setEmpresasFiltrados(empresaFiltrados);
    };


{/** 
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
                    const estado = empresa.estado === 1 ? 0 : 1;
                    const datos = {
                        idEmpresa: empresa.idEmpresa,
                        estado: estado
                    };

                    const resultado = await ActualizarAsignarUsuario(datos);

                    if (parseInt(resultado.indicador) === 1) {
                        const nuevasEmpresas = empresas.map(empresa => {
                            if (empresa.nombre === empresa.nombre) {
                                return { ...empresa, estado: estado, sEstado: estado === 1 ? 'Activo' : 'Inactivo' };
                            }
                            return empresa;
                        });

                        setEmpresa(nuevasEmpresas);

                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualziar el estado.',
                            text: resultado.mensaje,
                        });
                    };

                } catch (error) {
                    Swal.fire("Error al asignar al usuario", "", "error");
                }
            }
        });
    };
*/}

    const handleEditarEmpresa = async () => {
        await obtenerEmpresas();
        abrirCerrarModalEditar();
    };

    const handleAgregarEmpresa = async () => {
        await obtenerEmpresas();
        abrirCerrarModalInsertar();
    };

    const columns = [
        { key: 'idEmpresa', header: 'Empresa' },
        { key: 'nombre', header: 'Nombre' },
        { key: 'estado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Administrar Empresas" />
                <div className="content">
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Crear Empresa</button>
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
                    <TableResponsive columns={columns} data={empresasFiltrados} openModal={openModal}  btnActionName={"Editar"} />
                    <Logout />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar Empresa"
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
                title="Editar Empresa"
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