import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { IoSaveOutline } from 'react-icons/io5';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { InsertarAlertaCatalogo } from '../../servicios/ServiciosAlertasCatalogo';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario';
import { ObtenerMedicionesSensorYNomenclatura, ObtenerRolesPorIdentificacion } from '../../servicios/ServiciosAlertasCatalogo';

interface InsertarAlertaCatalogoProps {
    onAdd: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const InsertarAlertaCatalogoComponent: React.FC<InsertarAlertaCatalogoProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        nombreAlerta: '',
        idMedicionSensor: '',
        condicion: '',
        parametrodeConsulta: '',
        rolesUsuario: [] as string[],
        usuarioCreacion: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [medicionesSensor, setMedicionesSensor] = useState<any[]>([]);
    const [rolesUsuario, setRolesUsuario] = useState<any[]>([]);

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;
                    const usuario = identificacionString;
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
                    // Obtener mediciones de sensores
                    const medicionesResponse = await ObtenerMedicionesSensorYNomenclatura();
                    setMedicionesSensor(medicionesResponse);

                    // Obtener roles de usuarios
                    const rolesResponse = await ObtenerRolesPorIdentificacion({ usuario: usuario });
                    setRolesUsuario(rolesResponse);
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
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

    const handleRolesUsuarioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setFormData(prevState => {
            const updatedRoles = checked
                ? [...prevState.rolesUsuario, value]
                : prevState.rolesUsuario.filter(role => role !== value);
            return { ...prevState, rolesUsuario: updatedRoles };
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleParametroConsultaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const regex = /^[0-9.,-]*$/; // Permite números, comas, puntos y signos negativos
        if (regex.test(value)) {
            setFormData(prevState => ({
                ...prevState,
                parametrodeConsulta: value
            }));
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

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

        if (!formData.nombreAlerta.trim()) {
            newErrors.nombreAlerta = 'El nombre de la alerta es requerido';
        } else {
            newErrors.nombreAlerta = '';
        }

        if (!formData.idMedicionSensor.trim()) {
            newErrors.idMedicionSensor = 'La identificación del sensor es requerida';
        } else {
            newErrors.idMedicionSensor = '';
        }

        if (!formData.condicion.trim()) {
            newErrors.condicion = 'La condición es requerida';
        } else {
            newErrors.condicion = '';
        }

        if (!formData.parametrodeConsulta.trim()) {
            newErrors.parametrodeConsulta = 'El parámetro de consulta es requerido';
        } else {
            newErrors.parametrodeConsulta = '';
        }

        if (formData.rolesUsuario.length === 0) {
            newErrors.rolesUsuario = 'Debe seleccionar al menos un rol de usuario';
        } else {
            newErrors.rolesUsuario = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                const idFinca = selectedFinca ? parseInt(selectedFinca) : null;
                const idParcela = selectedParcela ? parseInt(selectedParcela) : null;

                if (!idFinca || !idParcela) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en los datos',
                        text: 'Debe seleccionar una finca y una parcela válidas.'
                    });
                    return;
                }

                const usuarioCreacion = localStorage.getItem('identificacionUsuario') || '';

                // Convertir los roles seleccionados en una cadena separada por comas
                const usuariosNotificacion = formData.rolesUsuario.join(',');

                const dataToSend = {
                    idFinca: idFinca,
                    idParcela: idParcela,
                    nombreAlerta: formData.nombreAlerta,
                    idMedicionSensor: formData.idMedicionSensor,
                    condicion: formData.condicion,
                    parametrodeConsulta: parseFloat(formData.parametrodeConsulta),
                    usuariosNotificacion: usuariosNotificacion,
                    usuarioCreacion: usuarioCreacion,
                    fechaCreacion: new Date().toISOString(),
                    usuarioModificacion: usuarioCreacion,
                    fechaModificacion: new Date().toISOString(),
                    estado: true
                };

                // Log the data to the console
                console.log('Datos enviados a la API:', dataToSend);

                const resultado = await InsertarAlertaCatalogo(dataToSend);

                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Alerta insertada!',
                        text: 'Se ha insertado la alerta con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar la alerta',
                        text: resultado.mensaje
                    });
                }
            } catch (error) {
                console.error('Error al insertar la alerta:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la alerta',
                    text: 'Ocurrió un error al intentar insertar la alerta. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '200%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
    
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FormGroup style={{ flex: 1, marginRight: '1rem' }}>
                        <label htmlFor="fincas">Finca:</label>
                        <select className="custom-select same-width-input" id="fincas" value={selectedFinca} onChange={handleFincaChange} style={{ height: '40px'}}>
                            <option key="default-finca" value="">Seleccione...</option>
                            {filteredFincas.map((finca) => (
                                <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                    </FormGroup>
    
                    <FormGroup style={{ flex: 1, marginLeft: '1rem' }}>
                        <label htmlFor="parcelas">Parcela:</label>
                        <select className="custom-select same-width-input" id="parcelas" value={selectedParcela} onChange={handleParcelaChange} style={{ height: '40px'}}>
                            <option key="default-parcela" value="">Seleccione...</option >
                            {parcelasFiltradas.map((parcela) => (
                                <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                    </FormGroup>
                </div>
    
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FormGroup style={{ flex: 1, marginRight: '1rem' }}>
                        <Label for="nombreAlerta">Nombre de la Alerta</Label>
                        <Input
                            type="text"
                            id="nombreAlerta"
                            name="nombreAlerta"
                            value={formData.nombreAlerta}
                            onChange={handleInputChange}
                            className={errors.nombreAlerta ? 'input-styled input-error same-width-input' : 'input-styled same-width-input'}
                            placeholder="Nombre de la Alerta"
                        />
                        {errors.nombreAlerta && <FormFeedback>{errors.nombreAlerta}</FormFeedback>}
                    </FormGroup>
    
                    <FormGroup style={{ flex: 1, marginLeft: '1rem' }}>
                        <Label for="idMedicionSensor">ID Medición Sensor</Label>
                        <Input
                            type="select"
                            id="idMedicionSensor"
                            name="idMedicionSensor"
                            value={formData.idMedicionSensor}
                            onChange={handleInputChange}
                            className={errors.idMedicionSensor ? 'input-styled input-error same-width-input' : 'input-styled same-width-input'}
                            style={{ height: '40px' }}
                        >
                            <option value="">Seleccione...</option>
                            {medicionesSensor.map((medicion) => (
                                <option key={medicion.idMedicion} value={medicion.idMedicion}>
                                    {`${medicion.nombre} (${medicion.nomenclatura})`}
                                </option>
                            ))}
                        </Input>
                        {errors.idMedicionSensor && <FormFeedback>{errors.idMedicionSensor}</FormFeedback>}
                    </FormGroup>
                </div>
    
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FormGroup style={{ flex: 1, marginRight: '1rem' }}>
                        <Label for="condicion">Condición</Label>
                        <Input
                            type="select"
                            id="condicion"
                            name="condicion"
                            value={formData.condicion}
                            onChange={handleInputChange}
                            className={errors.condicion ? 'input-styled input-error same-width-input' : 'input-styled same-width-input'}
                            style={{ height: '40px' }}
                        >
                            <option value="">Seleccione...</option>
                            <option value="=">Igual (=)</option>
                            <option value="<">Menor que (&lt;)</option>
                            <option value=">">Mayor que (&gt;)</option>
                        </Input>
                        {errors.condicion && <FormFeedback>{errors.condicion}</FormFeedback>}
                    </FormGroup>
    
                    <FormGroup style={{ flex: 1, marginLeft: '1rem' }}>
                        <Label for="parametrodeConsulta">Parámetro de Consulta</Label>
                        <Input 
                            type="text"
                            id="parametrodeConsulta"
                            name="parametrodeConsulta"
                            value={formData.parametrodeConsulta}
                            onChange={handleParametroConsultaChange}
                            className={errors.parametrodeConsulta ? 'input-styled input-error same-width-input' : 'input-styled same-width-input'}
                            placeholder="Parámetro de Consulta"
                            style={{ height: '40px', width: '100%' }}
                        />
                        {errors.parametrodeConsulta && <FormFeedback>{errors.parametrodeConsulta}</FormFeedback>}
                    </FormGroup>
                </div>
    
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FormGroup style={{ flex: 1, marginRight: '-2rem' }}>
                        <Label for="rolesUsuario">Roles Usuario</Label>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '10px',
                            maxHeight: '200px', 
                            overflowY: rolesUsuario.length > 10 ? 'auto' : 'visible', 
                            
                            padding: '10px'
                        }}>
                            {rolesUsuario.map((rol) => (
                                <FormGroup check key={rol.idRol} style={{ margin: 0 }}>
                                    <Label check style={{ display: 'flex', alignItems: 'center' }}>
                                        <Input 
                                            type="checkbox"
                                            value={rol.idRol}
                                            onChange={handleRolesUsuarioChange}
                                        />
                                        <span style={{ marginLeft: '8px' }}>{rol.nombreRol}</span>
                                    </Label>
                                </FormGroup>
                            ))}
                        </div>
                        {errors.rolesUsuario && <FormFeedback>{errors.rolesUsuario}</FormFeedback>}
                    </FormGroup>
                </div>

                <FormGroup row>
                    <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={handleSubmit} className="btn-styled" style={{marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <IoSaveOutline size={20} style={{ marginRight: '8px' }} />
                            Guardar
                        </Button>
                    </Col>
                </FormGroup>
                
            </div>
        </div>
    );
    
};

export default InsertarAlertaCatalogoComponent;
