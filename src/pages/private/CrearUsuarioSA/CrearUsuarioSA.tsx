/**
 * Página para crear cuentas de administradores.
 * Permite ver, filtrar y crear cuentas de administradores.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import { CambiarEstadoUsuario, ObtenerUsuariosAdministradores } from "../../../servicios/ServicioUsuario.ts";
import CrearCuentaAdministrador from "../../../components/crearcuentaadministrador/CrearCuentaAdministrador.tsx";
import EditarCuentaAdministrador from "../../../components/crearcuentaadministrador/EditarCuentaAdministrador.tsx";
import Swal from "sweetalert2";
import Topbar from "../../../components/topbar/Topbar.tsx";
/**
* Componente funcional que representa la página para crear cuentas de administradores.
*/
function CrearCuentaSA() {
  // Estado para controlar la apertura y cierre del modal de inserción
  const [modalInsertar, setModalInsertar] = useState(false);
  // Estado para controlar la apertura y cierre del modal de edición
  const [modalEditar, setModalEditar] = useState(false);
  // Estado para el filtro por identificación de usuario
  const [filtroIdentificacion, setFiltroIdentificacion] = useState('');
  // Estado para almacenar la información del usuario seleccionado
  const [selectedUsuario, setSelectedUsuario] = useState({
    identificacion: '',
    nombre: '',
    correo: '',
    idEmpresa: '',
  });
  // Estado para almacenar todos los usuarios administradores
  const [usuariosAdministradores, setUsuariosAdministradores] = useState<any[]>([]);
  // Estado para almacenar los usuarios administradores filtrados
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);


  // Funciones para manejar el estado del modal
  const openModal = (administrador: any) => {
    setSelectedUsuario(administrador);
    abrirCerrarModalEditar();
  };

  const abrirCerrarModalInsertar = () => {
    setModalInsertar(!modalInsertar);
  }

  const abrirCerrarModalEditar = () => {
    setModalEditar(!modalEditar);
  }

  useEffect(() => {
    obtenerUsuarios();
  }, []); // Ejecutar solo una vez al montar el componente

  // Función para obtener todos los usuarios administradores
  const obtenerUsuarios = async () => {
    try {
      const usuarios = await ObtenerUsuariosAdministradores();
      const usuariosConSEstado = usuarios.map((usuario: any) => ({
        ...usuario,
        sEstado: usuario.estado === 1 ? 'Activo' : 'Inactivo',
      }));
      setUsuariosAdministradores(usuariosConSEstado);
      setUsuariosFiltrados(usuariosConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
    } catch (error) {
      console.error('Error al obtener usuarios administradores:', error);
    }
  };

  useEffect(() => {
    filtrarUsuarios();
  }, [filtroIdentificacion, usuariosAdministradores]); // Ejecutar cada vez que el filtro o los datos originales cambien

  const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroIdentificacion(e.target.value);
  };

  // Función para filtrar los usuarios cada vez que cambie el filtro de identificación
  const filtrarUsuarios = () => {
    const usuariosFiltrados = filtroIdentificacion
      ? usuariosAdministradores.filter((usuario: any) =>
        usuario.identificacion.includes(filtroIdentificacion)
      )
      : usuariosAdministradores;
    setUsuariosFiltrados(usuariosFiltrados);
  };

  // Funcion para cambiar el estado de los administradores
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

  // Columnas de la tabla
  const columns = [
    { key: 'identificacion', header: 'Identificación' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'correo', header: 'Correo' },
    { key: 'empresa', header: 'Empresa' },
    { key: 'sEstado', header: 'Estado' },
    { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
  ];


  const handleEditarUsuario = async () => {
    // Lógica para editar el usuario
    // Después de editar exitosamente, actualiza la lista de usuarios administradores
    await obtenerUsuarios();
    abrirCerrarModalEditar();
  };

  const handleAgregarUsuario = async () => {
    // Lógica para editar el usuario
    // Después de editar exitosamente, actualiza la lista de usuarios administradores
    await obtenerUsuarios();
    abrirCerrarModalInsertar();
  };

  return (
    <Sidebar>
      <div className="main-container">
        <Topbar />
        <BordeSuperior text="Administradores" />
        <div className="content">
          {/* aca esta el boton para crear usuarios */}
          <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Crear Administrador</button>
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
          <TableResponsive columns={columns} data={usuariosFiltrados} openModal={openModal} toggleStatus={toggleStatus} btnActionName={"Editar"} />

        </div>
      </div>


      <Modal
        isOpen={modalInsertar}
        toggle={abrirCerrarModalInsertar}
        title="Insertar Administrador"
        onCancel={abrirCerrarModalInsertar}
      >
        <div className='form-container'>
          <div className='form-group'>
            <CrearCuentaAdministrador
              onAdd={handleAgregarUsuario}
            />  
          </div>
        </div>
      </Modal>


      <Modal
        isOpen={modalEditar}
        toggle={abrirCerrarModalEditar}
        title="Editar Administrador"
        onCancel={abrirCerrarModalEditar}
      >
        <div className='form-container'>
          <div className='form-group'>
            <EditarCuentaAdministrador
              identificacion={selectedUsuario.identificacion}
              nombre={selectedUsuario.nombre}
              email={selectedUsuario.correo}
              empresa={selectedUsuario.idEmpresa}
              onEdit={handleEditarUsuario}
            />
          </div>
        </div>
      </Modal>
    </Sidebar>
  )
}
export default CrearCuentaSA