import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import { CambiarEstadoUsuarioFincaParcela, ObtenerUsuariosAsignados } from "../../../servicios/ServicioUsuario.ts";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";
import Modal from "../../../components/modal/Modal.tsx";
import AsignarFincaParcela from "../../../components/asignarfincaparcela/AsignarFincaParcela.tsx";
import AsignarFincaParcelaUsuario from "../../../components/asignarfincaparcela/AsignarFincaParcelaUsuario.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";




function AsignarParcelaFinca() {
    const [filtroIdentificacion, setFiltroIdentificacion] = useState('')
    const userLoginState = useSelector((store: AppStore) => store.user);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalAsignar, setModalAsignar] = useState(false);


    const abrirCerrarModalAsignar = () => {
        setModalAsignar(!modalAsignar);
    }


    const [selectedUsuario, setSelectedUsuario] = useState({
        identificacion: '',
        correo: '',
        idEmpresa: '',
        idParcela: '',
        idFinca: '',
        idUsuarioFincaParcela: ''
    });

    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    }


    const openModal = (usuario: any) => {
        setSelectedUsuario(usuario);
        abrirCerrarModalEditar();
    };


    const [usuariosAsignados, setUsuariosAsignados] = useState<any[]>([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);

    useEffect(() => {
        obtenerUsuarios();
    }, []); // Ejecutar solo una vez al montar el componente

    const obtenerUsuarios = async () => {
        try {
            const datos = {
                idEmpresa: userLoginState.idEmpresa
            }
            const usuarios = await ObtenerUsuariosAsignados(datos);
            const usuariosConSEstado = usuarios.map((usuario: any) => ({
                ...usuario,
                sEstado: usuario.estado === 1 ? 'Activo' : 'Inactivo',
            }));
            setUsuariosAsignados(usuariosConSEstado);
            setUsuariosFiltrados(usuariosConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
        }
    };

    useEffect(() => {
        filtrarUsuarios();
    }, [filtroIdentificacion, usuariosAsignados]); // Ejecutar cada vez que el filtro o los datos originales cambien

    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroIdentificacion(e.target.value);
    };

    const filtrarUsuarios = () => {
        const usuariosFiltrados = filtroIdentificacion
            ? usuariosAsignados.filter((usuario: any) =>
                usuario.identificacion.includes(filtroIdentificacion)
            )
            : usuariosAsignados;
        setUsuariosFiltrados(usuariosFiltrados);
    };



    const toggleStatus = (user: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado de la asignacion del usuario: " + user.identificacion + "?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then(async (result) => {
            if (result.isConfirmed) {


                try {
                    
                    const datos = {
                        identificacion: user.identificacion,
                        idUsuario: user.idUsuarioFincaParcela,
                        idFinca: user.idFinca,
                        idParcela: user.idParcela
                    };


                    const resultado = await CambiarEstadoUsuarioFincaParcela(datos);

                    if (parseInt(resultado.indicador) === 1) {
                       

                        await obtenerUsuarios();

                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
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


    const handleEditarUsuario = async () => {
        // Lógica para editar el usuario
        // Después de editar exitosamente, actualiza la lista de usuarios administradores
        await obtenerUsuarios();
        abrirCerrarModalEditar();
    };

    const handleAsignar = async () => {
        await obtenerUsuarios();
        abrirCerrarModalAsignar();
    };

    const columns = [
        { key: 'identificacion', header: 'Identificación' },
        { key: 'empresa', header: 'Empresa' },
        { key: 'sEstado', header: 'Estado Asignación' },
        { key: 'nombreFinca', header: 'Finca' },
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
    ];



    return (
        <Sidebar>
            <div className="main-container">
                <Topbar/>
                <BordeSuperior text="Asignar Finca y Parcela" />
                <div className="content">
                <button onClick={() => abrirCerrarModalAsignar()} className="btn-crear">Asignar Finca y Parcela</button>
                    <div className="filtro-container">
                        <label htmlFor="filtroIdentificacion">Filtrar por identificación:</label>
                        <input
                            type="text"
                            id="filtroIdentificacion"
                            value={filtroIdentificacion}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese la identificación"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={usuariosFiltrados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar "} />
 
                </div>
            </div>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Finca y Parcela"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <AsignarFincaParcela
                            idFinca={parseInt(selectedUsuario.idFinca)}
                            idEmpresa={parseInt(selectedUsuario.idEmpresa)}
                            identificacion={selectedUsuario.identificacion}
                            onEdit={handleEditarUsuario}
                            idUsuarioFincasParcelas={parseInt(selectedUsuario.idUsuarioFincaParcela)}
                        />
                    </div>
                </div>
            </Modal>


            <Modal
                isOpen={modalAsignar}
                toggle={abrirCerrarModalAsignar}
                title="Asignar Finca y Parcela"
                onCancel={abrirCerrarModalAsignar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <AsignarFincaParcelaUsuario
                            onAdd={handleAsignar}
                            idEmpresa= {userLoginState.idEmpresa}
                        />
                    </div>
                </div>
            </Modal>

        </Sidebar>


    )
}
export default AsignarParcelaFinca