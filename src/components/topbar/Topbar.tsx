import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import '../../css/Topbar.css';
import { FaRegBell } from 'react-icons/fa';

const Topbar: React.FC = () => {
    const [showOptions, setShowOptions] = useState(false);
    const [notifications, setNotifications] = useState<string[]>([]);
    const userState = useSelector((store: AppStore) => store.user);

    const handleAvatarClick = () => {
        setShowOptions(!showOptions);
    };

    // Función para agregar una nueva notificación
    const addNotification = (notification: string) => {
        setNotifications([...notifications, notification]);
    };

    return (
        <div className="top-bar">
            <div className="user-info">
                <div className="notifications">
                    <FaRegBell onClick={() => addNotification("Nueva notificación")} /> {/* Icono de notificaciones */}
                    {/* Mostrar las notificaciones */}
                    {notifications.length > 0 && (
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

                <div className="user-name">{userState.identificacion}</div>

                <div className="user-avatar" onClick={handleAvatarClick}>
                    {/* Contenido del avatar */}
                </div>
                {showOptions && (
                    <div className="avatar-options">
                        {/* Contenido del combobox de opciones */}
                        <select>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            {/* Agrega más opciones según sea necesario */}
                        </select>
                    </div>
                )}
                

            </div>
        </div>
    );
};

export default Topbar;
