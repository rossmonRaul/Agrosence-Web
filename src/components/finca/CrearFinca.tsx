import React, { useState } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { GuardarFincas } from '../../servicios/ServicioFincas';

// Interfaz para las propiedades del componente AgregarEmpresa
interface AgregarFinca {
    onAdd: () => void;
}

// Componente funcional CrearEmpresa
const CrearFinca: React.FC<AgregarFinca> = ({ onAdd }) => {

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombre: '' });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idEmpresa: localStorage.getItem('empresaUsuario'),
        nombre: ''
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
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else {
            newErrors.nombre = '';
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
            idEmpresa: formData.idEmpresa,
            nombre: formData.nombre
        };
        try {
            const resultado = await GuardarFincas(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: 'Finca Agregada! ',
                    text: 'Finca agregada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar la finca.',
                    text: resultado.mensaje,
                });
            };
            onAdd()
        } catch (error) {
            console.log(error)
        }

    };

    // Renderizado del componente
    return (
        <div>
            <div className="form-container-fse">
                <FormGroup row>
                    <Label for="nombre" sm={2} className="input-label">Nombre: </Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Ingrese el nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('nombre')} // Manejar blur para quitar el mensaje de error
                            className={errors.nombre ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.nombre}</FormFeedback>
                    </Col>
                </FormGroup>
            </div>
            <button onClick={handleSubmitConValidacion} className="btn-styled">Crear Finca</button>
        </div>
    );
}

export default CrearFinca;