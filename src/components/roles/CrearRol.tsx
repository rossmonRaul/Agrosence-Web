import React, { useEffect, useState } from 'react';
import { FormGroup, Input, Label, Button } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import Swal from 'sweetalert2';
import '../../css/CrearCuenta.css'
import { CrearRolAPI } from '../../servicios/ServicioUsuario';
import {    
    ObtenerCategorias, 
    ObtenerOpcionesMenu
} from '../../servicios/ServicioUsuario';
import TableResponsive from "../../components/table/table.tsx";
import { IoAddCircle, IoSave } from 'react-icons/io5';

// Interfaz para las propiedades del componente AgregarEmpresa
interface AgregarRol {
    onAdd: () => void;
}

// Componente funcional CrearRol
const CrearRol: React.FC<AgregarRol> = ({ onAdd }) => {

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({});

    const [selectedCategoria, setSelectedCategoria] = useState<string>('');
    const [selectedOpcion, setSelectedOpcion] = useState<string>('');
    const [opcionesRol] = useState<any[]>([]);
    const [categoria, setCategoria] = useState<any[]>([]);
    const [opcion, setOpcion] = useState<any[]>([]);
    const [key, setKeyRender] = useState<any>(0);

    // const [opcionesRol, setOpcionesRol] = useState<any[]>([]);

    const handleCategoriaChange = (e: any) => {
        setSelectedCategoria(e.target.value);        

        setSelectedOpcion('');
        obtenerOpcionesMenu(e.target.value);
    };
   

    const obtenerOpcionesMenu = async (idCategoria?: any) => {
        const response = await ObtenerOpcionesMenu();

        if(idCategoria)
            setOpcion(response.filter((x: { idCategoriaMenu: number; }) => x.idCategoriaMenu === parseInt(idCategoria)));        
        else
            setOpcion(response);
    };

    const handleOpcionChange = (e?: any) => {
        setSelectedOpcion(e.target.value);
    };

    const handleAddAcceso = async () => {

        if(selectedOpcion !== ''){  
            
            if(opcionesRol.filter(x => x.idOpcionMenu === parseInt(selectedOpcion)).length > 0){
                Swal.fire({
                    title: 'Opción existente',
                    text: 'El rol ya cuenta con acceso a esta opción',
                    icon: 'info'
                });

                return;
            }

            const categoriaDesc = categoria.filter(x => x.idCategoria === parseInt(selectedCategoria))[0].descripcion;
            const opcionDesc = opcion.filter(x => x.idOpcion === parseInt(selectedOpcion))[0].descripcion;

            const data = {
                idOpcionMenu: parseInt(selectedOpcion),
                descCategoria: categoriaDesc,
                descOpcion: opcionDesc,
                estado: 1
            };       
            
            opcionesRol.push(data);    

            setKeyRender(key+1);

            Swal.fire({
                title: 'Opción agregada',
                text: 'La opción se agregó correctamente para el rol',
                icon: 'success'
            });
        }
        else{
            Swal.fire({
                title: 'Cuidado',
                text: 'Debe seleccionar una opción de menú válida',
                icon: 'warning'
            });
        }
    };  

    useEffect(() => {
        obtenerCategorias();
        obtenerOpcionesMenu();
    }, []);

    const obtenerCategorias = async () => {
        const response = await ObtenerCategorias();

        setCategoria(response);
    };

    const handleCheckboxChange = (e: { target: { name: any; checked: any; }; }) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked,
        });
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

        if(opcionesRol.length < 1){
            Swal.fire({
                title: "Rol sin accesos",
                text: "¿Crear rol sin acceso a opciones del menú por el momento?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí",
                cancelButtonText: "No"
            }).then(async (result) => {
                if (result.isConfirmed) {
                   crearRolBack();
                }
            });
        }
        else
        {
           crearRolBack();
        }
    };

    const crearRolBack = async() => {
        const datos = {
            nombreRol: formData.nombre,
            permisoAgregar: formData.agregar,
            permisoActualizar: formData.actualizar,
            permisoEliminar: formData.eliminar,
            AccesosMenuRol: opcionesRol
        };

        try {
            const resultado = await CrearRolAPI(datos);

            if(!resultado){
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar el rol',
                    text: "Ocurrió un error al contactar con el servicio",
                });
            }

            if (parseInt(resultado[0].indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: 'Rol creado ',
                    text: 'Rol creado correctamente',
                });

                onAdd();
            }
            else if (parseInt(resultado[0].indicador) === 2) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Nombre existente ',
                    text: 'Ya existe un rol con el mismo nombre',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al agregar el rol',
                    text: "Ocurrió un error al contactar con el servicio",
                });
            };            

        } catch (error) {
            console.log(error)
        }
    }

    const toggleStatus = async (opcionRol: any) => {
        Swal.fire({
            title: "Eliminar acceso",
            text: "¿Estás seguro de que deseas eliminar el acceso a "+opcionRol.descOpcion+"?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    let index = opcionesRol.findIndex(x => x.idOpcionMenu === parseInt(opcionRol.idOpcionMenu));
                    
                    if (index !== -1) {
                        opcionesRol.splice(index, 1); 
                    }
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Acceso eliminado',
                        text: 'Se eliminó el acceso correctamente',
                    });

                    setKeyRender(key+1)
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

    // Renderizado del componente
    return (
        <div>
            <div className="form-container-fse">
                <FormGroup row style={{padding: '0px'}}>
                    <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Nombre del rol"
                        value={formData.descripcion}
                        onChange={handleInputChange}                        
                        style={{marginTop: '1%'}}
                    />
                </FormGroup>
                <h4 style={{marginTop: '2%'}}>Permisos generales</h4>
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
            <h4 style={{marginTop: '1%', marginBottom: '1%'}}>Accesos del menú para el rol</h4>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '20px', justifyContent: 'space-between' }}>
                <FormGroup style={{ flex: 1, marginRight: '0.5rem' }}>
                    <Label for="categoria">Categoría:</Label><br />
                    <Input
                        type="select"
                        id="categoria"
                        value={selectedCategoria || ''}
                        onChange={handleCategoriaChange}
                        className="custom-select"
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
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '2%'}}
                    >
                        <option value="">Seleccione</option>
                        {opcion.map(opcion => (
                            <option key={opcion.idOpcion} value={opcion.idOpcion}>{opcion.descripcion}</option>
                        ))}
                    </Input>
                </FormGroup>
                <div style={{padding: '2%', marginTop: '2%'}}>
                    <Button color="primary" onClick={handleAddAcceso} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <IoAddCircle style={{marginRight: '5%'}}/> Agregar
                    </Button>                                
                </div>
            </div>                           
            
            <TableResponsive key={key} columns={columns} data={opcionesRol} itemsPerPage={2} btnActionName={"Eliminar"} toggleStatus={toggleStatus}/>
            <div className='botonesN'>
                <button onClick={handleSubmit} className="btn-styled"><IoSave size={20} style={{marginRight: '1%'}}/>Crear rol</button>
            </div>
        </div>
    );
}

export default CrearRol;
