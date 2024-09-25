import React, { useState } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { InsertarMedicionesSensor } from '../../servicios/ServicioMedicionesSensor';
import { IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente AgregarMedicion
interface AgregarMedicion {
    onAdd: () => void;
}

// Componente funcional CrearMedicion
const InsertarMedicionSensor: React.FC<AgregarMedicion> = ({ onAdd }) => {

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombre: '' });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idMedicion: 0,
        nombre: '',
        unidadMedida: '',
        nomenclatura: ''
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
        }else if (formData.nombre.length > 50) {
            newErrors.nombre = 'El nombre no puede tener más de 50 caracteres';
        } else {
            newErrors.nombre = '';
        }
        if (!formData.unidadMedida.trim()) {
            newErrors.unidadMedida = 'El unidad medida es requerido';
        }else if (formData.unidadMedida.length > 150) {
            newErrors.unidadMedida = 'La unidad no puede tener más de 150 caracteres';
        } else {
            newErrors.unidadMedida = '';
        }

        if (!formData.nomenclatura.trim()) {
            newErrors.nomenclatura = 'La nomenclatura es requerida es requerido';
        }else if (formData.nomenclatura.length > 7) {
            newErrors.nomenclatura = 'La nomenclatura no puede tener más de 7 caracteres';
        }  else {
            newErrors.nomenclatura = '';
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
            nombre: formData.nombre,
            unidadMedida: formData.unidadMedida,
            nomenclatura: formData.nomenclatura,
            usuarioCreacionModificacion: idUsuario
        };
        try {
            const resultado = await InsertarMedicionesSensor(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Medicion Agregada! ',
                    text: 'Medicion agregada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar la medicion',
                    text: resultado.mensaje,
                });
            };
        } catch (error) {
            console.log(error)
        }
        if (onAdd) {
            onAdd();
        }
    };

    // Renderizado del componente
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
                <FormGroup row>
                    <Label for="nomenclatura" sm={2} className="input-label">Nomenclatura: </Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="nomenclatura"
                            name="nomenclatura"
                            placeholder="Ingrese la nomenclatura"
                            value={formData.nomenclatura}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('nomenclatura')} // Manejar blur para quitar el mensaje de error
                            className={errors.nomenclatura ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.nomenclatura}</FormFeedback>
                    </Col>
                </FormGroup>
            </div>
            <div className='botonesN' style={{display:'flex', justifyContent:'center'}}>
                <button onClick={handleSubmitConValidacion} className="btn-styled" style={{width:'50%'}}><IoSave size={20} style={{marginRight: '2%'}}/>Guardar medición</button>
            </div>
        </div>
    );
}

export default InsertarMedicionSensor;