import React, { useState } from 'react';
import Paso1 from '../crearCuenta/DatosPersonales.tsx';
import Paso2 from '../crearCuenta/DatosEmpresa.tsx';
import { InsertarUsuario } from '../../servicios/ServicioUsuario.ts';


const CrearCuentaMultipaso: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<any>({
    usuario: '',
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
      usuario: formData.usuario,
      correo: formData.email,
      contrasena: formData.contrasena,
      idEmpresa: formData.empresa,
      idFinca: formData.finca,
      idParcela: formData.parcela
    };

    const resultado = await InsertarUsuario(datos);
    console.log("Agregar");
    console.log(resultado);

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