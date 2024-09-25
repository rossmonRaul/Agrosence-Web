import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import '../../css/ManejoResiduos.css';
import { InsertarRegistroManoObra } from '../../servicios/ServicioManoObra.ts';
import { IoSave } from 'react-icons/io5';


interface CrearManoObraProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idFinca: number;
}

const CrearManoObra: React.FC<CrearManoObraProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        fecha: '',
        actividad: '',
        identificacion: '', 
        trabajador: '',
        horasTrabajadas: '',
        pagoPorHora: '',
        totalPago: '',
        usuarioCreacionModificacion: ''

    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));

        // Calculate total pago
        if (name === "horasTrabajadas" || name === "pagoPorHora") {
            const horasTrabajadasValue = name === "horasTrabajadas" ? parseFloat(value) : formData.horasTrabajadas;
            const pagoPorHoraValue = name === "pagoPorHora" ? parseFloat(value) : formData.pagoPorHora;
    
            // verificar que los valores sean numéricos
            if (!isNaN(horasTrabajadasValue as number) && !isNaN(pagoPorHoraValue as number)) {
                const pagoTotal = (horasTrabajadasValue as number) * (pagoPorHoraValue as number);
                formData.totalPago = pagoTotal.toString();
            } else {
                
                formData.totalPago = "";
            }
        }
    };

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    //Se filtran las fincas del usuario
                    const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    }
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
    }, []);


    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idFinca = value
        setSelectedFinca(value);

    };



    

    const handleSubmit = async () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};

        if (!formData.idFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!formData.actividad.trim()) {
            newErrors.actividad = 'La actividad es obligatoria';
        } else {
            newErrors.actividad = '';
        }

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

        if (!formData.identificacion.trim()) {
            newErrors.identificacion = 'La identificacion es obligatoria';
        } else {
            newErrors.identificacion = '';
        }

        if (!formData.horasTrabajadas) {
            newErrors.horasTrabajadas = 'Las horas trabajadas son obligatorias';
        } else if (parseFloat(formData.horasTrabajadas) <= 0) {
            newErrors.horasTrabajadas = 'Las horas trabajadas deben ser mayor a 0';
        }else {
            newErrors.horasTrabajadas = '';
        }

        if (!formData.trabajador || formData.trabajador === "") {
            newErrors.trabajador = 'El trabajador es obligatorio';
        } else if (formData.trabajador.length > 100) {
            newErrors.trabajador = 'el trabajador no pueden ser más de 100 carateres';
        } else {
            newErrors.trabajador = '';
        }

        if (!formData.pagoPorHora.trim()) {
            newErrors.pagoPorHora = 'El pago por hora es obligatorio';
        } else if (parseFloat(formData.pagoPorHora) <= 0) {
            newErrors.pagoPorHora = 'El pago por hora debe ser mayor a 0';
        }else {
            newErrors.pagoPorHora = '';
        }

        const fechaParts = formData.fecha.split("/");
        const fechaFormatted = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaDate = new Date(fechaFormatted);

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si fechaDate es mayor que hoy
        if (fechaDate > today) {
            newErrors.fecha = 'Fecha no puede ser mayor a hoy';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                const resultado = await InsertarRegistroManoObra(formData);
                
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro insertado!',
                        text: 'Se ha insertado la mano obra'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar la mano obra:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la mano obra',
                    text: 'Ocurrió un error al intentar insertar la mano de obra. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>

            <div>
                <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <div style={{ marginRight: '10px', width: '50%' }}>
                        <FormGroup>
                            <label htmlFor="fincas">Finca:</label>
                            <select className={errors.finca ? 'input-styled input-error' : 'input-styled'} id="fincas" 
                            style={{ fontSize: '16px', padding: '10px', width: '100%' }}
                            value={selectedFinca} onChange={handleFincaChange}>
                                <option key="default-finca" value="">Seleccione...</option>
                                {filteredFincas.map((finca) => (
                                    <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                                ))}
                            </select>
                            {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="actividad" sm={4} className="input-label">Actividad</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="actividad"
                                    name="actividad"
                                    value={formData.actividad}
                                    onChange={handleInputChange}
                                    className={errors.actividad ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Actividad"
                                />
                                <FormFeedback>{errors.actividad}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                </div>
                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                        <FormGroup row>
                            <Label for="identificacion" sm={4} className="input-label">Identificación</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="identificacion"
                                    name="identificacion"
                                    value={formData.identificacion}
                                    onChange={handleInputChange}
                                    className={errors.identificacion ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Identificación"
                                />
                                <FormFeedback>{errors.identificacion}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="trabajador" sm={4} className="input-label">Trabajador</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="trabajador"
                                    name="trabajador"
                                    value={formData.trabajador}
                                    onChange={handleInputChange}
                                    className={errors.trabajador ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Trabajador"
                                />
                                <FormFeedback>{errors.trabajador}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                </div>

                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                    <div style={{ marginRight: "10px", width: '50%' }}>
                        <FormGroup row>
                            <Label for="fecha" sm={4} className="input-label">Fecha</Label>
                            <Col sm={8}>
                                <Input
                                    type="date"
                                    id="fecha"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleInputChange}
                                    className={errors.fecha ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Selecciona una fecha"
                                />
                                <FormFeedback>{errors.fecha}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="horasTrabajadas" sm={4} className="input-label">Horas Trabajadas</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="horasTrabajadas"
                                    name="horasTrabajadas"
                                    value={formData.horasTrabajadas.toString()}
                                    onChange={handleInputChange}
                                    className={errors.horasTrabajadas ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.horasTrabajadas}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>


                </div>
                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                    
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                        <FormGroup row>
                            <Label for="pagoPorHora" sm={4} className="input-label">Pago por Hora (₡)</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="pagoPorHora"
                                    name="pagoPorHora"
                                    value={formData.pagoPorHora.toString()}
                                    onChange={handleInputChange}
                                    className={errors.pagoPorHora ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.pagoPorHora}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="montoTotal" sm={4} className="input-label">Monto Total (₡)</Label>
                            <Col sm={8}>
                                <Input
                                    readOnly
                                    type="number"
                                    id="montoTotal"
                                    name="montoTotal"
                                    value={formData.totalPago.toString()}
                                    onChange={handleInputChange}
                                    className={errors.montoTotal ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.montoTotal}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>


                </div>
                <div className='botonesN' style={{display:'flex', justifyContent:'center'}}>
                    <Button onClick={handleSubmit} className="btn-styled"  style={{display:'flex', justifyContent:'center'}}><IoSave size={20} style={{marginRight: '2%'}}/>Guardar</Button>
                </div>
            </div>
        </div>
    );

};

export default CrearManoObra;
