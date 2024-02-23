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




function AsignarUsuarios() {
  const [filtroIdentificacion, setFiltroIdentificacion] = useState('')
  const [modalAsignar, setModalAsignar] = useState(false);


  const abrirCerrarModalAsignar = () => {
    setModalAsignar(!modalAsignar);
  }



  const [selectedUsuario, setSelectedUsuario] = useState({
    identificacion: '',
    correo: '',
    idEmpresa: '',
    estado: 0,
    idParcela: 0,
    idFinca: 0
  });


  const openModalAsignar = (user: any) => {
    setSelectedUsuario(user);
    abrirCerrarModalAsignar();
  };


 

  const userState = useSelector((store: AppStore) => store.user);

  

  const [usuariosNoAsignados, setUsuariosNoAsignados] = useState<any[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);

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



  {/** 
  const toggleStatus = (user: any) => {
    Swal.fire({
      title: "Asignar",
      text: "¿Estás seguro de que deseas actualizar el estado del usuario: " + user.identificacion + "?",
      icon: "warning",
      showCancelButton: true, // Mostrar el botón de cancelar
      confirmButtonText: "Sí", // Texto del botón de confirmación
      cancelButtonText: "No" // Texto del botón de cancelar
    }).then(async (result) => {
      if (result.isConfirmed) {


        try {
          const estado = user.estado === 1 ? 0 : 1;
          const datos = {
            identificacion: user.identificacion,
            empresa: user.idEmpresa,
            idRol: 4,
            estado: estado,
            idFinca: selectedUsuario.idFinca,
            idParcela: selectedUsuario.idParcela
          };


          const resultado = await ActualizarAsignarUsuario(datos);

          if (parseInt(resultado.indicador) === 1) {
            const nuevosUsuarios = usuariosNoAsignados.map(usuario => {
              if (usuario.identificacion === user.identificacion) {
                return { ...usuario, estado: estado, sEstado: estado === 1 ? 'Activo' : 'Inactivo' };
              }
              return usuario;
            });

            setUsuariosNoAsignados(nuevosUsuarios);

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
  };*/}

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