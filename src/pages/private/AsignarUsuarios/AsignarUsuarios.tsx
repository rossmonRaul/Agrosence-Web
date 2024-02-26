/**
 * Página para asignar usuarios a empresas.
 * Permite ver, filtrar y asignar usuarios a empresas, fincas y parcelas.
 */
import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'
import '../../../css/Modal.css'
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import { ObtenerUsuariosSinAsignar } from "../../../servicios/ServicioUsuario.ts";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store.ts";
import Topbar from "../../../components/topbar/Topbar.tsx";
import Modal from "../../../components/modal/Modal.tsx" 
import AsignarEmpresa from "../../../components/asignarempresa/AsignarEmpresa.tsx";

/**
 * Componente funcional que representa la página para asignar usuarios a empresas.
 */
function AsignarUsuarios() {
   // Estado para el filtro por identificación de usuario
   const [filtroIdentificacion, setFiltroIdentificacion] = useState('')
   // Estado para controlar la apertura y cierre del modal de asignación
   const [modalAsignar, setModalAsignar] = useState(false);
   // Estado para almacenar la información del usuario seleccionado para asignar
   const [selectedUsuario, setSelectedUsuario] = useState({
     identificacion: '',
     correo: '',
     idEmpresa: '',
     estado: 0,
     idParcela: 0,
     idFinca: 0
   });
   // Estado para almacenar el estado de sesión del usuario
   const userState = useSelector((store: AppStore) => store.user);
   // Estado para almacenar todos los usuarios no asignados
   const [usuariosNoAsignados, setUsuariosNoAsignados] = useState<any[]>([]);
   // Estado para almacenar los usuarios no asignados filtrados
   const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);


  const abrirCerrarModalAsignar = () => {
    setModalAsignar(!modalAsignar);
  }


  const openModalAsignar = (user: any) => {
    setSelectedUsuario(user);
    abrirCerrarModalAsignar();
  };



 // Obtener los usuarios no asignados al cargar la página
  useEffect(() => {
    obtenerUsuarios();
  }, []); // Ejecutar solo una vez al montar el componente

  const obtenerUsuarios = async () => {
    try {
      const usuarios = await ObtenerUsuariosSinAsignar();
      const usuariosConSEstado = usuarios.map((usuario: any) => ({
        ...usuario,
        sEstado: usuario.estado === 1 ? 'Activo' : 'Inactivo',
      }));
      setUsuariosNoAsignados(usuariosConSEstado);
      setUsuariosFiltrados(usuariosConSEstado); // Inicialmente, los datos filtrados son los mismos que los datos originales
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  useEffect(() => {
    filtrarUsuarios();
  }, [filtroIdentificacion, usuariosNoAsignados]); // Ejecutar cada vez que el filtro o los datos originales cambien

  const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroIdentificacion(e.target.value);
  };

  const filtrarUsuarios = () => {
    const usuariosFiltrados = filtroIdentificacion
      ? usuariosNoAsignados.filter((usuario: any) =>
        usuario.identificacion.includes(filtroIdentificacion)
      )
      : usuariosNoAsignados;
    setUsuariosFiltrados(usuariosFiltrados);
  };

  const handleAsignar = async () => {
    await obtenerUsuarios();
    abrirCerrarModalAsignar();
  };

  const columns = [
    { key: 'identificacion', header: 'Identificación' },
    { key: 'correo', header: 'Correo' },
    { key: 'sEstado', header: 'Estado' },
    { key: 'acciones', header: 'Acciones', actions: true } // Columna para acciones
  ];

  return (
    <Sidebar>
      <div className="main-container">
        <Topbar />
        <BordeSuperior text="Asignar Usuarios" />
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
          <TableResponsive columns={columns} data={usuariosFiltrados} openModal={openModalAsignar} btnActionName={"Asignar"} />

        </div>
      </div>

      <Modal
        isOpen={modalAsignar}
        toggle={abrirCerrarModalAsignar}
        title="Asignar Finca y Parcela"
        onCancel={abrirCerrarModalAsignar}
      >
        <div className='form-container'>
          <div className='form-group'>
            <AsignarEmpresa
              onEdit={handleAsignar}
              idEmpresa= {userState.idEmpresa} 
              identificacion={selectedUsuario.identificacion}            
              />
          </div>
        </div>
      </Modal>
    </Sidebar>
  )
}
export default AsignarUsuarios