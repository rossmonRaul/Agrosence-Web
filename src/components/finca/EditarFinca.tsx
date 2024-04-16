import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { EditarFincas } from '../../servicios/ServicioFincas';

// Interfaz para las propiedades del componente EditarEmpresa
interface Props {
    idFinca: string;
    nombreEditar: string;
    ubicacion: string;

    onEdit: () => void;
}

// Componente funcional EditarEmpresa
const EditarFinca: React.FC<Props> = ({ idFinca, nombreEditar,ubicacion, onEdit }) => {

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombreEditar : '',ubicacion: '' });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idFinca: 0,
        nombre: '',
        ubicacion:''
    });

    // Efecto para actualizar el formData cuando las props cambien
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idFinca: idFinca,
            nombre: nombreEditar,
            ubicacion:ubicacion
        });
    }, [idFinca, nombreEditar,ubicacion]);


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
        if (!formData.ubicacion.trim()) {
            newErrors.ubicacion = 'La ubicación es requerido';
        } else {
            newErrors.ubicacion = '';
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
            idFinca: idFinca,
            nombre: formData.nombre,
            ubicacion:formData.ubicacion
        };
        try {
            const resultado = await EditarFincas(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Finca Actualizada! ',
                    text: 'Finca actualizada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la finca.',
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
                <FormGroup row>
                    <Label for="ubicacion" sm={2} className="input-label">Ubicación: </Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="ubicacion"
                            name="ubicacion"
                            placeholder="Ingrese la ubicación"
                            value={formData.ubicacion}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('ubicacion')} // Manejar blur para quitar el mensaje de error
                            className={errors.ubicacion ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.ubicacion}</FormFeedback>
                    </Col>
                </FormGroup>
            </div>
            <button onClick={handleSubmitConValidacion} className="btn-styled">Actualizar Datos</button>
        </div>
    );
}

export default EditarFinca;