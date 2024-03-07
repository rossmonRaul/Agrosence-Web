/*  esta pantalla se est'a usando para la creacion de usuarios por parte del administrador*/
import React, { useState } from 'react';
import { InsertarUsuario } from '../../servicios/ServicioUsuario.ts';
import Swal from 'sweetalert2';
import Paso1 from '../crearcuentausuario/DatosDelUsuario.tsx';
import Paso2 from '../crearcuentausuario/DatosEmpresa.tsx';

interface Props {
  idEmpresa: number;
  toggleForm: () => void;
}  

// Componente funcional CrearCuentaUsuario
const CrearCuentaUsuario: React.FC<Props> = ({ toggleForm }) => {

  const [step, setStep] = useState<number>(1);

  const nextStep = () => {
    setStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };


  const [formData, setFormData] = useState<any>({
    identificacion: '',
    nombre: '',
    email: '',
    contrasena: '',
    contrasenaConfirmar: '',
    empresa: '',
    finca: '',
    parcela: ''
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState: FormData) => ({
      ...prevState,
      [name]: value
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    const datos = {
      identificacion: formData.identificacion,
      nombre: formData.nombre,
      correo: formData.email,
      contrasena: formData.contrasena,
      idEmpresa: formData.empresa,
      idFinca: formData.finca,
      idParcela: formData.parcela
    };
    try {
      const resultado = await InsertarUsuario(datos);
      if (parseInt(resultado.indicador) === 0) {
        Swal.fire({
          icon: 'success',
          title: '¡Gracias por su registro! ',
          text: 'Cuenta creada con éxito.',
        });
        toggleForm() 
        localStorage.removeItem('selectedFinca');
        localStorage.removeItem('selectedParcela');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear la cuenta.',
          text: resultado.mensaje,
        });
      };
    } catch (error) {
      console.log(error);
    }
  };

  switch (step) {
    case 1:
      return <Paso1 formData={formData} handleInputChange={handleInputChange} nextStep={nextStep} />;
    case 2:
      return <Paso2 formData={formData} handleInputChange={handleInputChange} prevStep={prevStep} handleSubmit={handleSubmit} />;
    default:
      return null;
  }
}

export default CrearCuentaUsuario;