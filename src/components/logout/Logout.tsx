import { useNavigate } from "react-router-dom";
import { UserKey, resetUser } from "../../redux/state/User"
import { clearLocalStorage } from "../../utilities"
import { PublicRoutes } from "../../models/routes";
import { useDispatch } from "react-redux";

function Logout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const logOut = () => {
        clearLocalStorage(UserKey);
        dispatch(resetUser());
        navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
    };

    return <button onClick={logOut}>Log Out</button>;
}

export default Logout;