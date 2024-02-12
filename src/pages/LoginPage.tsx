// Código JSX para la página de login
import React, { useState } from 'react';
import { FormGroup, Label, Input, Button, Col } from 'reactstrap';
import CrearCuentaMultipaso from '../components/crearCuenta/CrearCuentaMultiPaso.tsx'; // Importa el componente de creación de cuenta
import '../css/LoginPage.css';

interface FormData {
  usuario: string;
  contrasena: string;
  mostrarCrearCuenta: boolean;
}

const FormularioInicioSesion: React.FC<{
  onSubmit: (formData: FormData) => void;
  toggleForm: () => void;
  formData: FormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ onSubmit, toggleForm, formData, handleInputChange }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <div className="form-header">
        <h2>Iniciar Sesión</h2>
        <p>Inicia sesión en tu cuenta</p>
      </div>
      <form onSubmit={handleSubmit}>
        <FormGroup row>
          <Label for="usuario" sm={2} className="input-label">Usuario</Label>
          <Col sm={12}>
            <Input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleInputChange}
              className="input-styled"
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="contrasena" sm={2} className="input-label">Contraseña</Label>
          <Col sm={12}>
            <Input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleInputChange}
              className="input-styled"
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Col sm={{ size: 9, offset: 2 }}>
            <Button type="submit" color="primary" className="btn-styled">Iniciar Sesión</Button>
          </Col>
        </FormGroup>
      </form>
      <div className='container-btn-crear-iniciar'>
        <p>¿No tienes una cuenta? <Button color="link" className='btn-crear-iniciar' onClick={toggleForm}>Crear una Cuenta</Button></p>
      </div>
    </>
  );
};

const FormularioCrearCuenta: React.FC<{
 
  toggleForm: () => void;
  formData: FormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ toggleForm }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toggleForm();
  };
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        <CrearCuentaMultipaso/>
      </form>
      <div className='container-btn-crear-iniciar'>
        <p >¿Ya tienes una cuenta? <Button color="link" onClick={toggleForm}>Iniciar Sesión</Button></p>
      </div>
    </>
  );
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    usuario: '',
    contrasena: '',
    mostrarCrearCuenta: false
  });

  const toggleForm = () => {
    localStorage.removeItem('selectedEmpresa');
    localStorage.removeItem('selectedFinca');
    localStorage.removeItem('selectedParcela');
    setFormData(prevState => ({
      ...prevState,
      mostrarCrearCuenta: !prevState.mostrarCrearCuenta
      
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLoginSubmit = (formData: FormData) => {
    console.log('Datos del formulario de inicio de sesión:', formData);
    // Aquí puedes agregar la lógica para enviar los datos del formulario de inicio de sesión al servidor
  };


  return (
    <div className="container">
      <div className="form-container">
        {formData.mostrarCrearCuenta ? (
          <FormularioCrearCuenta
            toggleForm={toggleForm}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        ) : (
          <FormularioInicioSesion
            onSubmit={handleLoginSubmit}
            toggleForm={toggleForm}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
      </div>
    </div>
  );
};


export default Login;
