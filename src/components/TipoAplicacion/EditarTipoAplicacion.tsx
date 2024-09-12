import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { EditarTipoAplicacion } from "../../servicios/ServicioTipoAplicacion.ts";
import '../../css/CrearCuenta.css';
import { IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente
interface TipoAplicacionSeleccionado {
    idTipoAplicacion: string;
    nombre: string;
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {

    nombre: string;

}

const ModificacionManejoFertilizante: React.FC<TipoAplicacionSeleccionado> = ({

    idTipoAplicacion,
    nombre,

    onEdit
}) => {



    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({

        idTipoAplicacion: '',
        nombre:'',
        usuarioAuditoria: ''
    });

    const [formData, setFormData] = useState<any>({

        idTipoAplicacion: '',
        nombre:'',
        usuarioAuditoria: ''

    });

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {

        setFormData({

            idTipoAplicacion: idTipoAplicacion,
            nombre: nombre,
        });
    }, [idTipoAplicacion]);


    // Obtener las fincas al cargar la página
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    //Se filtran las fincas del usuario

                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
    }, []);



    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Validar campos antes de avanzar al siguiente paso
        const newErrors: Record<string, string> = {};




        if (!formData.nombre.trim()) {
            newErrors.nombre = 'la unidad de medida es requerida';
        } else if (formData.nombre.length > 50) {
            newErrors.nombre = 'La unidad de medida no puede tener más de 50 caracteres';
        } else {
            newErrors.nombre = '';
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
        const idUsuario = localStorage.getItem('identificacionUsuario');
        const datos = {

            idTipoAplicacion: formData.idTipoAplicacion,
            nombre: formData.nombre,
            usuarioAuditoria: idUsuario
        };

        
        try {
            const resultado = await EditarTipoAplicacion(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: 'aplicacion Actualizada! ',
                    text: 'tipo de aplicacion actualizada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el tipo de aplicacion.',
                    text: resultado.mensaje,
                });
            };

            // vuelve a cargar la tabla

            if (onEdit) {
                onEdit();
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1 }}>
                    <FormGroup row>
                        <Label for="nombre" sm={4} className="input-label">Nombre</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                className={errors.nombre ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Cantidad de nombre"
                                style={{marginTop: '2%'}}
                            />
                            <FormFeedback>{errors.nombre}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>

            <div className='botonesN'>
                <Button onClick={handleSubmitConValidacion} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Actualizar</Button>
            </div>
        </div >
    );

};

export default ModificacionManejoFertilizante;
