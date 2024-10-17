import React, { useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import '../../css/Topbar.css';
import { FaRegBell } from 'react-icons/fa';
import { Logout } from '../logout';
import { ObtenerNotificaciones, EliminarNotificaciones } from '../../servicios/ServicioNotificaciones';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerMedicionesSensor } from '../../servicios/ServicioMedicionesSensor';
import { ObtenerUsuariosPorEmpresa } from '../../servicios/ServicioUsuario';
import LanguageSelector from '../languageSelector/LanguageSelector';

interface Notificacion {
    nombreFinca: ReactNode;
    ubicacionFinca: ReactNode;
    nombreParcela: ReactNode;
    idNotificacion: number;
    idFinca: number;
    idParcela: number;
    idMedicionSensor: number;
    descripcion: string;
    fechaCreacion: string;
    estado: string;
}

interface Finca {
    idFinca: number;
    nombre: string;
    ubicacion: string;
    idEmpresa: number;
}

interface Parcela {
    idParcela: number;
    nombre: string;
    nombreFinca: string;
    idFinca: number;
}


const Topbar: React.FC = () => {
    const [showOptions, setShowOptions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); 
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [fincas, setFincas] = useState<Finca[]>([]);
    const [parcelas, setParcelas] = useState<Parcela[]>([]);
    const userState = useSelector((store: AppStore) => store.user);

    const handleAvatarClick = () => {
        setShowOptions(!showOptions);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    useEffect(() => {
        const cargarDatos = async () => {
            const usuarios = await ObtenerUsuariosPorEmpresa(userState.idEmpresa);
            const notificaciones = await ObtenerNotificaciones();

            const fincas = await ObtenerFincas(userState.idEmpresa);
            const parcelas = await ObtenerParcelas(userState.idEmpresa);

            // Filtrar notificaciones por idEmpresa del usuario logueado
            const notificacionesFiltradas = notificaciones.filter((notificacion: { idFinca: any; }) => {
                const finca = fincas.find((f: { idFinca: any; }) => f.idFinca === notificacion.idFinca);
                return finca && finca.idEmpresa === userState.idEmpresa;
            });
            // Enlazar las notificaciones filtradas con sus respectivas fincas y parcelas
            const notificacionesDetalladas = notificacionesFiltradas.map((notificacion: { idFinca: any; idParcela: any; }) => {
                const finca = fincas.find((f: { idFinca: any; }) => f.idFinca === notificacion.idFinca);
                const parcela = parcelas.find((p: { idParcela: any; }) => p.idParcela === notificacion.idParcela);
                return {
                    ...notificacion,
                    nombreFinca: finca?.nombre || 'Finca desconocida',
                    ubicacionFinca: finca?.ubicacion || 'Ubicación desconocida',
                    nombreParcela: parcela?.nombre || 'Parcela desconocida',
                };
            });
            setNotifications(notificacionesDetalladas);
            setFincas(fincas);
            setParcelas(parcelas);
        };

        cargarDatos();
    }, [userState.idEmpresa]);

    const eliminarNotificacion = async (idNotificacion: number) => {
        const Data = {
            idNotificacion: idNotificacion

        }
        
        await EliminarNotificaciones(Data);
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.idNotificacion !== idNotificacion)
        );
    };

    return (
        <div className="top-bar">
            <div className="user-info">
            <div style={{display:"inline-flex",justifyContent:"center", alignItems:'center'}}>
            <div className="user-name">Idioma</div>
            <LanguageSelector /></div>
            
                <div className="notifications">
                    <FaRegBell onClick={toggleNotifications} />
                    {notifications.length > 0 && (
                        <span className="notification-count">{notifications.length}</span>
                    )}
                    {showNotifications && (
                        <div className="notification-list">
                        <h3>Notificaciones:</h3>
                        <ul>
                            {notifications.map((notification) => (
                                <li key={notification.idNotificacion} className="notification-item">
                                    <div className="notification-content">
                                            <p className="notification-small-text">
                                                {notification.fechaCreacion}
                                            </p>
                                            <br/>
                                            <strong>{notification.descripcion}</strong>
                                            <br/>
                                            <p>
                                                <strong>Hubo una alerta en el sensor {notification.idMedicionSensor}:</strong> 
                                            </p>
                                            <p>
                                                En la parcela {notification.nombreParcela} de la finca {notification.nombreFinca}, 
                                                ubicada en {notification.ubicacionFinca}
                                            </p>
                                        </div>
                                        <button className="close-button" onClick={() => eliminarNotificacion(notification.idNotificacion)}>
                                                &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                    </div>
                    )}
                </div>

                <div className="user-name">{userState.nombre}</div>

                <div className="user-avatar" onClick={handleAvatarClick}>
                    {showOptions && (
                        <div className="avatar-options">
                            <Logout />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Topbar;
