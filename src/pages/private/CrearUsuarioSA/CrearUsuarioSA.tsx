import { useEffect, useState } from "react";
import { Logout } from "../../../components/logout"
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx"
import { ObtenerUsuariosAdministradores } from "../../../servicios/ServicioUsuario.ts";
import CrearCuentaAdministrador from "../../../components/crearcuentaadministrador/CrearCuentaAdministrador.tsx";
import EditarCuentaAdministrador from "../../../components/crearcuentaadministrador/EditarCuentaAdministrador.tsx";




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

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const usuarios = await ObtenerUsuariosAdministradores();
        // Aplicar filtro de identificación si hay un valor
        const usuariosFiltrados = filtroIdentificacion
          ? usuarios.filter((usuario: any) => usuario.identificacion.includes(filtroIdentificacion))
          : usuarios;
        setUsuariosAdministradores(usuariosFiltrados);
      } catch (error) {
        console.error('Error al obtener usuarios administradores:', error);
      }
    };



    obtenerUsuarios();
  }, [filtroIdentificacion]);

  const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroIdentificacion(e.target.value);
  };

  const toggleStatus = () => {

  };

  const abrirCerrarModalEditar = () => {
    setModalEditar(!modalEditar);
  }

  const columns = [
    { key: 'identificacion', header: 'Identificacion' },
    { key: 'correo', header: 'Correo' },
    { key: 'idEmpresa', header: 'Empresa' },
    { 
      key: 'estado', 
      header: 'Estado', 
      render: (value: number) => (value === 0 ? 'Activo' : 'Inactivo')
    },
    { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
  ];



  return (
    <Sidebar>
      <div className="main-container">
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
          <TableResponsive columns={columns} data={usuariosAdministradores} openModal={openModal} toggleStatus={toggleStatus} />
          <Logout />
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
            <CrearCuentaAdministrador  />
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
            identificacion = {selectedUsuario.identificacion}
            correo = {selectedUsuario.correo}
            empresa = {selectedUsuario.idEmpresa}
            />
          </div>
        </div>
      </Modal>
    </Sidebar>
  )
}
export default CrearCuentaSA