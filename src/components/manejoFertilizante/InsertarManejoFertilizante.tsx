import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import { InsertarManejoFertilizantes } from '../../servicios/ServicioFertilizantes.ts';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerTipoFertilizantes } from '../../servicios/ServicioTipoFertilizante.ts';
import { ObtenerTipoAplicacion } from '../../servicios/ServicioTipoAplicacion.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';

interface InsertarManejoFertilizanteProps {
    onAdd: () => void;
}

interface Props {
    identificacion: string;
    idEmpresa: number;
};

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const InsertarManejoFertilizante: React.FC<InsertarManejoFertilizanteProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        fechaCreacion: '',
        fertilizante: '',
        Aplicacion: '',
        dosis: '',
        dosisUnidad: '',
        cultivoTratado: '',
        condicionesAmbientales: '',
        accionesAdicionales: '',
        observaciones: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [tiposFertilizantes, setTiposFertilizantes] = useState<string[]>([]);
    const [TipoAplicacion, setTipoAplicacion] = useState<string[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas();
                    //se filtran las parcelas con los idparcelasusuario
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)

                    // Obtener tipos de fertilizantes
                    const tiposFertilizantesResponse = await ObtenerTipoFertilizantes();
                    setTiposFertilizantes(tiposFertilizantesResponse.map((fertilizante: any) => fertilizante.nombre));

                    // Obtener tipos de fertilizantes
                    const TipoAplicacionResponse = await ObtenerTipoAplicacion();
                    setTipoAplicacion(TipoAplicacionResponse.map((Aplicacion: any) => Aplicacion.nombre));

                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
    }, []);

    //funcion para poder filtrar las parcelas de acuerdo al idFinca que se selecciona
    const obtenerParcelasDeFinca = async (idFinca: string) => {
        try {

            const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === parseInt(idFinca));
            //se asigna las parcelas de la IdFinca que se selecciona y se pone en parcelasfiltradas
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
        formData.idFinca = value
        formData.idParcela = ''
        setSelectedFinca(value);
        setSelectedParcela('');
        obtenerParcelasDeFinca(value)
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idParcela = value
        setSelectedParcela(value);
    };

    const handleSubmit = async () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};

        // Validar selección de finca
        if (!selectedFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        // Validar selección de parcela
        if (!selectedParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        } else {
            newErrors.parcela = '';
        }

        if (!formData.fechaCreacion.trim()) {
            newErrors.fechaCreacion = 'La fecha es requerida';
        } else {
            // Validar que la fecha esté en el rango desde el 2015 hasta la fecha actual
            const minDate = new Date('2015-01-01');
            const selectedDate = new Date(formData.fechaCreacion);
            if (selectedDate < minDate || selectedDate > new Date()) {
                newErrors.fechaCreacion = 'La fecha debe estar entre 2015 y la fecha actual';
            } else {
                newErrors.fechaCreacion = '';
            }
        }

        if (!formData.fertilizante.trim()) {
            newErrors.fertilizante = 'El tipo de fertilizante es requerido';
        } else if (formData.fertilizante.length > 50) {
            newErrors.fertilizante = 'El tipo de fertilizante no puede tener más de 50 caracteres';
        } else {
            newErrors.fertilizante = '';
        }

        if (!formData.Aplicacion.trim()) {
            newErrors.Aplicacion = 'El método de aplicación es requerido';
        } else {
            newErrors.Aplicacion = '';
        }

        if (!formData.dosis.trim()) {
            newErrors.dosis = 'La dosis es requerida';
        } else if (!/^\d+$/.test(formData.dosis)) {
            newErrors.dosis = 'La dosis debe ser un número';
        } else {
            newErrors.dosis = '';
        }

        if (!formData.dosisUnidad.trim()) {
            newErrors.dosisUnidad = 'la unidad de medida es requerida';
        } else {
            newErrors.dosisUnidad = '';
        }


        if (!formData.cultivoTratado.trim()) {
            newErrors.cultivoTratado = 'El nombre del cultivo es requerido';
        } else if (formData.cultivoTratado.length > 50) {
            newErrors.cultivoTratado = 'El nombre del cultivo no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivoTratado = '';
        }

        if (!formData.accionesAdicionales.trim()) {
            newErrors.accionesAdicionales = 'Las acciones adicionales son requeridas';
        } else if (formData.accionesAdicionales.length > 200) {
            newErrors.accionesAdicionales = 'Las acciones adicionales no pueden tener más de 200 caracteres';
        } else {
            newErrors.accionesAdicionales = '';
        }

        if (!formData.condicionesAmbientales.trim()) {
            newErrors.condicionesAmbientales = 'Las condiciones ambientales son requeridas';
        } else if (formData.condicionesAmbientales.length > 200) {
            newErrors.condicionesAmbientales = 'Las condiciones ambientales no pueden tener más de 200 caracteres';
        } else {
            newErrors.condicionesAmbientales = '';
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las observaciones son requeridas';
        } else if (formData.observaciones.length > 200) {
            newErrors.observaciones = 'Las observaciones no pueden tener más de 200 caracteres';
        } else {
            newErrors.observaciones = '';
        }
        
        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                formData.idFinca = selectedFinca;
                formData.idParcela = selectedParcela;

                const resultado = await InsertarManejoFertilizantes(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Manejo de fertilizante insertado!',
                        text: 'Se ha insertado el manejo de fertilizante con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el manejo de fertilizante',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el manejo de fertilizante:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el manejo de fertilizante',
                    text: 'Ocurrió un error al intentar insertar el manejo de fertilizante. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '1rem', width: '90%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 45%', marginRight: '1rem' }}>
                        <FormGroup>
                            <label htmlFor="fincas">Finca:</label>
                            <select className="custom-select input-styled" id="fincas" value={selectedFinca} onChange={handleFincaChange}>
                                <option key="default-finca" value="">Seleccione una finca...</option>
                                {filteredFincas.map((finca) => (
                                    <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                                ))}
                            </select>
                            {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                        <FormGroup>
                            <label htmlFor="parcelas">Parcela:</label>
                            <select className="custom-select input-styled" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                                <option key="default-parcela" value="">Seleccione una parcela...</option>
                                {parcelasFiltradas.map((parcela) => (
                                    <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                ))}
                            </select>
                            {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                        </FormGroup>
                    </div>
                </div>
    
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 45%', marginRight: '1rem' }}>
                        <FormGroup>
                            <label htmlFor="fechaCreacion">Fecha</label>
                            <Input
                                type="date"
                                id="fechaCreacion"
                                name="fechaCreacion"
                                value={formData.fechaCreacion}
                                onChange={handleInputChange}
                                className={errors.fechaCreacion ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            {errors.fechaCreacion && <FormFeedback>{errors.fechaCreacion}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                        <FormGroup>
                            <label htmlFor="cultivoTratado">Cultivo Tratado</label>
                            <Input
                                type="text"
                                id="cultivoTratado"
                                name="cultivoTratado"
                                style={{ height: '44px'}}
                                value={formData.cultivoTratado}
                                onChange={handleInputChange}
                                className={errors.cultivoTratado ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Nombre del cultivo"
                                maxLength={50}
                            />
                            {errors.cultivoTratado && <FormFeedback>{errors.cultivoTratado}</FormFeedback>}
                        </FormGroup>
                    </div>
                </div>
    
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 45%', marginRight: '1rem' }}>
                        <FormGroup>
                            <label htmlFor="fertilizante">Tipo de Fertilizante</label>
                            <Input
                                type="select"
                                name="fertilizante"
                                id="fertilizante"
                                style={{ height: '42px'}}
                                value={formData.fertilizante}
                                onChange={handleInputChange}
                                className={errors.fertilizante ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Seleccione un fertilizante"
                            >
                                <option value="">Seleccione un fertilizante</option>
                                {tiposFertilizantes.map((fertilizante) => (
                                    <option key={fertilizante} value={fertilizante}>
                                        {fertilizante}
                                    </option>
                                ))}
                            </Input>
                            {errors.fertilizante && <FormFeedback>{errors.fertilizante}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                        <FormGroup>
                            <label htmlFor="Aplicacion">Tipo de Aplicación</label>
                            <Input
                                type="select"
                                name="Aplicacion"
                                id="Aplicacion"
                                value={formData.Aplicacion}
                                style={{ height: '42px'}}
                                onChange={handleInputChange}
                                className={errors.Aplicacion ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Seleccione un tipo de aplicación"
                            >
                                <option value="">Seleccione un tipo de aplicación</option>
                                {TipoAplicacion.map((Aplicacion) => (
                                    <option key={Aplicacion} value={Aplicacion}>
                                        {Aplicacion}
                                    </option>
                                ))}
                            </Input>
                            {errors.Aplicacion && <FormFeedback>{errors.Aplicacion}</FormFeedback>}
                        </FormGroup>
                    </div>
                </div>
    
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 45%', marginRight: '1rem' }}>
                        <FormGroup>
                            <label htmlFor="dosis">Dosis</label>
                            <Input
                                type="text"
                                id="dosis"
                                name="dosis"
                                value={formData.dosis}
                                onChange={handleInputChange}
                                className={errors.dosis ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Cantidad de dosis"
                            />
                            {errors.dosis && <FormFeedback>{errors.dosis}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                        <FormGroup>
                            <label htmlFor="dosisUnidad">Unidad de medida</label>
                            <Input
                                type="select"
                                id="dosisUnidad"
                                name="dosisUnidad"
                                value={formData.dosisUnidad}
                                style={{ height: '42px'}}
                                onChange={handleInputChange}
                                className="input-styled"
                            >
                                <option key="default-dosisUnidad" value="">Unidad de medida</option>
                                <optgroup label="Peso">
                                    <option value="Kilogramos (kg)">Kilogramos (kg)</option>
                                    <option value="Gramos (g)">Gramos (g)</option>
                                    <option value="Toneladas (t)">Toneladas (t)</option>
                                </optgroup>
                                <optgroup label="Volumen">
                                    <option value="Litros (L)">Litros (L)</option>
                                    <option value="Mililitros (mL)">Mililitros (mL)</option>
                                </optgroup>
                                <optgroup label="Concentración">
                                    <option value="Partes por millón (ppm)">Partes por millón (ppm)</option>
                                    <option value="Porcentaje (%)">Porcentaje (%)</option>
                                </optgroup>
                                <optgroup label="Otros">
                                    <option value="Unidades internacionales (UI)">Unidades internacionales (UI)</option>
                                    <option value="Equivalentes (eq)">Equivalentes (eq)</option>
                                </optgroup>
                            </Input>
                            {errors.dosisUnidad && <FormFeedback>{errors.dosisUnidad}</FormFeedback>}
                        </FormGroup>
                    </div>
                </div>
    
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 45%', marginRight: '1rem' }}>
                        <FormGroup>
                            <label htmlFor="accionesAdicionales">Acciones Adicionales</label>
                            <Input
                                type="text"
                                id="accionesAdicionales"
                                name="accionesAdicionales"
                                value={formData.accionesAdicionales}
                                onChange={handleInputChange}
                                className="input-styled"
                                style={{ height: '100px', resize: "none" }}
                                placeholder="Acciones adicionales"
                                maxLength={200}
                            />
                            {errors.accionesAdicionales && <FormFeedback>{errors.accionesAdicionales}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                        <FormGroup>
                            <label htmlFor="condicionesAmbientales">Condiciones Ambientales</label>
                            <Input
                                type="textarea"
                                id="condicionesAmbientales"
                                name="condicionesAmbientales"
                                value={formData.condicionesAmbientales}
                                onChange={handleInputChange}
                                className="input-styled"
                                style={{ height: '100px', resize: "none" }}
                                placeholder="Descripción de las condiciones ambientales"
                                maxLength={200}
                            />
                            {errors.condicionesAmbientales && <FormFeedback>{errors.condicionesAmbientales}</FormFeedback>}
                        </FormGroup>
                    </div>
                </div>
    
                <div style={{ marginBottom: '1rem' }}>
                    <FormGroup>
                        <label htmlFor="observaciones">Observaciones</label>
                        <Input
                            type="textarea"
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            className="input-styled"
                            style={{ height: '100px', resize: "none" }}
                            placeholder="Observaciones"
                            maxLength={200}
                        />
                        {errors.observaciones && <FormFeedback>{errors.observaciones}</FormFeedback>}
                    </FormGroup>
                </div>
    
                <FormGroup row>
                    <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                    </Col>
                </FormGroup>
            </div>
        </div>
    );


};

export default InsertarManejoFertilizante;
