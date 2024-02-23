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




function CrearCuentaSA() {

  const [modalInsertar, setModalInsertar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [filtroIdentificacion, setFiltroIdentificacion] = useState('')
  const abrirCerrarModalInsertar = () => {
    setModalInsertar(!modalInsertar);
  }


  const [selectedUsuario, setSelectedUsuario] = useState({
    identificacion: '',
    correo: '',
    idEmpresa: '',
  });



  const openModal = (administrador: any) => {
    setSelectedUsuario(administrador);
    abrirCerrarModalEditar();
  };




  const [usuariosAdministradores, setUsuariosAdministradores] = useState<any[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);

  useEffect(() => {
    obtenerUsuarios();
  }, []); // Ejecutar solo una vez al montar el componente

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

  const filtrarUsuarios = () => {
    const usuariosFiltrados = filtroIdentificacion
      ? usuariosAdministradores.filter((usuario: any) =>
        usuario.identificacion.includes(filtroIdentificacion)
      )
      : usuariosAdministradores;
    setUsuariosFiltrados(usuariosFiltrados);
  };

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


  const abrirCerrarModalEditar = () => {
    setModalEditar(!modalEditar);
  }

  const columns = [
    { key: 'identificacion', header: 'Identificación' },
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