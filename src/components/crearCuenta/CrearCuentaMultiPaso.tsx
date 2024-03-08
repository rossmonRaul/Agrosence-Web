import React, { useState } from 'react';
import Paso1 from '../crearCuenta/DatosPersonales.tsx';
import Paso2 from '../crearCuenta/DatosEmpresa.tsx';
import { InsertarUsuario } from '../../servicios/ServicioUsuario.ts';
import Swal from 'sweetalert2';

const CrearCuentaMultipaso: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<any>({
    identificacion: '',
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


  const nextStep = () => {
    setStep(prevStep => prevStep + 1);
  };

  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async () => {
    const datos = {
      identificacion: formData.identificacion,
      correo: formData.email,
      contrasena: formData.contrasena,
      idEmpresa: formData.empresa,
      idFinca: formData.finca,
      idParcela: formData.parcela
    };

    const resultado = await InsertarUsuario(datos);


    if(parseInt(resultado.indicador) === 0){
      Swal.fire({
        icon: 'success',
        title: '¡Gracias por su registro! ',
        text: 'Cuenta creada con éxito.',
      });
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Error al crear la cuenta.',
        text: resultado.mensaje,
      });
    };
    
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

export default CrearCuentaMultipaso;