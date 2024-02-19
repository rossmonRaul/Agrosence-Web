import { useSelector } from "react-redux";
import { AppStore } from "../redux/Store";
import { PrivateRoutes, Roles } from "../models";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
    rol: Roles;
}

function RolGuard({ rol }: Props){
    const userState = useSelector((store: AppStore) => store.user);
    return userState.idRol === rol ? <Outlet /> : <Navigate replace to={PrivateRoutes.PRIVATE}/>;
}

export default RolGuard;