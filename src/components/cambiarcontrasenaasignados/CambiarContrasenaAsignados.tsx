import React, { useState } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import { CambiarContrasenaUsuarios } from '../../servicios/ServicioUsuario';
import '../../css/CrearCuenta.css'

// Definición de las propiedades que espera recibir el componente
interface Props {
    identificacion: string;
    onEdit: () => void;
}

//hay que modificarlo
// Componente funcional principal
const CambiarContrasenaAsignados: React.FC<Props> = ({ onEdit, identificacion }) => {
    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombre: '', correo: '', contrasena: '', nuevaContrasena: '' });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        identificacion: '',
        nombre: '',
        correo: '',
        contrasena: ''
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
        // Validar campos antes de enviar los datos al servidor
        const newErrors: Record<string, string> = {};

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

        // Si no hay errores, enviar los datos al servidor
        if (Object.values(newErrors).every(error => error === '')) {
            // Llamar a la función handleSubmit para enviar los datos al servidor
            handleSubmit();
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const datos = {
            identificacion: identificacion,
            contrasena: formData.contrasena
        };
        try {
            const resultado = await CambiarContrasenaUsuarios(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Actuzalizado! ',
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
            <div className="form-container-fse">
                <FormGroup row>
                    <Label for="nombre" sm={2} className="input-label">Nombre</Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Ingrese el nombre completo"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('nombre')} // Manejar blur para quitar el mensaje de error
                            className={errors.nombre ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.nombre}</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="correo" sm={2} className="input-label">Correo</Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="correo"
                            name="correo"
                            placeholder="Ingrese el correo"
                            value={formData.correo}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('correo')} // Manejar blur para quitar el mensaje de error
                            className={errors.correo ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.correo}</FormFeedback>
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

            </div>
            <button onClick={handleSubmitConValidacion} className="btn-styled">Actualizar Contraseña</button>
        </div>
    );
}

export default CambiarContrasenaAsignados;