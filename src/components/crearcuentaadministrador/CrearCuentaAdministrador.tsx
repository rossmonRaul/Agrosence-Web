import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { InsertarUsuarioAdministrador } from '../../servicios/ServicioUsuario.ts';
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { ObtenerEmpresas } from '../../servicios/ServicioEmpresas.ts';
import '../../css/FormSeleccionEmpresa.css'

// Interfaz para las opciones de empresa
interface Option {
    idEmpresa: number;
    nombre: string;
}

// Interfaz para las propiedades del componente
interface AgregarAdministradorProps {
    onAdd: () => void;
} 

// Componente funcional principal
const CrearCuentaAdministrador: React.FC<AgregarAdministradorProps> = ({ onAdd }) => {
    // Estado para almacenar las empresas disponibles
    const [empresas, setEmpresas] = useState<Option[]>([]);

    // Estado para almacenar la empresa seleccionada
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>();

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombre: '', identificacion: '', contrasena: '', contrasenaConfirmar: '', email: '', empresa: '' });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        nombre: '',
        identificacion: '',
        email: '',
        contrasena: '',
        contrasenaConfirmar: '',
        empresa: ''
    });

    // Efecto para obtener las empresas disponibles al cargar el componente
    useEffect(() => {
        const obtenerEmpresas = async () => {
            try {

                const empresasResponse = await ObtenerEmpresas();
                // Obtener todas las fincas y parcelas de una vez

                setEmpresas(empresasResponse);

            } catch (error) {
                console.error('Error al obtener las empresas:', error);
            }
        };

        obtenerEmpresas();
    }, []);

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

    // Función para manejar cambios en la selección de empresa
    const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedEmpresa(value);
    };

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: FormData) => ({
            ...prevState,
            [name]: value
        }));
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

        // Validar contraseña
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

        // Validar que la empresa este seleccionada
        if (!selectedEmpresa) {
            newErrors.empresa = 'Debe seleccionar una empresa';
        } else {
            newErrors.empresa = '';
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
            nombre: formData.nombre,
            identificacion: formData.identificacion,
            correo: formData.email,
            contrasena: formData.contrasena,
            idEmpresa: selectedEmpresa
        };
        try {
            const resultado = await InsertarUsuarioAdministrador(datos);
            if (parseInt(resultado.indicador) === 0) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Gracias por su registro! ',
                    text: 'Cuenta creada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear la cuenta.',
                    text: resultado.mensaje,
                });
            };

            if (onAdd) {
                onAdd();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Renderizado del componente
    return (
        <div>
            <FormGroup row>
                <Label for="nombre" sm={2} className="input-label">Nombre</Label>
                <Col sm={12}>
                    <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Nombre Completo"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur('nombre')} // Manejar blur para quitar el mensaje de error
                        className={errors.nombre ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error

                    />
                    <FormFeedback>{errors.nombre}</FormFeedback>
                </Col>
            </FormGroup>
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
            <FormGroup>
                <Label htmlFor="empresas" className="input-label">Empresa</Label>
                <select className="custom-select" id="empresas" value={selectedEmpresa} onChange={handleEmpresaChange}>
                    <option key="default-empresa" value="">Seleccione...</option>
                    {empresas.map((empresa) => (
                        <option key={`${empresa.idEmpresa}-${empresa.nombre}`} value={empresa.idEmpresa}>{empresa.nombre}</option>
                    ))}
                </select>
                {errors.empresa && <FormFeedback>{errors.empresa}</FormFeedback>}
            </FormGroup>
            <FormGroup row>
                <Col sm={{ size: 9, offset: 2 }}>
                    <Button onClick={handleSubmitConValidacion} className="btn-styled" >Crear Cuenta</Button>
                </Col>
            </FormGroup>
        </div>
    );
}  
export default CrearCuentaAdministrador;