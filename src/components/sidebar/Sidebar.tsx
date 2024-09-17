import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaAngleRight, FaAngleDown } from "react-icons/fa";
import '../../css/Sidebar.css';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import { resetUser } from '../../redux/state/User';
import { useNavigate } from 'react-router-dom';
import { PublicRoutes } from '../../models';
import { ObtenerAccesoMenuPorRol } from '../../servicios/ServicioUsuario';
import Swal from 'sweetalert2';


/**
 * Definición de la interfaz para los elementos del menú.
 */

const isTokenExpired = (token: string | null) => {
    if (!token) return true;
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const tokenExpiration = tokenData.exp * 1000;
    const currentTime = new Date().getTime();
    return currentTime >= tokenExpiration;
};
// Componente Sidebar que muestra un menú lateral.
const Sidebar = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(() => {
        const savedState = localStorage.getItem('sidebarState');
        return savedState ? JSON.parse(savedState) : false;
    });

    const toggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        localStorage.setItem('sidebarState', JSON.stringify(newState));
    };

    // Estado para controlar la apertura y cierre de los elementos secundarios del menú
    const [submenuOpen, setSubmenuOpen] = useState<{ [path: string]: boolean }>(() => {
        const savedState = localStorage.getItem('submenuState');
        return savedState ? JSON.parse(savedState) : {};
    });

    // Funcion para manejar la expancion del sidebar
    const toggleSubmenu = (path: string) => {
        const newState = { [path]: !submenuOpen[path] };
        setSubmenuOpen(newState);
        localStorage.setItem('submenuState', JSON.stringify(newState));
    };

    const navigate = useNavigate();

    const userToken = localStorage.getItem('token');

    const [menuItems, setMenu] = useState<any[]>([]);

    const ObtenerMenu = async () => {
        const menu = await ObtenerAccesoMenuPorRol({idRol: (userState.idRol)});

        const url = location.pathname;

        // Validar si rol tiene acceso
        if(menu.filter((x: { path: any; }) => x.path === url).length < 1){
            navigate('/private/dashboard');
        }

        if(!menu){
            Swal.fire({
                icon: 'error',
                title: 'Error con el servicio',
                text: "Ocurrió un error al contactar con el servicio",
            });
        }
        else{        
            const menuCategorizado: any = {};

            // Opciones sin submenú
            menu.forEach((item: any) => {
                if (item.name === item.nombreCategoria) {
                    menuCategorizado[item.nombreCategoria] = {
                        ...menuCategorizado[item.nombreCategoria],
                        title: item.nombreCategoria,
                        icon: item.iconCategoria,
                        target: item.pathCategoria,
                        items: []
                    };
                }
            });

			// Opciones con submenú
            menu.forEach((item: any) => {
                if (item.name !== item.nombreCategoria) {
                    if (!menuCategorizado[item.nombreCategoria]) {
                        menuCategorizado[item.nombreCategoria] = {
                            title: item.nombreCategoria,
                            icon: item.iconCategoria,
                            target: item.pathCategoria,
                            items: []
                        };
                    }

                    menuCategorizado[item.nombreCategoria].items.push({
                        title: item.name,
                        target: item.path,
                        icon: item.icon,
                    });
                }
            });    

            setMenu(menuCategorizado);
        }
    };

    useEffect(() => {      
        if (isTokenExpired(userToken)) {
            localStorage.removeItem('token');
            resetUser()
            navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
        }

        ObtenerMenu();

    }, [userToken, history]);

    useEffect(() => {
        // Prevenir navegación hacia atrás
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);
   
        return () => {
          window.removeEventListener('popstate', handlePopState);
        };
      }, []);

    const handlePopState = () => {
        // Forzar la navegación hacia el dashboard o alguna otra ruta
        navigate('/private/dashboard', { replace: true });
    };

    // Obtener el estado del usuario del almacenamiento Redux
    
    const userState = useSelector((store: AppStore) => store.user);
    
    // const hasAccess = localStorage.getItem('sidebarState');
    // Lógica condicional para renderizar o redirigir
    // if (!hasAccess) {
    //     if(localStorage.getItem('contadorSesion')=='1'){
    //         navigate('/private/dashboard', { replace: true });
    //     }else{
    //         localStorage.setItem('contadorSesion', '1');
    //     }
    //     //return <Navigate to="/private/dashboard" replace />;
    //     //navigate('/pagina-de-acceso-denegado');
    //     //window.location.href = 'http://127.0.0.1:5173/private/dashboard';
        
    // }

    return (
        <div style={{ marginLeft: isOpen ? "200px" : "83px" }} className="container">

            <div style={{ width: isOpen ? "200px" : "83px", overflowY: "auto", overflowX: "hidden"}} className="sidebar">
                <div className="top-section">
                    {/* <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">Logo</h1> */}
                    <img src='/AGROSENSER.png' style={{display: isOpen ? "block" : "none", width:'100px', height:'100px'}}></img>
                    <div style={{ marginLeft: isOpen ? "40px" : "0px" }} className="bars">
                        <FaBars onClick={toggle} />
                    </div>
                </div>                
                <>
                {Object.keys(menuItems).map((categoria: any, index) => (
                    <div key={index}>
                        {menuItems[categoria].items.length === 0 ? (
                            // NavItem sin submenú
                            <NavLink to={menuItems[categoria].target} className={`link ${location.pathname === menuItems[categoria].target ? 'active' : ''}`}>
                                <div className="icon">
                                    <img src={menuItems[categoria].icon} style={{ width: '30px' }} />
                                </div>
                                <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{menuItems[categoria].title}</div>
                            </NavLink>
                        ) : (
                            <>
                                {/* Categoría con submenú */}
                                <div onClick={() => toggleSubmenu(menuItems[categoria].target)} className={`link ${location.pathname === menuItems[categoria].target ? 'active' : ''}`}>
                                    <div className="icon">
                                        <img src={menuItems[categoria].icon} style={{ width: '30px' }} />
                                    </div>
                                    <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{menuItems[categoria].title}</div>
                                    <div className="arrow">{submenuOpen[menuItems[categoria].target] ? <FaAngleDown /> : <FaAngleRight />}</div>
                                </div>
                                
                                {submenuOpen[menuItems[categoria].target] && (
                                    <div className="sub-menu">
                                        {menuItems[categoria].items.map((subItem: any, subIndex: any) => (
                                            <NavLink key={subIndex} to={subItem.target} className={`link ${location.pathname === subItem.target ? 'active' : ''}`}>
                                                <div className="icon">
                                                    <img src={subItem.icon} style={{ width: '30px' }} />
                                                </div>
                                                <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{subItem.title}</div>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </>
            </div>
            <main>{children}</main>
        </div>
    );
};

export default Sidebar;

