import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label, Button, Table } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { EditarParcelas } from '../../servicios/ServicioParcelas';

// Interfaz para las propiedades del componente EditarEmpresa
interface Props {
   descripcion: string;
    onEdit: () => void;
}
type Acceso = {
    categoria: string;
    opcion: string;
};
// Componente funcional EditarEmpresa
const EditarRol: React.FC<Props> = ({ descripcion, onEdit }) => {
    const [categoria, setCategoria] = useState("");
    const [opcion, setOpcion] = useState("");
    const [accesos, setAccesos] = useState<Acceso[]>([]);
    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ descripcion });

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        descripcion: '',
        agregar: false,
        actualizar: true,
        eliminar: true,
    });

    // Efecto para actualizar el formData cuando las props cambien
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            
            descripcion: descripcion,
            agregar: false,
            actualizar: true,
            eliminar: true,
        });
    }, [ descripcion]);


    const handleCategoriaChange = (e: any) => {
        setCategoria(e.target.value);
    };
    const handleOpcionChange = (e:any) => {
        setOpcion(e.target.value);
    };

    const objetoPruebaAcceso =[  {
        categoria: "catalogo1",
        opcion: "personas",
      },
      {
        categoria: "catalogo2",
        opcion: "clientes",
      },
      {
        categoria: "catalogo3",
        opcion: "vendedores",
      },]
    const handleAddAcceso = () => {
        if (categoria && opcion) {
            setAccesos([...accesos, { categoria, opcion }]);
            setCategoria("");
            setOpcion("");
        }
    };
    const handleRemoveAcceso = (index:any) => {
        const newAccesos = accesos.filter((_, i) => i !== index);
        setAccesos(newAccesos);
    };



    const handleCheckboxChange = (e: { target: { name: any; checked: any; }; }) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked,
        });
    };
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
        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripcion es requerida';
        } else {
            newErrors.descripcion = '';
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
            descripcion: formData.descripcion
        };
        try {
            const resultado = await EditarParcelas(datos);
            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Parcela Actualizada! ',
                    text: 'Parcela actualizada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la parcela.',
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
            {/* Descripción y botón de actualizar */}
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="descripcion" sm={12} className="input-label">Descripción: </Label>
                        <Col sm={12}>
                            <Input
                                type="text"
                                id="descripcion"
                                name="descripcion"
                                placeholder="Ingrese la descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                className={errors.nombre ? 'input-styled input-error' : 'input-styled'}
                            />
                            <FormFeedback>{errors.nombre}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                {/* Botón para actualizar */}
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <Button color="primary" block className="btn-styled" style={{ marginBottom: '20px', marginTop: '11%' }}>
                        Actualizar Nombre
                    </Button>
                </div>
            </div>

            {/* Permisos generales */}
            <h5>Permisos Generales</h5>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', justifyContent: 'space-between' }}>
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
            <br/>
            <h5>Accesos del Menu de Rol</h5>
            {/* Selectores para categoría y opción */}
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '20px', justifyContent: 'space-between' }}>
                <FormGroup style={{ flex: 1, marginRight: '0.5rem' }}>
                    <Label for="categoria">Categoría:</Label>
                    <Input
                        type="select"
                        id="categoria"
                        value={categoria}
                        onChange={handleCategoriaChange}
                    >
                        <option value="">Seleccione</option>
                        <option value="Reportes">Reportes</option>
                        <option value="Catálogos">Catálogos</option>
                        <option value="Viajes">Viajes</option>
                        <option value="Cobros">Cobros</option>
                    </Input>
                </FormGroup>

                <FormGroup style={{ flex: 1, marginLeft: '0.5rem' }}>
                    <Label for="opcion">Opción:</Label>
                    <Input
                        type="select"
                        id="opcion"
                        value={opcion}
                        onChange={handleOpcionChange}
                    >
                        <option value="">Seleccione</option>
                        <option value="Clientes">Clientes</option>
                        <option value="Vendedores">Vendedores</option>
                        <option value="Comisiones">Comisiones</option>
                        <option value="Formas de Pago">Formas de Pago</option>
                    </Input>
                </FormGroup>

                <Button color="primary" onClick={handleAddAcceso} style={{ marginLeft: '1rem', alignSelf: 'flex-end' }}>
                    + Agregar
                </Button>
            </div>

            {/* Tabla de accesos */}
            <Table bordered>
                <thead>
                    <tr>
                        <th>Categoría</th>
                        <th>Opción</th>
                        <th>Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    {accesos.map((acceso, index) => (
                        <tr key={index}>
                            <td>{acceso.categoria}</td>
                            <td>{acceso.opcion}</td>
                            <td>
                                <Button color="danger" onClick={() => handleRemoveAcceso(index)}>
                                    🗑️
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>

        <button onClick={handleSubmitConValidacion} className="btn-styled">Actualizar Datos</button>
    </div>
    );
}

export default EditarRol;

