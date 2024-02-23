// Código JSX para la página de login
import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Button, Col, FormFeedback } from 'reactstrap';
import '../css/LoginPage.css';
import { ValidarUsuario } from '../servicios/ServicioUsuario.ts';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { UserKey, createUser, resetUser } from '../redux/state/User.ts';
import { useNavigate } from 'react-router-dom';
import { clearLocalStorage } from '../utilities/LocalStorageUtility.tsx';
import { PrivateRoutes, PublicRoutes } from '../models/routes.ts';
import CrearCuentaUsuario from '../components/crearcuentausuario/CrearCuentaUsuario.tsx';



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
  handleInputBlur: (fieldName: string) => void;
  errors: Record<string, string>;
}> = ({ onSubmit, toggleForm, formData, handleInputChange, handleInputBlur, errors }) => {
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
              placeholder="Identificación o correo"
              onChange={handleInputChange}
              onBlur={() => handleInputBlur('usuario')} // Llama a handleInputBlur cuando se dispara el evento onBlur
              className={errors.usuario ? 'input-styled input-error' : 'input-styled'}
            />
            <FormFeedback>{errors.usuario}</FormFeedback>
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
              onBlur={() => handleInputBlur('contrasena')} // Llama a handleInputBlur cuando se dispara el evento onBlur
              className={errors.contrasena ? 'input-styled input-error' : 'input-styled'}
            />
          </Col>
          <FormFeedback>{errors.contrasena}</FormFeedback>
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
        <CrearCuentaUsuario  toggleForm={toggleForm}/>
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    clearLocalStorage(UserKey);
    dispatch(resetUser());
    navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleForm = () => {
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

  const [errors, setErrors] = useState<Record<string, string>>({ usuario: '', contrasena: '' });

  const handleSubmitConValidacion = () => {
    // Validar campos antes de enviar los datos al servidor
    const newErrors: Record<string, string> = {};

    // Validar selección de usuario
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El usuario es requerido';
    } else {
      newErrors.usuario = '';
    }

    // Validar selección de contraseña
    if (!formData.contrasena.trim()) {
      newErrors.contrasena = 'Debe ingresar la contraseña';
    } else {
      newErrors.contrasena = '';
    }

    // Actualizar los errores
    setErrors(newErrors);

    // Si no hay errores, enviar los datos al servidor
    if (Object.values(newErrors).every(error => error === '')) {
      handleLoginSubmit();
    }
  };

  const handleInputBlur = (fieldName: string) => {
    // Eliminar el mensaje de error para el campo cuando el usuario comienza a escribir en él
    if (errors[fieldName]) {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        [fieldName]: ''
      }));
    }
  };

  const handleLoginSubmit = async () => {
    const formDataLogin = {
      identificacion: formData.usuario,
      contrasena: formData.contrasena
    };

    try {
      const usuarioEncontrado = await ValidarUsuario(formDataLogin);

      if (usuarioEncontrado.mensaje === "Usuario no encontrado.") {
        Swal.fire({
          icon: 'error',
          title: '¡Credenciales incorrectas!',
          text: 'Los datos del usuario ingresado no existen',
        });
      } else if (usuarioEncontrado.mensaje === "Usuario encontrado.") {
        dispatch(createUser(usuarioEncontrado))
        navigate(`/${PrivateRoutes.PRIVATE}`, { replace: true });
        setIsLoggedIn(true);
      } else if (usuarioEncontrado.mensaje === "Credenciales incorrectas.") {
        Swal.fire({
          icon: 'error',
          title: '¡Credenciales incorrectas!',
          text: 'Los datos del usuario ingresado son incorrectas',
        });
      } else if (usuarioEncontrado.mensaje === "Usuario o empresa inactivos.") {
        Swal.fire({
          icon: 'error',
          title: 'No puedes iniciar sesión',
          text: 'Usuario o empresa inactivos',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: '¡Oops!',
          text: usuarioEncontrado.mensaje,
        });
      }
    } catch (error) {

    }

  };



  return (
    <div className={`container ${isLoggedIn ? '' : 'login-bg'}`}>
    <div className="container-lg">
      <div className="form-container">
        {formData.mostrarCrearCuenta ? (
          <FormularioCrearCuenta
            toggleForm={toggleForm}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        ) : (
          <FormularioInicioSesion
            onSubmit={handleSubmitConValidacion}
            toggleForm={toggleForm}
            formData={formData}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            errors={errors}
          />
        )}
      </div>
    </div>
    </div>
  );
};


export default Login;
