import { useSelector } from "react-redux";
import { AppStore } from "../redux/Store";
import { PrivateRoutes, Roles } from "../models";
import { Navigate, Outlet } from "react-router-dom";

// Propiedades esperadas por el componente RolGuard.
interface Props {
    rol: Roles; //  Rol requerido para acceder a la ruta protegida
};

// Componente que actúa como guardia de rol para las rutas protegidas.
function RolGuard({ rol }: Props){
    // Obtener el estado del usuario desde Redux
    const userState = useSelector((store: AppStore) => store.user);
    // Renderizar la página solicitada si el usuario tiene el rol necesario
    return userState.idRol === rol ? <Outlet /> : <Navigate replace to={PrivateRoutes.PRIVATE}/>;
}

export default RolGuard;