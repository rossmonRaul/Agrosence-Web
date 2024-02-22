
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior"
import { Logout } from "../../../components/logout"
import Sidebar from "../../../components/sidebar/Sidebar"
import Topbar from "../../../components/topbar/Topbar"
import '../../../css/AdministacionAdministradores.css'


function Dashboard() {
  return (
    <Sidebar>
      <div className="main-container">
        <Topbar />
        <BordeSuperior text="Dashboard" />
        <div className="content">
          <Logout />
        </div>
      </div>
    </Sidebar>
  )
}
export default Dashboard