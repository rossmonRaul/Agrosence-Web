import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaUserAlt, FaTh, FaUserCog, FaAngleRight, FaAngleDown, FaChartBar } from "react-icons/fa";
import '../../css/Sidebar.css';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import { IoBusiness } from 'react-icons/io5';
import { clearSessionStorage } from '../../utilities';
import { UserKey, resetUser } from '../../redux/state/User';
import { useNavigate } from 'react-router-dom';
import { PublicRoutes } from '../../models';
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

    const navigate = useNavigate();

    const userToken = localStorage.getItem('token');

    useEffect(() => {
        if (isTokenExpired(userToken)) {
            localStorage.removeItem('token');
            resetUser()
            navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
        }
    }, [userToken, history]);
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
            path: "/medicionessensor",
            name: "Mediciones Sensor",
            icon: <FaChartBar />,
            roles: [1]
        },
        {
            path: "/medidascultivos",
            name: "Medidas Cultivos",
            icon: <img src='/medida-cultivo.png' style={{ width: '22px' }} />,
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
            path: "/cultivos",
            name: "Cultivos",
            icon: <img src='/cultivo.png' style={{ width: '22px' }} />,
            roles: [2]
        },
        {
            path: "/catalogoactividadespt",
            name: "Catálogo de Actividades",
            icon: <img src='/inventario.png' style={{ width: '22px' }} />, // Asegúrate de tener un ícono adecuado
            roles: [2]
        },
        {
            path: "/menusensores",
            name: "Sensores",
            icon: <img src='/sensores.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [2], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/administrarsensores",
                    name: "Sensores",
                    icon: <img src='/sensor.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/puntomedicion",
                    name: "Punto Medición",
                    icon: <img src='/punto-medicion.png' style={{ width: '22px' }} />,
                },

            ]
        },
        {
            path: "/menuadministracion",
            name: "Finanzas",
            icon: <img src='/administrar.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [2], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/ordencompra",
                    name: "Ordenes de Compras",
                    icon: <img src='/compra.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/entradasysalidas",
                    name: "Entradas y Salidas",
                    icon: <img src='/entradasalida.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/manoobra",
                    name: "Mano Obra",
                    icon: <img src='/mano-obra.png' style={{ width: '30px' }} />,
                },

            ]
        },
        {
            path: "/menureporteria",
            name: "Reportes",
            icon: <img src='/reporte.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [2], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/reporteentradasysalidas",
                    name: "Reporte de Entradas y Salidas",
                    icon: <img src='/entradasalida.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/reporteentradas",
                    name: "Reporte de entrada total",
                    icon: <img src='/entrada.png' style={{ width: '22px' }} />,
                },
                {
                    path: "/reportesalidas",
                    name: "Reporte de salida total",
                    icon: <img src='/salida.png' style={{ width: '30px' }} />,
                },
                {
                    path: "/reporteordendecompra",
                    name: "Reporte de orden de compra",
                    icon: <img src='/orden-compra.png' style={{ width: '30px' }} />,
                },
                {
                    path: "/reporteplanilla",
                    name: "Reporte de planilla",
                    icon: <img src='/mano-obra.png' style={{ width: '30px' }} />,
                },
                {                    
                    path: "/reportesensores",
                    name: "Reporte de Sensores",
                    icon: <img src='/sensor.png' style={{ width: '30px' }} />,
                },
                {
                    path: "/reportemedicionessensor",
                    name: "Reporte de Medidas de Sensor",
                    icon: <img src='/medidas.png' style={{ width: '22px' }} />,
                },                
                {
                    path: "/reportemedicionesautorizadassensor",
                    name: "Reporte Medidas Autorizadas de Sensor",
                    icon: <img src='/medidasAutorizadas.png' style={{ width: '22px' }} />,
                },
            ]
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
                    path: "/tipoaplicacion",
                    name: "Tipo de aplicacion",
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
        },
 
        {
            path: "/agriculturadeprecision",
            name: "Agricultura de precisión",
            icon: <img src='/agricultura-precision.png' style={{ width: '22px' }} />, // Puedes usar cualquier icono que desees aquí
            roles: [3], // Especifica los roles que pueden ver esta opción
            children: [
                {
                    path: "/contenidodeclorofila",
                    name: "Contenido de Clorofila",
                    icon: <img src='/clorofila.png' style={{ width: '22px' }} />,
                    roles: [3]
                },
                {
                    path: "/contenidodenitrogeno",
                    name: "Contenido de Nitrógeno",
                    icon: <img src='/nitrogeno.png' style={{ width: '22px' }} />,
                    roles: [3]
                },
                {
                    path: "/saludplanta",
                    name: "Salud de la Planta",
                    icon: <img src='/salud-planta.png' style={{ width: '22px' }} />,
                    roles: [3]
                },
                {
                    path: "/cantidaddeplantas",
                    name: "Cantidad de Plantas",
                    icon: <img src='/cantidad-plantas.png' style={{ width: '22px' }} />,
                    roles: [3]
                },
                {
                    path: "/contenidodeagua",
                    name: "Contenido de Agua",
                    icon: <img src='/contenidodeagua.png' style={{ width: '22px' }} />,
                    roles: [3]
                },
                {
                    path: "/CoberturaVegetal",
                    name: "Cobertura Vegetal",
                    icon: <img src='/clorofila.png' style={{ width: '22px' }} />,
                    roles: [3]
                },
                {
                    path: "/ALERTASCATALOGO",
                    name: "Catalogo de Alertas",
                    icon: <img src='/inventario.png' style={{ width: '22px' }} />,
                    roles: [3]
                }
               
            ]
        },


    ];

    // Obtener el estado del usuario del almacenamiento Redux
    const userState = useSelector((store: AppStore) => store.user);

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
                    return null; 
                })}
            </div>
            <main>{children}</main>
        </div>
    );
};

export default Sidebar;

