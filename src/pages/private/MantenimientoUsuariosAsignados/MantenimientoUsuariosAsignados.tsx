/**
 * Página para el mantenimiento de usuarios asignados.
 * Permite ver, filtrar y editar usuarios asignados.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import {  CambiarEstadoUsuario, ObtenerUsuariosPorEmpresa } from "../../../servicios/ServicioUsuario.ts";
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
import CambiarContrasenaAsignados from "../../../components/cambiarcontrasenaasignados/CambiarContrasenaAsignados.tsx";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";
import AsignacionesUsuarios from "../../../components/asignacionesusuario/AsignacionesUsuarios.tsx";

/**
 * Componente funcional que representa la página de mantenimiento de usuarios asignados.
 */
function MantenimientoUsuariosAsignados() {
  // Estado para controlar la apertura y cierre del modal de edición
  const [modalEditar, setModalEditar] = useState(false);
  // Estado para controlar la apertura y cierre del modal de asignaciones
  const [modalAsignar, setModalAsignar] = useState(false);
  // Estado para el filtro por identificación de usuario
  const [filtroIdentificacion, setFiltroIdentificacion] = useState('');
  // Estado para almacenar la información del usuario seleccionado
  const [selectedUsuario, setSelectedUsuario] = useState({
    identificacion: '',
    correo: '',
    idEmpresa: '',
  });
  // Estado para almacenar todos los usuarios asignados
  const [usuariosAsignados, setUsuariosAsignados] = useState<any[]>([]);
  // Estado para almacenar los usuarios asignados filtrados
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);
  // Estado para obtener el estado del usuario que inició sesión
  const userLoginState = useSelector((store: AppStore) => store.user);

  // Funciones para manejar el estado de los modales
  const openModal = (usuario: any) => {
    setSelectedUsuario(usuario);
    abrirCerrarModalEditar();
  };

  const abrirCerrarModalEditar = () => {
    setModalEditar(!modalEditar);
  }

  const openModalAsignar = (usuario: any) => {
    setSelectedUsuario(usuario);
    abrirCerrarModalAsignar();
  };

  const abrirCerrarModalAsignar= () => {
    setModalAsignar(!modalAsignar);
  }

  useEffect(() => {
    obtenerUsuarios();
  }, []); // Ejecutar solo una vez al montar el componente

  // Función para obtener todos los usuarios asignados
  const obtenerUsuarios = async () => {
    try {
      const datos={
        idEmpresa: userLoginState.idEmpresa,
      }
      const usuarios = await ObtenerUsuariosPorEmpresa(datos);
      const usuariosConSEstado = usuarios.map((usuario: any) => ({
        ...usuario,
        sEstado: usuario.estado === 1 ? 'Activo' : 'Inactivo',
      }));
      setUsuariosAsignados(usuariosConSEstado);
      setUsuariosFiltrados(usuariosConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
    } catch (error) {
      console.error('Error al obtener usuarios Asignados:', error);
    }
  };

  useEffect(() => {
    filtrarUsuarios();
  }, [filtroIdentificacion, usuariosAsignados]); // Ejecutar cada vez que el filtro o los datos originales cambien

  const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroIdentificacion(e.target.value);
  };

  // Función para filtrar los usuarios cada vez que cambie el filtro de identificación
  const filtrarUsuarios = () => {
    const usuariosFiltrados = filtroIdentificacion
      ? usuariosAsignados.filter((usuario: any) =>
        usuario.identificacion.includes(filtroIdentificacion)
      )
      : usuariosAsignados;
    setUsuariosFiltrados(usuariosFiltrados);
  };

  // Función para cambiar el estado de un usuario
  const toggleStatus = async (user: any) => {
    Swal.fire({
      title: "Actualizar",
      text: "¿Estás seguro de que deseas actualizar el estado del usuario: " + user.identificacion + "?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const datos = {
            identificacion: user.identificacion,
          };
          const resultado = await CambiarEstadoUsuario(datos);
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

  

  // Columnas de la tabla
  const columns = [
    { key: 'identificacion', header: 'Identificación' },
    { key: 'correo', header: 'Correo' },
    { key: 'sEstado', header: 'Estado' },
    { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
  ];

  const handleEditarUsuario = async () => {
    // Después de editar exitosamente, actualiza la lista de usuarios Asignados
    await obtenerUsuarios();
    abrirCerrarModalEditar();
  };

  return (
    <Sidebar>
      <div className="main-container">
        <Topbar />
        <BordeSuperior text="Mantenimiento Usuarios Asignados" />
        <div className="content">
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
          <TableResponsive columns={columns} data={usuariosFiltrados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} 
          toggleOptionalStatus={openModalAsignar} btnToggleOptionalStatus={'Asignaciones'} propClassNameOpcional={'Asignar'}/>
        </div>
      </div>

      <Modal
        isOpen={modalEditar}
        toggle={abrirCerrarModalEditar}
        title="Editar Usuario"
        onCancel={abrirCerrarModalEditar}
      >
        <div className='form-container'>
          <div className='form-group'>
            <CambiarContrasenaAsignados
              identificacion={selectedUsuario.identificacion}
              onEdit={handleEditarUsuario}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalAsignar}
        toggle={abrirCerrarModalAsignar}
        title="Editar Asignaciones"
        onCancel={abrirCerrarModalAsignar}
      >
        <div className='form-container'>
          <div className='form-group'>
            <AsignacionesUsuarios
              identificacion={selectedUsuario.identificacion}
              idEmpresa={userLoginState.idEmpresa}
            />
          </div>
        </div>
      </Modal>
    </Sidebar>
  )
}
export default MantenimientoUsuariosAsignados