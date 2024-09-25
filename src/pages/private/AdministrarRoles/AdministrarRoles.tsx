import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsiveState from "../../../components/table/tableDeactivate.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import Swal from "sweetalert2";
import EditarRol from "../../../components/roles/EditarRol.tsx";
import CrearRol from "../../../components/roles/CrearRol.tsx";
import { ObtenerRoles } from '../../../servicios/ServicioUsuario';
import { CambiarEstadoRol } from '../../../servicios/ServicioUsuario';
import { IoAddCircleOutline } from "react-icons/io5";

function AdministrarRoles() {
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRol, setSelectedRol] = useState({
        idRol: 0,
        nombreRol: '',
        permisoAgregar: false,
        permisoActualizar: false,
        permisoEliminar: false
    });

    const obtenerRegistros = async (nombreFiltro?: string) => {

        const obj = await ObtenerRoles();

        let roles = await obj.map((r: any) => ({
            ...r,
            sEstado: r.estado === true ? 'Activo' : 'Inactivo',
        }));

        roles = roles.filter((x: { idRol: number; }) => x.idRol !== 1);

        if(nombreFiltro)
            setRoles(roles.filter((x: { rol: string; }) => x.rol.toUpperCase().includes(nombreFiltro.toUpperCase())));
        else
            setRoles(roles); 
    };

    // Obtener datos iniciales
    useEffect(() => {
        obtenerRegistros();
    }, []);


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        obtenerRegistros(value);
    };   

    // Abrir/cerrar modal de inserción
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    // Abrir/cerrar modal de edición
    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
        obtenerRegistros();
    };

    // Abrir modal de edición
    const openModal = (rol: any) => {

        setSelectedRol({
            idRol: rol.idRol, 
            nombreRol: rol.rol,
            permisoAgregar: rol.permisoAgregar,
            permisoActualizar: rol.permisoActualizar,
            permisoEliminar: rol.permisoEliminar
        });

        abrirCerrarModalEditar();
    };

    // Cambiar estado del rol
    const toggleStatus = async (rol: any) => {
        Swal.fire({
            title: "Cambiar estado",
            text: "¿Estás seguro de que deseas actualizar el estado del rol "+rol.rol+"?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idRol: rol.idRol,
                    };

                    const resultado = await CambiarEstadoRol(datos);
                    
                    if (parseInt(resultado[0].indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerRegistros();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: 'Ocurrió un error al contactar con el servicio',
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado del rol", "", "error");                    
                }
            }
        });
    };

    // Manejar la edición de rol
    const handleEditarRol = async () => {
        //metodo que se llame en useeffect
        abrirCerrarModalEditar();
    };

    // Manejar la inserción de rol
    const handleAgregarRol = async () => {
         //metodo que se llame en useeffect
        abrirCerrarModalInsertar();
        obtenerRegistros();
    };

    // Configuración de columnas para la tabla
    const columns = [
        { key: 'rol', header: 'Rol' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Administrar roles" />
                <div className="content" >
                    <div className="filtro-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>                        
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>
                            <label htmlFor="filtroNombre">Rol:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese el nombre"
                                className="form-control"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px',backgroundColor: '#548454', color: 'white', borderColor: '#548454' }}>
                        <IoAddCircleOutline size={27} />
                        <span style={{ marginLeft: '5px' }}>Crear rol</span>
                        </button>
                    </div>
                    <TableResponsiveState columns={columns} data={roles} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Crear rol"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'style={{ width: '85%' }}>
                    <div className='form-group'>
                        <CrearRol
                            onAdd={handleAgregarRol}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar rol"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container' style={{ width: '85%' }}>
                    <div className='form-group'>
                        <EditarRol
                            rol={selectedRol}
                            onEdit={handleEditarRol}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarRoles;