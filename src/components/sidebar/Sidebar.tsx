import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaUserAlt, FaTh, FaUserCog, FaAngleRight, FaAngleDown } from "react-icons/fa";
import '../../css/Sidebar.css';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import { IoBusiness } from 'react-icons/io5';

/**
 * Definición de la interfaz para los elementos del menú.
 */
interface MenuItem {
    path: string;
    name: string;
    icon?: JSX.Element;
    roles?: number[];
    children?: MenuItem[]; // Para elementos colapsables
}

// Componente Sidebar que muestra un menú lateral.
const Sidebar = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    // Estado para controlar la apertura y cierre de los elementos secundarios del menú
    const [submenuOpen, setSubmenuOpen] = useState<{ [path: string]: boolean }>({});

    // Funcion para manejar la expancion del sidebar
    const toggleSubmenu = (path: string) => {
        setSubmenuOpen(prevState => ({
            ...prevState,
            [path]: !prevState[path]
        }));
    };

    // Items que se desean que tenga el menu
    const menuItem: MenuItem[] = [
        {
            path: "/",
            name: "Dashboard",
            icon: <FaTh />,
            roles: [1, 2, 3, 4]
        },
        {
            path: "/administrarempresas",
            name: "Empresas",
            icon: <IoBusiness />,
            roles: [1]
        },
        {
            path: "/usuariosadmin",
            name: "Administradores",
            icon: <FaUserAlt />,
            roles: [1]
        },
        {
            path: "/administrarusuariosasignados",
            name: "Usuarios Asignados",
            icon: <FaUserCog />,
            roles: [2]
        },

        {
            path: "/administrarfincas",
            name: "Fincas",
            icon: <img src='/field.png' style={{ width: '22px' }} />,
            roles: [2]
        },

        {
            path: "/administrarparcelas",
            name: "Parcelas",
            icon: <img src='/tractor.png' style={{ width: '30px' }} />,
            roles: [2]
        },
        {
            path: "/suelos",
            name: "Suelos",
            icon: <img src='/suelos.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [3], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/manejodefertilizantes",
                    name: "Manejo de Fertilizantes",
                    icon: <img src='/fertilizer.png' style={{ width: '30px' }} />,
                },
                {
                    path: "/medicionesdesuelos",
                    name: "Mediciones de Suelos",
                    icon: <img src='/calidadsuelo.png' style={{ width: '30px' }} />,
                }
            ]
        },
        {
            path: "/cultivos",
            name: "Cultivos",
            icon: <img src='/cultivos.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [3], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/rotacionescultivosestacion",
                    name: "Rotacion",
                    icon: <img src='/rotacionCultivos.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/manejoresiduos",
                    name: "Manejo de residuos",
                    icon: <img src='/historial.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/preparaciondeterrenos",
                    name: "Preparación de terreno",
                    icon: <img src='/montana.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/productividadcultivos",
                    name: "Productividad",
                    icon: <img src='/productividad.png' style={{ width: '22px' }} />,
                }
            ]
        },
        {
            path: "/menuhidrico",
            name: "Hidrico",
            icon: <img src='/water-filter.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [3], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/registroseguimientousoagua",
                    name: "Rotacion",
                    icon: <img src='/water.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/eficienciariego",
                    name: "Eficiencia Riego",
                    icon: <img src='/sistema-de-agua.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/conductividadelectrica",
                    name: "Estrés Hídrico",
                    icon: <img src='/agua-del-grifo.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/opcion4",
                    name: "opcion4",
                    icon: <img src='/productividad.png' style={{ width: '22px' }} />,
                }
            ]
        },

        {
            path: "/menucondicionesclimaticas",
            name: "Clima",
            icon: <img src='/weather-forecast.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [3], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/pronosticometereologico",
                    name: "Pronóstico Meteorológico",
                    icon: <img src='/weather.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/condicionesmetereologicasclimaticas",
                    name: "Condiciones Meteorológicas y Climáticas",
                    icon: <img src='/condiciones-climaticas.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/riesgonatural",
                    name: "Riesgos Naturales",
                    icon: <img src='/calentamiento-global.png' style={{ width: '22px' }} />,
                },
                
            ]
        },
        {
            path: "/menuplagas",
            name: "Gestion Plagas",
            icon: <img src='/plagasmenu.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [3], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/problemasplagas",
                    name: "Problemas Plagas",
                    icon: <img src='/plagas.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/condicionesmetereologicasclimaticas",
                    name: "Condiciones Meteorológicas y Climáticas",
                    icon: <img src='/condiciones-climaticas.png' style={{ width: '22px' }} />,
                },
                
            ]
        },

        {
            path: "#", // Utilizar "#" como un enlace que no lleva a ninguna parte para los multi-seleccion
            name: "Pages",
            icon: <i className="fas fa-fw fa-folder"></i>,
            roles: [0],
            children: [
                {
                    path: "/login",
                    name: "Login",
                },
                {
                    path: "/register",
                    name: "Register",
                },
                {
                    path: "/forgot-password",
                    name: "Forgot Password",
                },
                {
                    path: "/404",
                    name: "404 Page",
                },
                {
                    path: "/blank",
                    name: "Blank Page",
                }
            ]
        }
    ];

    // Obtener el estado del usuario del almacenamiento Redux
    const userState = useSelector((store: AppStore) => store.user);

    return (
        <div style={{ marginLeft: isOpen ? "200px" : "70px" }} className="container">

            <div style={{ width: isOpen ? "200px" : "70px" }} className="sidebar">
                <div className="top-section">
                    <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">Logo</h1>
                    <div style={{ marginLeft: isOpen ? "50px" : "0px" }} className="bars">
                        <FaBars onClick={toggle} />
                    </div>
                </div>
                {menuItem.map((item, index) => {
                    // Verifica si el usuario tiene el rol necesario para ver el enlace
                    if (!item.roles || item.roles.includes(userState.idRol)) {
                        return (
                            <div key={index}>
                                {item.children ? (
                                    <div onClick={() => toggleSubmenu(item.path)} className={`link ${location.pathname === item.path ? 'active' : ''}`}>
                                        <div className="icon">{item.icon}</div>
                                        <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{item.name}</div>
                                        <div className="arrow">{submenuOpen[item.path] ? <FaAngleDown /> : <FaAngleRight />}</div>
                                    </div>
                                ) : (
                                    <NavLink to={item.path} className={`link ${location.pathname === item.path ? 'active' : ''}`}>
                                        <div className="icon">{item.icon}</div>
                                        <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{item.name}</div>
                                    </NavLink>
                                )}
                                {item.children && (
                                    <div className="sub-menu" style={{ display: submenuOpen[item.path] ? 'block' : 'none' }}>
                                        {item.children.map((child, childIndex) => (
                                            <NavLink key={childIndex} to={child.path} className={`link ${location.pathname === child.path ? 'active' : ''}`}>
                                                <div className="icon">{child.icon}</div>
                                                <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{child.name}</div>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null; // Si el usuario no tiene permiso para ver el enlace, devolver null
                })}
            </div>
            <main>{children}</main>
        </div>
    );
};

export default Sidebar;

