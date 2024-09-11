import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import Swal from "sweetalert2";
import EditarRol from "../../../components/roles/EditarRol.tsx";
import CrearRol from "../../../components/roles/CrearRol.tsx";
import { IoAddCircleOutline } from "react-icons/io5";

function AdministrarRoles() {
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState({
        idParcela: '',
        idFinca: '',
        nombre: ''
    });

    const objetoPrueba =[  {
        descripcion: "Primer objeto de prueba",
        sEstado: "Activo",
      },
      {
        descripcion: "Segundo objeto de prueba",
        sEstado: "Activo",
      },
      {
        descripcion: "Tercer objeto de prueba",
        sEstado: "Inactivo",
      },]



    // Obtener datos iniciales
    // useEffect(() => {
    //     const obtenerFincas = async () => {
    //         try {
              
    //         } catch (error) {
    //             console.error('Error al obtener:', error);
    //         }
    //     };
    //     obtenerFincas();
    // }, []);


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFiltroDescripcion(value);
    };

   

    // Abrir/cerrar modal de inserción
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    // Abrir/cerrar modal de edición
    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    // Abrir modal de edición
    const openModal = (parcela: any) => {
        setSelectedParcela(parcela);
        abrirCerrarModalEditar();
    };

    // Cambiar estado de la parcela
    const toggleStatus = async (parcela: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado del rol?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // const datos = {
                    //     idParcela: parcela.idParcela,
                    // };
                    // const resultado = await CambiarEstadoParcelas(datos);
                    // if (parseInt(resultado.indicador) === 1) {
                    //     Swal.fire({
                    //         icon: 'success',
                    //         title: '¡Estado Actualizado! ',
                    //         text: 'Actualización exitosa.',
                    //     });
                    //     await obtenerParcelas();
                    // } else {
                    //     Swal.fire({
                    //         icon: 'error',
                    //         title: 'Error al actualizar el estado.',
                    //         text: resultado.mensaje,
                    //     });
                    // };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado del rol", "", "error");
                }
            }
        });
    };

    // Manejar la edición de parcela
    const handleEditarRol = async () => {
        //metodo que se llame en useeffect
        //await obtenerParcelas();
        abrirCerrarModalEditar();
    };

    // Manejar la inserción de parcela
    const handleAgregarRol = async () => {
         //metodo que se llame en useeffect
        //await obtenerParcelas();
        abrirCerrarModalInsertar();
    };

    // Configuración de columnas para la tabla
    const columns = [
        { key: 'descripcion', header: 'Descripción de Rol' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Administrar Roles" />
                <div className="content" >
                    <div className="filtro-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        
                        <div className="filtro-item" style={{ marginBottom: '15px' }}>
                            <label htmlFor="filtroNombre">Descripción:</label>
                            <input
                                type="text"
                                id="filtroNombre"
                                //value={/*filtroNombre*/}
                                onChange={handleChangeFiltro}
                                placeholder="Ingrese la descripcion"
                                className="form-control"
                                style={{ fontSize: '16px', padding: '10px', minWidth: '200px', marginTop: '0px' }}
                            />
                        </div>
                        <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear-style" style={{ marginLeft: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                        <IoAddCircleOutline size={27} />
                        <span style={{ marginLeft: '5px' }}>Crear Rol</span>
                        </button>
                    </div>
                    <TableResponsive columns={columns} data={objetoPrueba} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar Rol"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
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
                title="Editar Rol"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarRol
                            descripcion={"prueba"}
                            onEdit={handleEditarRol}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarRoles;