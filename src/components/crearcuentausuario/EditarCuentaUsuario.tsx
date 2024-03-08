/* de parte del administrador edita a los usuarios */
import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { ActualizarAsignarUsuario } from '../../servicios/ServicioUsuario.ts';
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import '../../css/FormSeleccionEmpresa.css'

// Interfaz para las propiedades del componente
interface UsuarioSeleccionadoProps {
    identificacion: string;
    nombre: string;
    email: string;
    onEdit: () => void;
}
  
// Componente funcional principal
const EditarCuentaUsuario: React.FC<UsuarioSeleccionadoProps> = ({ identificacion, nombre, email, onEdit }) => {

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ identificacion: '',nombre: '', email: '', contrasena: '', nuevaContrasena: '' });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        identificacion: '',
        nombre: '',
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


    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            identificacion: identificacion,
            nombre: nombre,
            email: email,
            contrasena: '',
            contrasenaConfirmar: ''
        });
    }, [identificacion]);

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

        if (formData.contrasena.trim()) {
            if (formData.contrasena.length < 8) {
                newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
            } else if (!/[A-Z]/.test(formData.contrasena)) {
                newErrors.contrasena = 'La contraseña debe contener al menos una mayúscula';
            } else if (!/[^A-Za-z0-9]/.test(formData.contrasena)) {
                newErrors.contrasena = 'La contraseña debe contener al menos un caracter especial';
            } else if (formData.contrasena !== formData.contrasenaConfirmar) {
                newErrors.contrasenaConfirmar = 'Las contraseñas no coinciden';
            } else if (!formData.contrasenaConfirmar.trim()) {
                newErrors.contrasenaConfirmar = 'La contraseña es requerida';
            } else if (!/\d/.test(formData.contrasena)) {
                newErrors.contrasena = 'La contraseña debe contener al menos un número';
            } else {
                newErrors.contrasenaConfirmar = '';
                newErrors.contrasena = '';
            }
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
            nombre: formData.nombre,
            correo: formData.email,
            contrasena: formData.contrasena
        };
        try {
            const resultado = await ActualizarAsignarUsuario(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Actualizado! ',
                    text: 'Usuario actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el usuario.',
                    text: resultado.mensaje,
                });
            };

            if (onEdit) {
                onEdit();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Renderizado del componente
    return (
        <div>
            <FormGroup row>
                <Label for="identificacion" sm={2} className="input-label">Identificación</Label>
                <Col sm={12}>
                    <Input
                        type="text"
                        id="identificacion"
                        name="identificacion"
                        placeholder="Identificación"
                        value={formData.identificacion || identificacion}
                        onChange={handleInputChange}
                        readOnly
                        onBlur={() => handleInputBlur('identificacion')} // Manejar blur para quitar el mensaje de error
                        className={errors.identificacion ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error

                    />
                    <FormFeedback>{errors.identificacion}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label for="nombre" sm={2} className="input-label">Nombre</Label>
                <Col sm={12}>
                    <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Ingrese su nombre completo"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur('nombre')} // Manejar blur para quitar el mensaje de error
                        className={errors.nombre ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                    />
                    <FormFeedback>{errors.nombre}</FormFeedback>
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label for="email" sm={2} className="input-label">Correo</Label>
                <Col sm={12}>
                    <Input
                        type="text"
                        id="email"
                        name="email"
                        placeholder="Ingrese el email"
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
                    <Button onClick={handleSubmitConValidacion} className="btn-styled" >Editar Datos</Button>
                </Col>
            </FormGroup>
        </div>
    );
}

export default EditarCuentaUsuario;