import React, { useState } from 'react';
import { FormGroup, Label, Input, Button, Col, FormFeedback } from 'reactstrap';
import { InsertarUsuario } from '../../servicios/ServicioUsuario.ts';
import Swal from 'sweetalert2';


// Componente funcional CrearCuentaUsuario
const CrearCuentaUsuario: React.FC<{ toggleForm: () => void }> = (props) => {

  // Estado para almacenar los errores de validación del formulario
  const [errors, setErrors] = useState<Record<string, string>>({ identificacion: '', contrasena: '', contrasenaConfirmar: '', email: '' });

  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState<any>({
    identificacion: '',
    email: '',
    contrasena: '',
    contrasenaConfirmar: ''
  });

  // Función para manejar cambios en los inputs del formulario
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState: FormData) => ({
      ...prevState,
      [name]: value
    }));
  };

  // Función para manejar el blur de los inputs y eliminar mensajes de error
  const handleInputBlur = (fieldName: string) => {
    // Eliminar el mensaje de error para el campo cuando el identificacion comienza a escribir en él
    if (errors[fieldName]) {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        [fieldName]: ''
      }));
    }
  };

  // Función para manejar el envío del formulario con validación
  const handleSubmitConValidacion = () => {
    // Validar campos antes de avanzar al siguiente paso
    const newErrors: Record<string, string> = {};

    // Validar identificacion no vacío
    if (!formData.identificacion.trim()) {
      newErrors.identificacion = 'La identificación es requerida';
    } else {
      newErrors.identificacion = '';
    }

    // Validar contraseña no vacía
    if (!formData.contrasena.trim()) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 8) {
      newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.contrasena)) {
      newErrors.contrasena = 'La contraseña debe contener al menos un carácter especial';
    } else if (!/[A-Z]/.test(formData.contrasena)) {
      newErrors.contrasena = 'La contraseña debe contener al menos una letra mayúscula';
    } else if (!/\d/.test(formData.contrasena)) {
      newErrors.contrasena = 'La contraseña debe contener al menos un número';
    } else {
      newErrors.contrasena = '';
    }

    // Validar que las contraseñas coincidan
    if (formData.contrasena !== formData.contrasenaConfirmar) {
      newErrors.contrasenaConfirmar = 'Las contraseñas no coinciden';
    } else if (!formData.contrasenaConfirmar.trim()) {
      newErrors.contrasenaConfirmar = 'La contraseña es requerida';
    } else {
      newErrors.contrasenaConfirmar = '';
    }

    // Validar correo no vacío y con formato válido
    const correoPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!correoPattern.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    } else {
      newErrors.email = '';
    }

    // Actualizar los errores
    setErrors(newErrors);

    // Avanzar al siguiente paso si no hay errores
    if (Object.values(newErrors).every(error => error === '')) {
      handleSubmit();
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    const datos = {
      identificacion: formData.identificacion,
      correo: formData.email,
      contrasena: formData.contrasena,
    };
    try {
      const resultado = await InsertarUsuario(datos);
      if (parseInt(resultado.indicador) === 0) {
        Swal.fire({
          icon: 'success',
          title: '¡Gracias por su registro! ',
          text: 'Cuenta creada con éxito.',
        });
        props.toggleForm()
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

  // Renderizado del componente
  return (
    <div>
      <h2>Crear una Cuenta</h2>
      <FormGroup row>
        <Label for="identificacion" sm={2} className="input-label">Identificación</Label>
        <Col sm={12}>
          <Input
            type="text"
            id="identificacion"
            name="identificacion"
            placeholder="Identificación"
            value={formData.identificacion}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur('identificacion')} // Manejar blur para quitar el mensaje de error
            className={errors.identificacion ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error

          />
          <FormFeedback>{errors.identificacion}</FormFeedback>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="email" sm={2} className="input-label">Correo electrónico</Label>
        <Col sm={12}>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="alguien@ejemplo.com"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur('email')} // Manejar blur para quitar el mensaje de error
            className={errors.email ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
          />
          <FormFeedback>{errors.email}</FormFeedback>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="contrasena" sm={2} className="input-label">Contraseña</Label>
        <Col sm={12}>
          <Input
            type="password"
            id="contrasena"
            name="contrasena"
            placeholder="Ingrese su contraseña"
            value={formData.contrasena}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur('contrasena')} // Manejar blur para quitar el mensaje de error
            className={errors.contrasena ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
          />
          <FormFeedback>{errors.contrasena}</FormFeedback>
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="contrasenaConfirmar" sm={2} className="input-label">Confirme la contraseña</Label>
        <Col sm={12}>
          <Input
            type="password"
            id="contrasenaConfirmar"
            name="contrasenaConfirmar"
            placeholder="Confirme la contraseña"
            value={formData.contrasenaConfirmar}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur('contrasenaConfirmar')} // Manejar blur para quitar el mensaje de error
            className={errors.contrasenaConfirmar ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'input-error' si hay un error
          />
          <FormFeedback>{errors.contrasenaConfirmar}</FormFeedback>
        </Col>
      </FormGroup>
      <FormGroup row>

        <Col sm={{ size: 9, offset: 2 }}>
          <Button onClick={handleSubmitConValidacion} className="btn-styled" >Crear Cuenta</Button>
        </Col>
      </FormGroup>
    </div>
  );
}

export default CrearCuentaUsuario;