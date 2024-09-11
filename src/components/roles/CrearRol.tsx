import React, { useEffect, useState } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { GuardarParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerFincas } from '../../servicios/ServicioFincas';

// Interfaz para las propiedades del componente AgregarEmpresa
interface AgregarRol {
    onAdd: () => void;
}

// interface Option {
//     identificacion: string;
//     idEmpresa: number;
//     nombre: string;
//     idParcela: number;
//     idFinca: number;
// }

// Componente funcional CrearEmpresa
const CrearRol: React.FC<AgregarRol> = ({ onAdd }) => {

    // Estados para almacenar los datos obtenidos de la API
    //const [fincas, setFincas] = useState<Option[]>([]);

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ nombre: '' });


    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        // idFinca: '',  
        // nombre: ''    
    });


   
    // useEffect(() => {
        
    // }, []);

    const handleCheckboxChange = (e: { target: { name: any; checked: any; }; }) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked,
        });
    };
    // Función para manejar el blur de los inputs y eliminar mensajes de error
    const handleInputBlur = (fieldName: string) => {
        // Eliminar el mensaje de error para el campo cuando el usuario comience a escribir en él
        if (errors[fieldName]) {
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                [fieldName]: ''
            }));
        }
    };
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: FormData) => ({
            ...prevState,
            [name]: value
        }));
    };
  

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Validar campos antes de enviar los datos al servidor
        const newErrors: Record<string, string> = {};

        // Validar selección de finca
        // if (!selectedFinca) {
        //     newErrors.finca = 'Debe seleccionar una finca';
        // } else {
        //     newErrors.finca = '';
        // }

        // Actualizar los errores
        setErrors(newErrors);

        // Si no hay errores, enviar los datos al servidor
        if (Object.values(newErrors).every(error => error === '')) {
            // Llamar a la función handleSubmit para enviar los datos al servidor
            handleSubmit();
        }
    };
    // Función para manejar el envío del formulario(metodo para guardar)
    const handleSubmit = async () => {
        // const datos = {
        //     nombre: formData.nombre,
        //     idFinca: formData.idFinca,
        // };
        // try {
        //     const resultado = await GuardarParcelas(datos);
        //     if (parseInt(resultado.indicador) === 1) {
        //         Swal.fire({
        //             icon: 'success',
        //             title: 'Parcela Agregada! ',
        //             text: 'Parcela agregada con éxito.',
        //         });
        //     } else {
        //         Swal.fire({
        //             icon: 'error',
        //             title: 'Error al agregar la parcela.',
        //             text: resultado.mensaje,
        //         });
        //     };
        //     onAdd()
        // } catch (error) {
        //     console.log(error)
        // }

    };

    // Renderizado del componente
    return (
        <div>
            <div className="form-container-fse">
            <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                <FormGroup row>
                    <Label for="descripcion" sm={2} className="input-label">Descripción: </Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="descripcion"
                            name="descripcion"
                            placeholder="Ingrese la descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('nombre')} // Manejar blur para quitar el mensaje de error
                            className={errors.descripcion ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                        />
                        <FormFeedback>{errors.descripcion}</FormFeedback>
                    </Col>
                </FormGroup>
                </div>
                <h5>Permisos Generales</h5>
                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem',justifyContent:' space-between' }}>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            name="agregar"
                            checked={formData.agregar}
                            onChange={handleCheckboxChange}
                        />{' '}
                        Agregar
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            name="actualizar"
                            checked={formData.actualizar}
                            onChange={handleCheckboxChange}
                        />{' '}
                        Actualizar
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            name="eliminar"
                            checked={formData.eliminar}
                            onChange={handleCheckboxChange}
                        />{' '}
                        Eliminar
                    </Label>
                </FormGroup>
            </div>
            </div>
            <button onClick={handleSubmitConValidacion} className="btn-styled">Crear Rol</button>
        </div>
    );
}

export default CrearRol;
