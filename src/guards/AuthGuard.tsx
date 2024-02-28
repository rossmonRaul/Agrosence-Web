import { useSelector } from "react-redux"
import { AppStore } from "../redux/Store"
import { Navigate, Outlet } from "react-router-dom";
import { PrivateRoutes, PublicRoutes } from "../models/routes";

/**
 * Propiedades esperadas por el componente AuthGuard.
 */
interface Props {
    privateValidation: boolean;  // Indica si se requiere validación privada
}

// Fragmento para renderizar las rutas privadas.
const PrivateValidationFragment = <Outlet />;

// Fragmento para redirigir a la página de inicio de sesión en caso de no haber iniciado sesión.
const PublicValidationFragment = <Navigate replace to={PrivateRoutes.PRIVATE} />;

// Componente que actúa como guardia de autenticación para las rutas privadas
export const AuthGuard = ({ privateValidation }: Props) => {
     // Obtener el estado del usuario desde Redux
    const userState = useSelector((store: AppStore) => store.user);

    // Renderizar la página de inicio de sesión si el usuario no ha iniciado sesión
    return userState.identificacion ? (
        // Renderizar la validación privada o el fragmento público 
        privateValidation ? (
            PrivateValidationFragment
        ) : (
            PublicValidationFragment 
        )
    ) : (
        <Navigate replace to={PublicRoutes.LOGIN} />
    );
};

export default AuthGuard