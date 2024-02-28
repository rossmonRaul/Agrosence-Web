import React from 'react';
import '../../css/BodeSuperior.css';

// Interfaz para que reciba el nombre que se desea para la pantalla
interface BorderProps {
    text: string;
}


// Componente principal
const BordeSuperior: React.FC<BorderProps> = ({ text }) => { 
    // Renderizado
    return (
        <div className="top-border">
            <p>{text}</p>
        </div>
    );
};

export default BordeSuperior;

