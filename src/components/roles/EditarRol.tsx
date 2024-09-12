import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback, Col, Input, Label, Button, Table } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { IoAddCircle, IoCheckmark, IoSave } from 'react-icons/io5';
import {    
    ActualizarNombreRol, 
    CambiarPermisosRol, 
    ObtenerCategorias, 
    ObtenerOpcionesMenu,
    ObtenerOpcionesRol,
    AgregarAccesoMenuRol,
    EliminarPermisosRolMenu
} from '../../servicios/ServicioUsuario';
import TableResponsive from "../../components/table/table.tsx";

// Interfaz para las propiedades del componente EditarEmpresa
interface Props {
    rol: any;
    onEdit(): void;
}
type Acceso = {
    categoria: string;
    opcion: string;
};

// Componente funcional EditarEmpresa
const EditarRol: React.FC<Props> = ({ rol }) => {   

    const [categoria, setCategoria] = useState<any[]>([]);
    const [opcion, setOpcion] = useState<any[]>([]);
    const [opcionesRol, setOpcionesRol] = useState<any[]>([]);
    const [selectedCategoria, setSelectedCategoria] = useState<string>('');
    const [selectedOpcion, setSelectedOpcion] = useState<string>('');
    const [accesos, setAccesos] = useState<Acceso[]>([]);
    // Estado para almacenar los errores de validación del formulario
    const [errors] =  useState<Record<string, string>>({});

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState({
        rol: {
            idRol: rol.idRol,
            nombreRol: '',
            permisoAgregar: false,
            permisoActualizar: false,
            permisoEliminar: false
        }
    });

    // Efecto para actualizar el formData cuando las props cambien
    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({            
            rol: rol
        });

        console.log(localStorage.getItem('empresaUsuario'))

        obtenerCategorias();
        obtenerOpcionesMenu();
        obtenerOpcionesRol();
    }, [ rol ]);

    const obtenerCategorias = async () => {
        const response = await ObtenerCategorias();

        setCategoria(response);
    };

    const obtenerOpcionesMenu = async (idCategoria?: any) => {
        const response = await ObtenerOpcionesMenu();

        if(idCategoria)
            setOpcion(response.filter((x: { idCategoriaMenu: number; }) => x.idCategoriaMenu === parseInt(idCategoria)));        
        else
            setOpcion(response);
    };

    const obtenerOpcionesRol = async() => {
        if(formData.rol){
            const data = {
                idRol: formData.rol.idRol
            };

            const response = await ObtenerOpcionesRol(data);

            setOpcionesRol(response);
        }
    };

    const handleCategoriaChange = (e: any) => {
        setSelectedCategoria(e.target.value);        

        obtenerOpcionesMenu(e.target.value);
    };

    const handleOpcionChange = (e:any) => {
        setSelectedOpcion(e.target.value);
    };

    const handleChangeName = async () => {
        let continuar = true;

        if(formData.rol.nombreRol.trim().length < 1) continuar = false;

        if(!continuar){
            Swal.fire({
                icon: 'warning',
                title: 'Cuidado',
                text: 'Debe agregar un nombre de rol válido',
            });
        }
        else{
            let data = {
                idRol: formData.rol.idRol,
                nombreRol: formData.rol.nombreRol
            }

            const response = await ActualizarNombreRol(data);

            if(response[0].indicador === 1){
                Swal.fire({
                    title: 'Rol actualizado',
                    text: 'El nombre del rol se actualizó correctamente',
                    icon: 'success'
                });
            }
            
        }
    };

    const handleCheckboxChange = (e: { target: { name: any; checked: any; }; }) => {
        const { name, checked } = e.target;

        setFormData((prevState: any) => ({
            ...prevState,
            rol: {
                ...prevState.rol,
                [name]: checked // Actualizamos la propiedad dentro de rol
            }
        }));
    };
    
    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
    
        setFormData((prevState: any) => ({
            ...prevState,
            rol: {
                ...prevState.rol,
                [name]: value // Actualizamos la propiedad dentro de rol
            }
        }));
    };  

    // Función para manejar actualización de permisos
    const handleSubmitPermisos = async () => {
        const data = {
            IdRol: formData.rol.idRol,
            permiteAgregar: formData.rol.permisoAgregar,
            permiteActualizar: formData.rol.permisoActualizar,
            permiteEliminar: formData.rol.permisoEliminar
        };        
        
        const response = await CambiarPermisosRol(data);

        if (parseInt(response[0].indicador) === 1) {
            Swal.fire({
                icon: 'success',
                title: 'Permisos actualizados',
                text: 'Se actualizaron los permisos correctamente',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error.',
                text: 'Ocurrió un error al actualizar los permisos del rol',
            });
        }
    };

    const handleAddAcceso = async () => {
        if(selectedOpcion !== ''){        
            const data = {
                idRol: formData.rol.idRol,
                idOpcionMenu: selectedOpcion 
            };

            const response = await AgregarAccesoMenuRol(data);

            if(response[0].indicador === 1){
                Swal.fire({
                    title: 'Opción agregada',
                    text: 'La opción se agregó correctamente para el rol',
                    icon: 'success'
                })
            }
            else if(response[0].indicador === 2){
                Swal.fire({
                    title: 'Ya existe',
                    text: 'El rol ya cuenta con acceso a la opción elegida',
                    icon: 'info'
                })
            }
            else{
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al agregar la opción para el rol',
                    icon: 'error'
                })
            }
        }
        else{
            Swal.fire({
                title: 'Cuidado',
                text: 'Debe seleccionar una opción de menú válida',
                icon: 'warning'
            });
        }
    };


    const toggleStatus = async (opcionRol: any) => {
        Swal.fire({
            title: "Quitar acceso",
            text: "¿Estás seguro de que deseas quitar el acceso a "+opcionRol.descOpcion+" al rol "+formData.rol.nombreRol+"?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idRol: rol.idRol,
                        idOpcionMenu: opcionRol.idOpcion
                    };

                    const resultado = await EliminarPermisosRolMenu(datos);
                    
                    if (parseInt(resultado[0].indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Acceso eliminado',
                            text: 'Se eliminó el acceso correctamente',
                        });
                        await obtenerOpcionesRol();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al quitar el acceso',
                            text: 'Ocurrió un error al quitar el acceso al rol',
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al quitar el acceso para el rol", "", "error");                    
                }
            }
        });
    };

    const columns = [
        { key: 'descCategoria', header: 'Categoría' },
        { key: 'descOpcion', header: 'Opción' },
        { key: 'acciones', header: 'Acción', actions: true }
    ];

    return (
        <div>
        <div className="form-container-fse">
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="nombreRol" sm={12} className="input-label">Nombre: </Label>
                        <Col sm={12}>
                            <Input
                                type="text"
                                id="nombreRol"
                                name="nombreRol"
                                placeholder="Nombre del rol"
                                value={formData.rol.nombreRol}
                                onChange={handleInputChange}
                                className={errors.nombre ? 'input-styled input-error' : 'input-styled'}
                            />
                            <FormFeedback>{errors.nombre}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                
                <div className='botonesN' style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <Button color="primary" block className="btn-styled" style={{ marginBottom: '20px', marginTop: '11%' }} onClick={handleChangeName}>
                    <IoCheckmark size={20} style={{marginRight: '2%'}}/>Actualizar nombre
                    </Button>
                </div>
            </div>

            <h4>Permisos generales</h4>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', justifyContent: 'space-between' }}>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            name="permisoAgregar"
                            checked={formData.rol.permisoAgregar}
                            onChange={handleCheckboxChange}
                        />{' '}
                        Agregar
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            name="permisoActualizar"
                            checked={formData.rol.permisoActualizar}
                            onChange={handleCheckboxChange}
                        />{' '}
                        Actualizar
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            name="permisoEliminar"
                            checked={formData.rol.permisoEliminar}
                            onChange={handleCheckboxChange}
                        />{' '}
                        Eliminar
                    </Label>
                </FormGroup>
            </div>
            <div className='botonesN'>
                <button onClick={handleSubmitPermisos} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Actualizar permisos</button>
            </div>
            <br />

            <h4>Accesos del menú para el rol</h4>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '20px', justifyContent: 'space-between' }}>
                <FormGroup style={{ flex: 1, marginRight: '0.5rem' }}>
                    <Label for="categoria">Categoría:</Label><br />
                    <Input
                        type="select"
                        id="categoria"
                        value={selectedCategoria || ''}
                        onChange={handleCategoriaChange}
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '2%'}}
                    >
                        <option value="">Seleccione</option>
                        {categoria.map(categoria => (
                            <option key={categoria.idCategoria} value={categoria.idCategoria}>{categoria.descripcion}</option>
                        ))}
                    </Input>
                </FormGroup>

                <FormGroup style={{ flex: 1, marginLeft: '0.5rem' }}>
                    <Label for="opcion">Opción de menú:</Label>
                    <Input
                        type="select"
                        id="opcion"
                        value={selectedOpcion || ''}
                        onChange={handleOpcionChange}
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '2%'}}
                    >
                        <option value="">Seleccione</option>
                        {opcion.map(opcion => (
                            <option key={opcion.idOpcion} value={opcion.idOpcion}>{opcion.descripcion}</option>
                        ))}
                    </Input>
                </FormGroup>                                
            </div>
            <div className='botonesN'>
                <Button color="primary"
                    onClick={handleAddAcceso}       
                >
                    <IoAddCircle style={{marginRight: '5%'}}/> Agregar
                </Button>
            </div>
            
            <TableResponsive columns={columns} data={opcionesRol} itemsPerPage={2} btnActionName={"Eliminar"} toggleStatus={toggleStatus}/>           
        </div>        
    </div>
    );
}

export default EditarRol;

