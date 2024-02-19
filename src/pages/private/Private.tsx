import { Navigate, Route } from "react-router-dom";
import { PrivateRoutes } from "../../models/routes";
import RoutesWithNotFound from "../../utilities/RoutesWithNotFound";
import { lazy } from "react";

const Dashboard = lazy(() => import('./Dashboard/Dashboard'))


function Private() {
    return (

        <RoutesWithNotFound>
            <Route path="/" element={<Navigate to={PrivateRoutes.DASHBOARD} />} />
            <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
        </RoutesWithNotFound>

    )
}

export default Private;