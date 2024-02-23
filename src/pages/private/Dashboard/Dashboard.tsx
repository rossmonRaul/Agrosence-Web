
import { useSelector } from "react-redux";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior"
import Sidebar from "../../../components/sidebar/Sidebar"
import Topbar from "../../../components/topbar/Topbar"
import '../../../css/AdministacionAdministradores.css'
import { AppStore } from "../../../redux/Store";


function Dashboard() {
  const userState = useSelector((store: AppStore) => store.user);

  let dashboardContent: JSX.Element;

  // Determinar qué contenido mostrar según el rol del usuario, aca irian los componentes para cada daschboard (comunidad), sin embargp
  // para dar el ejemplo voy a poner html en su lugar
  switch (userState.idRol) {
    case 1:
      dashboardContent = 
      <div><Sidebar>
        <div className="main-container">
          <Topbar />
          <BordeSuperior text="Dashboard Super Usuario" />
          <div className="content">
          </div>
        </div>
      </Sidebar>
      </div>;
      break;
    case 2:
      dashboardContent = <div><Sidebar>
        <div className="main-container">
          <Topbar />
          <BordeSuperior text="Dashboard Administrador" />
          <div className="content">
          </div>
        </div>
      </Sidebar>
      </div>;
      break;
    case 3:
      dashboardContent = <div><Sidebar>
        <div className="main-container">
          <Topbar />
          <BordeSuperior text="Comunidad" />
          <div className="content">
          </div>
        </div>
      </Sidebar>
      </div>;
      break;
    case 4:
      dashboardContent = <div><Sidebar>
        <div className="main-container">
          <Topbar />
          <BordeSuperior text="Comunidad" />
          <div className="content">
          </div>
        </div>
      </Sidebar>
      </div>;
      break;
    default:
      dashboardContent = <div>No se encontró un dashboard para este rol de usuario.</div>;
      break;
  }


  return (
    <div>
      {dashboardContent}
    </div>
  )
}
export default Dashboard