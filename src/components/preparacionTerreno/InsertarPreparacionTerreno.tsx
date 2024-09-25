import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { InsertarPreparacionTerrenos, ObtenerDatosPreparacionTerrenoActividad, ObtenerDatosPreparacionTerrenoMaquinaria } from '../../servicios/ServicioPreparacionTerreno';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario';
import { IoSave } from 'react-icons/io5';

interface InsertarPreparacionTerrenoProps {
    onAdd: () => void;
}

interface Actividad {
    idActividad: number;
    nombre: string;
}

interface Maquinaria {
    idMaquinaria: number;
    nombre: string;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const InsertarPreparacionTerreno: React.FC<InsertarPreparacionTerrenoProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        fecha: '',
        idActividad: '',
        idMaquinaria: '',
        observaciones: '',
        identificacion: '',
        horasTrabajadas: '',
        pagoPorHora: '',
        usuarioCreacionModificacion: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;
                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario);
                    }
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();

        const obtenerDatosActividad = async () => {
            try {
                const actividadesResponse = await ObtenerDatosPreparacionTerrenoActividad();
                setActividades(actividadesResponse);
            } catch (error) {
                console.error('Error al obtener actividades:', error);
            }
        };

        const obtenerDatosMaquinaria = async () => {
            try {
                const maquinariasResponse = await ObtenerDatosPreparacionTerrenoMaquinaria();
                setMaquinarias(maquinariasResponse);
            } catch (error) {
                console.error('Error al obtener maquinarias:', error);
            }
        };

        obtenerDatosActividad();
        obtenerDatosMaquinaria();
    }, []);

    const obtenerParcelasDeFinca = async (idFinca: string) => {
        try {
            const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === parseInt(idFinca));
            setParcelasFiltradas(parcelasFinca);
        } catch (error) {
            console.error('Error al obtener las parcelas de la finca:', error);
        }
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
        obtenerParcelasDeFinca(value);
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        console.log(formData.idActividad)
        console.log(formData.idMaquinaria)
        if (!selectedFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!selectedParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        } else {
            newErrors.parcela = '';
        }

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es requerida';
        } else {
            const minDate = new Date('2015-01-01');
            const selectedDate = new Date(formData.fecha);
            if (selectedDate < minDate || selectedDate > new Date()) {
                newErrors.fecha = 'La fecha debe estar entre 2015 y la fecha actual';
            } else {
                newErrors.fecha = '';
            }
        }

        if (!formData.idActividad.trim()) {
            newErrors.actividad = 'El tipo de actividad es requerido';
        } else {
            newErrors.actividad = '';
        }

        if (!formData.idMaquinaria.trim()) {
            newErrors.maquinaria = 'La maquinaria es requerida';
        } else {
            newErrors.maquinaria = '';
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las observaciones son requeridas';
        } else if (formData.observaciones.length > 200) {
            newErrors.observaciones = 'Las observaciones no pueden tener más de 200 caracteres';
        } else {
            newErrors.observaciones = '';
        }

        if (!formData.identificacion.trim()) {
            newErrors.identificacion = 'La identificación es requerida';
        } else if (formData.identificacion.length > 50) {
            newErrors.identificacion = 'La identificación no puede tener más de 50 caracteres';
        } else {
            newErrors.identificacion = '';
        }

        if (!formData.horasTrabajadas.trim()) {
            newErrors.horasTrabajadas = 'Las horas trabajadas son requeridas';
        } else if (isNaN(Number(formData.horasTrabajadas))) {
            newErrors.horasTrabajadas = 'Las horas trabajadas deben ser un número';
        } else {
            newErrors.horasTrabajadas = '';
        }

        if (!formData.pagoPorHora.trim()) {
            newErrors.pagoPorHora = 'El pago por hora es requerido';
        } else if (isNaN(Number(formData.pagoPorHora))) {
            newErrors.pagoPorHora = 'El pago por hora debe ser un número';
        } else {
            newErrors.pagoPorHora = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                formData.idFinca = selectedFinca;
                formData.idParcela = selectedParcela;
                const totalPago = parseFloat(formData.horasTrabajadas) * parseFloat(formData.pagoPorHora);

                const resultado = await InsertarPreparacionTerrenos({
                    ...formData,
                    totalPago
                });

                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Manejo de preparación de terreno insertado!',
                        text: 'Se ha insertado la preparación de terreno con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar la preparación de terreno',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar la preparación de terreno:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la preparación de terreno',
                    text: 'Ocurrió un error al intentar insertar la preparación de terreno. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '98%',justifyContent: 'center', marginLeft: '9px',marginRight: '0', gap: '0'}}>
                <FormGroup style={{margin: '5px', width: '65%',padding: '0px',flexGrow: '1', maxWidth:' 100%'}}>
                    <label htmlFor="fincas">Finca:</label>
                    <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange} style={{marginTop: '1%', height: '55%'}}>
                        <option key="default-finca" value="">Seleccione...</option>
                        {filteredFincas.map((finca) => (
                            <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                </FormGroup>

                <FormGroup style={{margin: '5px', width: '65%',padding: '0px',flexGrow: '1', maxWidth:' 100%'}}>
                    <label htmlFor="parcelas">Parcela:</label>
                    <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange} style={{marginTop: '1%', height: '55%'}}>
                        <option key="default-parcela" value="">Seleccione...</option>
                        {parcelasFiltradas.map((parcela) => (
                            <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                </FormGroup>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
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
                                style={{marginTop: '1%'}}
                            />
                            <FormFeedback>{errors.fecha}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="actividad" sm={4} className="input-label">Actividad</Label>
                        <Col sm={8}>
                            <Input
                                type="select"
                                id="idActividad"
                                name="idActividad"
                                value={formData.idActividad}
                                onChange={handleInputChange}
                                className={errors.actividad ? 'input-styled input-error' : 'input-styled'}
                                style={{marginTop: '1%',height: '44px'}}
                            >
                                <option value="">Seleccione...</option>
                                {actividades.map((actividad) => (
                                    <option key={actividad.idActividad} value={actividad.idActividad}>{actividad.nombre}</option>
                                ))}
                            </Input>
                            <FormFeedback>{errors.actividad}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="maquinaria" sm={4} className="input-label">Maquinaria</Label>
                        <Col sm={8}>
                            <Input
                                type="select"
                                id="idMaquinaria"
                                name="idMaquinaria"
                                value={formData.idMaquinaria}
                                onChange={handleInputChange}
                                className={errors.maquinaria ? 'input-styled input-error' : 'input-styled'}
                                style={{marginTop: '1%', width: '103%',height: '44px'}}
                            >
                                <option value="">Seleccione...</option>
                                {maquinarias.map((maquinaria) => (
                                    <option key={maquinaria.idMaquinaria} value={maquinaria.idMaquinaria}>{maquinaria.nombre}</option>
                                ))}
                            </Input>
                            <FormFeedback>{errors.maquinaria}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="identificacion" sm={2} className="input-label">Identificación</Label>
                        <Col sm={10}>
                            <Input
                                type="text"
                                id="identificacion"
                                name="identificacion"
                                value={formData.identificacion}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Identificación"
                                maxLength={50}
                                style={{marginTop: '1%'}}
                            />
                            <FormFeedback>{errors.identificacion}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="horasTrabajadas" sm={2} className="input-label">Horas trabajadas</Label>
                        <Col sm={10}>
                            <Input
                                type="number"
                                id="horasTrabajadas"
                                name="horasTrabajadas"
                                value={formData.horasTrabajadas}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Horas trabajadas"
                                style={{marginTop: '1%'}}
                            />
                            <FormFeedback>{errors.horasTrabajadas}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="pagoPorHora" sm={2} className="input-label">Pago por hora</Label>
                        <Col sm={10}>
                            <Input
                                type="number"
                                id="pagoPorHora"
                                name="pagoPorHora"
                                value={formData.pagoPorHora}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Pago por hora"
                                style={{marginTop: '1%', width: '103%'}}
                            />
                            <FormFeedback>{errors.pagoPorHora}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>

            <FormGroup row style={{marginLeft:'10px'}}>
                <Label for="observaciones" sm={2} className="input-label">Observaciones</Label>
                <Col sm={10}>
                    <Input
                        type="textarea"
                        id="observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        className="input-styled"
                        style={{ height: '75px', resize: "none", marginTop: '1%' }}
                        placeholder="Observaciones"
                        maxLength={200}
                    />
                    <FormFeedback>{errors.observaciones}</FormFeedback>
                </Col>
            </FormGroup>

            <div className='botonesN' style={{display:'flex', justifyContent:'center'}}>
                <Button onClick={handleSubmit} className="btn-styled"  style={{width:'50%'}}><IoSave size={20} style={{marginRight: '1%'}}/>Guardar</Button>
            </div>
        </div>
    );
};

export default InsertarPreparacionTerreno;
