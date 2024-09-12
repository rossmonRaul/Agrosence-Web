import React, { useEffect, useState } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { CrearRolAPI } from '../../servicios/ServicioUsuario';
import { IoSave } from 'react-icons/io5';

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

    // Función para manejar el envío del formulario(metodo para guardar)
    const handleSubmit = async () => {

        let continuar;

        if(!formData.nombre) {
            Swal.fire({
                icon: 'warning',
                title: 'Cuidado',
                text: "Ingrese un nombre de rol",
            });

            return;
        }
        else if(formData.nombre.trim().length < 1){
            Swal.fire({
                icon: 'warning',
                title: 'Cuidado',
                text: "Ingrese un nombre de rol",
            });
            
            return;
        }

        const datos = {
            nombreRol: formData.nombre,
            permisoAgregar: formData.agregar,
            permisoActualizar: formData.actualizar,
            permisoEliminar: formData.eliminar
        };

        try {
            const resultado = await CrearRolAPI(datos);

            console.log(resultado)

            if (parseInt(resultado[0].indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: 'Rol creado ',
                    text: 'Rol creado correctamente',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar el rol',
                    text: "Ocurrió un error al contactar con el servicio",
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
            <div style={{ flex: 1 }}>
                <FormGroup row>
                    <Label for="nombre" sm={2} className="input-label">Nombre:</Label>
                    <Col sm={12}>
                        <Input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Nombre del rol"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur('nombre')} // Manejar blur para quitar el mensaje de error
                            className={errors.descripcion ? 'input-styled input-error' : 'input-styled'} // Aplicar clase 'is-invalid' si hay un error
                            style={{marginTop: '3%'}}
                        />
                        <FormFeedback>{errors.descripcion}</FormFeedback>
                    </Col>
                </FormGroup>
                </div>
                <h5>Permisos generales</h5>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent:' space-between', marginTop: '2%' }}>
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
            <br />
            <div className='botonesN'>
                <button onClick={handleSubmit} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Crear rol</button>
            </div>
        </div>
    );
}

export default CrearRol;
