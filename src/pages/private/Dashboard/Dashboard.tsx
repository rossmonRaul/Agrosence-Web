
import { Logout } from "../../../components/logout"
import Sidebar from "../../../components/sidebar/Sidebar"
import '../../../css/AdministacionAdministradores.css'

 


function Dashboard() {
 

  
  return (
  <Sidebar>
    
    <div className="main-container">
    
    <div className="content">

     
        <Logout />
     
    </div>
  </div>
  </Sidebar>
  )
}
export default Dashboard