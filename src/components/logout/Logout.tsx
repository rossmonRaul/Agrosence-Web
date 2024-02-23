import { useNavigate } from "react-router-dom";
import { UserKey, resetUser } from "../../redux/state/User"
import { clearSessionStorage } from "../../utilities"
import { PublicRoutes } from "../../models/routes";
import { useDispatch } from "react-redux";
import '../../css/Logout.css';
import Swal from "sweetalert2";

function Logout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const logOut = () => {

        Swal.fire({
            title: "Cerrar Sesión",
            text: "¿Estás seguro de que deseas cerrar la sesión?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then((result) => {
            if (result.isConfirmed) {
                clearSessionStorage(UserKey);
                dispatch(resetUser());
                navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
            }
        });
        
    };

    return <button className="btn-cerrar-sesion" onClick={logOut}>Log Out</button>;
}

export default Logout;