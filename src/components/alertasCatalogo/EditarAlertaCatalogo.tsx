import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario';
import { ObtenerMedicionesSensorYNomenclatura, ObtenerRolesPorIdentificacion, ModificarAlertaCatalogo } from '../../servicios/ServiciosAlertasCatalogo';
import '../../css/CrearCuenta.css';
import { IoSaveOutline } from 'react-icons/io5';

interface AlertaCatalogoSeleccionado {
    idFinca: number;
    idParcela: number;
    idAlerta: number;
    nombreAlerta: string;
    idMedicionSensor: string;
    condicion: string;
    parametrodeConsulta: number;
    usuarioCreacion: string;
    usuariosNotificacion: string;
    onEdit?: () => void;
    readOnly?: boolean;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const ModificacionAlertaCatalogo: React.FC<AlertaCatalogoSeleccionado> = ({
    idFinca,
    idParcela,
    idAlerta,
    nombreAlerta,
    idMedicionSensor,
    condicion,
    parametrodeConsulta,
    usuarioCreacion,
    usuariosNotificacion,
    onEdit,
    readOnly = false
}) => {
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [medicionesSensor, setMedicionesSensor] = useState<any[]>([]);
    const [rolesUsuario, setRolesUsuario] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');
    const [formData, setFormData] = useState<any>({
        idFinca: idFinca,
        idParcela: idParcela,
        idAlerta: idAlerta,
        nombreAlerta: nombreAlerta,
        idMedicionSensor: idMedicionSensor,
        condicion: condicion,
        parametrodeConsulta: parametrodeConsulta,
        usuarioCreacion: usuarioCreacion,
        usuariosNotificacion: usuariosNotificacion
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;
                    const usuario = identificacionString;
                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);

                    const fincasResponse = await ObtenerFincas();
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);

                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario);

                    // Obtener mediciones de sensores
                    const medicionesResponse = await ObtenerMedicionesSensorYNomenclatura();
                    setMedicionesSensor(medicionesResponse);

                    // Obtener roles de usuarios
                    const rolesResponse = await ObtenerRolesPorIdentificacion({ usuario });
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

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
        setFormData((prevState: any) => ({
            ...prevState,
            idFinca: parseInt(value, 10),
            idParcela: ''
        }));
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
        setFormData((prevState: any) => ({
            ...prevState,
            idParcela: parseInt(value, 10)
        }));
    };

    const handleRolesUsuarioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setFormData((prevState: any) => {
            const updatedRoles = checked
                ? [...prevState.usuariosNotificacion.split(','), value].join(',')
                : prevState.usuariosNotificacion.split(',').filter((role: string) => role !== value).join(',');
            return { ...prevState, usuariosNotificacion: updatedRoles };
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: name === 'parametrodeConsulta' ? parseFloat(value) : value
        }));
    };

    const handleSubmitConValidacion = () => {
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

        if (isNaN(formData.parametrodeConsulta)) {
            newErrors.parametrodeConsulta = 'El parámetro de consulta debe ser un número';
        } else {
            newErrors.parametrodeConsulta = '';
        }

        if (!formData.usuariosNotificacion.trim()) {
            newErrors.usuariosNotificacion = 'Los usuarios de notificación son requeridos';
        } else {
            newErrors.usuariosNotificacion = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const datos = {
            idAlerta: formData.idAlerta,
            idFinca: parseInt(selectedFinca, 10),
            idParcela: parseInt(selectedParcela, 10),
            nombreAlerta: formData.nombreAlerta,
            idMedicionSensor: formData.idMedicionSensor,
            condicion: formData.condicion,
            parametrodeConsulta: parseFloat(formData.parametrodeConsulta),
            usuariosNotificacion: formData.usuariosNotificacion,
            usuarioCreacion: formData.usuarioCreacion,
            usuarioModificacion: formData.usuarioCreacion,
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString(),
            estado: true
        };

        try {
            const resultado = await ModificarAlertaCatalogo(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Alerta del Catálogo Actualizada!',
                    text: 'Alerta del Catálogo actualizada con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la Alerta del Catálogo.',
                    text: resultado.mensaje,
                });
            }

            if (onEdit) {
                onEdit();
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '200%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
    
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FormGroup style={{ flex: 1, marginRight: '1rem' }}>
                        <label htmlFor="fincas">Finca:</label>
                        <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange} disabled={readOnly} style={{ height: '40px' }}>
                            <option key="default-finca" value="">Seleccione...</option>
                            {fincas.map((finca) => (
                                <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                    </FormGroup>
    
                    <FormGroup style={{ flex: 1, marginLeft: '1rem' }}>
                        <label htmlFor="parcelas">Parcela:</label>
                        <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange} disabled={readOnly} style={{ height: '40px' }}>
                            <option key="default-parcela" value="">Seleccione...</option>
                            {filteredParcelas.map((parcela) => (
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
                            disabled={readOnly}
                        />
                        {errors.nombreAlerta && <FormFeedback>{errors.nombreAlerta}</FormFeedback>}
                    </FormGroup>
    
                    <FormGroup style={{ flex: 1, marginLeft: '1rem' }}>
                        <Label for="idMedicionSensor">ID Medición Sensor</Label>
                        <Input
                            style={{ height: '40px' }}
                            type="select"
                            id="idMedicionSensor"
                            name="idMedicionSensor"
                            value={formData.idMedicionSensor}
                            onChange={handleInputChange}
                            className={errors.idMedicionSensor ? 'input-styled input-error same-width-input' : 'input-styled same-width-input'}
                            disabled={readOnly}
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
                            style={{ height: '40px' }}
                            type="select"
                            id="condicion"
                            name="condicion"
                            value={formData.condicion}
                            onChange={handleInputChange}
                            className={errors.condicion ? 'input-styled input-error same-width-input' : 'input-styled same-width-input'}
                            disabled={readOnly}
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
                            onChange={handleInputChange}
                            className={errors.parametrodeConsulta ? 'input-styled input-error same-width-input' : 'input-styled same-width-input'}
                            placeholder="Parámetro de Consulta"
                            style={{ height: '40px', width: '100%' }}
                            disabled={readOnly}
                        />
                        {errors.parametrodeConsulta && <FormFeedback>{errors.parametrodeConsulta}</FormFeedback>}
                    </FormGroup>
                </div>
    
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                    <FormGroup style={{ flex: 1, marginRight: '1rem' }}>
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
                                            checked={formData.usuariosNotificacion.split(',').includes(rol.idRol.toString())}
                                            disabled={readOnly}
                                        />
                                        <span style={{ marginLeft: '8px' }}>{rol.nombreRol}</span>
                                    </Label>
                                </FormGroup>
                            ))}
                        </div>
                        {errors.rolesUsuario && <FormFeedback>{errors.rolesUsuario}</FormFeedback>}
                    </FormGroup>
                </div>
                {!readOnly && (
                    <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                            <Button onClick={handleSubmitConValidacion} className="btn-styled" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IoSaveOutline size={20} style={{ marginRight: '8px' }} />
                                Guardar
                            </Button>
                        </Col>
                    </FormGroup>
                )}
            </div>
        </div>
    );
};

export default ModificacionAlertaCatalogo;
