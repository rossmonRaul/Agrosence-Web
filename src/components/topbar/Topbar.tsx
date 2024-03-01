import React, {  useState } from 'react';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import '../../css/Topbar.css';
import { FaRegBell } from 'react-icons/fa';
import { Logout } from '../logout';

const Topbar: React.FC = () => {
    const [showOptions, setShowOptions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); 
    const [notifications, {/*setNotifications*/}] = useState<string[]>([]);
    const userState = useSelector((store: AppStore) => store.user);

    const handleAvatarClick = () => {
        setShowOptions(!showOptions);
    };

    // Manejador de clics para abrir o cerrar el panel de notificaciones
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };
    
    return (
        <div className="top-bar">
            <div className="user-info">
            <div className="notifications">
                    <FaRegBell onClick={toggleNotifications} /> {/* Icono de notificaciones */}
                    {/* Mostrar las notificaciones si showNotifications es true */}
                    {showNotifications && notifications.length >= 0 && (
                        <div className="notification-list">
                            <h3>Notificaciones:</h3>
                            <ul>
                                {notifications.map((notification, index) => (
                                    <li key={index}>{notification}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="user-name">{userState.nombre}</div>

                <div className="user-avatar" onClick={handleAvatarClick}>
                {showOptions && (
                    <div className="avatar-options">
                        <Logout/>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default Topbar;
