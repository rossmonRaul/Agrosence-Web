import { useNavigate } from "react-router-dom";
import { UserKey, resetUser } from "../../redux/state/User"
import { clearSessionStorage } from "../../utilities"
import { PublicRoutes } from "../../models/routes";
import { useDispatch } from "react-redux";
import '../../css/Logout.css';
import Swal from "sweetalert2";
import { CerrarSesion } from "../../servicios/ServicioUsuario";

/**
 * Componente funcional para cerrar sesión de usuario.
 */
function Logout() {
    const navigate = useNavigate(); // Hook de react-router-dom para la navegación
    const dispatch = useDispatch(); // Hook de react-redux para despachar acciones

    /**
     * Función para manejar el evento de cierre de sesión.
     * Muestra un mensaje de confirmación antes de cerrar la sesión.
     */
    const logOut = async () => {
        Swal.fire({
            title: "Cerrar Sesión",
            text: "¿Estás seguro de que deseas cerrar la sesión?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Realizar la acción de cierre de sesión
                    await CerrarSesion();
                    clearSessionStorage(UserKey); // Limpiar el almacenamiento de sesión
                    dispatch(resetUser()); // Restablecer el estado del usuario
                    navigate(`/${PublicRoutes.LOGIN}`, { replace: true }); // Redirigir al usuario a la página de inicio de sesión
                } catch (error) {
                    // Manejar cualquier error que ocurra al cerrar la sesión
                    console.error("Error al cerrar sesión:", error);
                    // Mostrar un mensaje de error al usuario
                    Swal.fire({
                        title: "Error",
                        text: "Ocurrió un error al cerrar sesión. Por favor, inténtalo de nuevo más tarde.",
                        icon: "error",
                        confirmButtonText: "Aceptar"
                    });
                }
            }
        });
    };

    return <button className="btn-cerrar-sesion" onClick={logOut}>Cerrar Sesión</button>;
}

export default Logout;
