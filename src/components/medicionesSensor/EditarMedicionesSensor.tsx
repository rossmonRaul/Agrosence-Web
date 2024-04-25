import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { ModificarMedicionesSensor } from '../../servicios/ServicioMedicionesSensor';

// Interfaz para las propiedades del componente EditarMedicion
interface Props {
    idMedicion: string;
    nombrebase: string;
    unidadMedida: string;
    onEdit: () => void;
}

// Componente funcional EditarMedicion
const EditarMedicionesSensor: React.FC<Props> = ({ idMedicion, nombrebase,unidadMedida, onEdit }) => {

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombrebase });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idMeicion: 0,
        nombre: '',
        unidadMedida: ''
    });

    // Efecto para actualizar el formData cuando las props cambien
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idMedicion: idMedicion,
            nombre: nombrebase,
            unidadMedida: unidadMedida
        });
    }, [idMedicion, nombrebase, unidadMedida]);


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
        const idUsuario = localStorage.getItem('identificacionUsuario');

        if (idUsuario !== null) {
            formData.usuarioCreacionModificacion = idUsuario;
        } else {
            console.error('El valor de identificacionUsuario en localStorage es nulo.');
        }
        const datos = {
            idMedicion: idMedicion,
            nombre: formData.nombre,
            unidadMedida: formData.unidadMedida,
            usuarioCreacionModificacion: idUsuario
        };
        try {
            const resultado = await ModificarMedicionesSensor(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Medicion Actualizada! ',
                    text: 'Medicion actualizada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la medicion.',
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
        <div style={{ minWidth:'350px'}}>
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
                    <Label for="unidadMedida" sm={2} className="input-label">Unidad Medida: </Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="unidadMedida"
                            name="unidadMedida"
                            placeholder="Ingrese la unidad"
                            value={formData.unidadMedida}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('unidadMedida')} // Manejar blur para quitar el mensaje de error
                            className={errors.unidadMedida ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.unidadMedida}</FormFeedback>
                    </Col>
                </FormGroup>
            </div>
            <button onClick={handleSubmitConValidacion} className="btn-styled">Actualizar Datos</button>
        </div>
    );
}

export default EditarMedicionesSensor;