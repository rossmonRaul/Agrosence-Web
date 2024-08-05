import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario';
import { ModificarPreparacionTerreno, ObtenerDatosPreparacionTerrenoActividad, ObtenerDatosPreparacionTerrenoMaquinaria } from "../../servicios/ServicioPreparacionTerreno";
import '../../css/CrearCuenta.css';

interface PreparacionTerrenoSeleccionado {
    idFinca: number;
    idParcela: number;
    idPreparacionTerreno: number;
    fecha: string;
    idActividad: number; // Cambio aquí
    idMaquinaria: number; // Cambio aquí
    observaciones: string;
    identificacion: string;
    horasTrabajadas: string;
    pagoPorHora: string;
    totalPago: number;
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

interface Actividad {
    idActividad: number;
    nombre: string;
}

interface Maquinaria {
    idMaquinaria: number;
    nombre: string;
}

const ModificacionPreparacionTerreno: React.FC<PreparacionTerrenoSeleccionado> = ({
    idFinca,
    idParcela,
    idPreparacionTerreno,
    fecha,
    idActividad,
    idMaquinaria,
    observaciones,
    identificacion,
    horasTrabajadas,
    pagoPorHora,
    totalPago,
    onEdit,
    readOnly = false
}) => {
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);

    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');

    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idPreparacionTerreno: '',
        fecha: '',
        idActividad: '',
        idMaquinaria: '',
        observaciones: '',
        identificacion: '',
        horasTrabajadas: '',
        pagoPorHora: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: idFinca,
        idParcela: idParcela,
        idPreparacionTerreno: idPreparacionTerreno,
        fecha: '',
        idActividad: idActividad.toString(),
        idMaquinaria: idMaquinaria.toString(),
        observaciones: observaciones,
        identificacion: identificacion,
        horasTrabajadas: horasTrabajadas,
        pagoPorHora: pagoPorHora,
        usuarioCreacionModificacion: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        const parts = fecha.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const fechaformateada = `${year}-${month}-${day}`;
        setFormData((prevState: any) => ({
            ...prevState,
            fecha: fechaformateada
        }));
    }, [fecha]);

    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;
                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);
                    const idParcelasUsuario = usuariosAsignados.map((usuario: any) => usuario.idParcela);

                    const fincasResponse = await ObtenerFincas();
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario);
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };

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

        obtenerFincas();
        obtenerDatosActividad();
        obtenerDatosMaquinaria();
    }, []);

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
        setFormData((prevState: any) => ({
            ...prevState,
            idFinca: value,
            idParcela: ''
        }));
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
        setFormData((prevState: any) => ({
            ...prevState,
            idParcela: value
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

        if (formData.horasTrabajadas === '') {
            newErrors.horasTrabajadas = 'Las horas trabajadas son requeridas';
        } else if (isNaN(Number(formData.horasTrabajadas))) {
            newErrors.horasTrabajadas = 'Las horas trabajadas deben ser un número';
        } else {
            newErrors.horasTrabajadas = '';
        }

        if (formData.pagoPorHora === '') {
            newErrors.pagoPorHora = 'El pago por hora es requerido';
        } else if (isNaN(Number(formData.pagoPorHora))) {
            newErrors.pagoPorHora = 'El pago por hora debe ser un número';
        } else {
            newErrors.pagoPorHora = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const totalPago = parseFloat(formData.horasTrabajadas) * parseFloat(formData.pagoPorHora);
        const datos = {
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            idPreparacionTerreno: formData.idPreparacionTerreno,
            fecha: formData.fecha,
            idActividad: formData.idActividad,
            idMaquinaria: formData.idMaquinaria,
            observaciones: formData.observaciones,
            identificacion: formData.identificacion,
            horasTrabajadas: formData.horasTrabajadas,
            pagoPorHora: formData.pagoPorHora,
            totalPago: totalPago,
            usuarioCreacionModificacion: localStorage.getItem('identificacionUsuario')
        };
        try {
            const resultado = await ModificarPreparacionTerreno(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: 'Preparacion Terreno Actualizado!',
                    text: 'Preparacion Terreno actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la Preparacion Terreno.',
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
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
                <h2>Preparacion de Terreno</h2>
                <FormGroup>
                    <label htmlFor="fincas">Finca:</label>
                    <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange} disabled={readOnly}>
                        <option key="default-finca" value="">Seleccione...</option>
                        {filteredFincas.map((finca) => (
                            <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                </FormGroup>

                <FormGroup>
                    <label htmlFor="parcelas">Parcela:</label>
                    <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange} disabled={readOnly}>
                        <option key="default-parcela" value="">Seleccione...</option>
                        {filteredParcelas.map((parcela) => (
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
                                disabled={readOnly}
                            />
                            <FormFeedback>{errors.fecha}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="actividad" sm={4} className="input-label">Actividad</Label>
                        <Col sm={8}>
                            <select
                                className="custom-select"
                                id="idActividad"
                                name="idActividad"
                                value={formData.idActividad}
                                onChange={handleInputChange}
                                disabled={readOnly}
                            >
                                <option value="">Seleccione...</option>
                                {actividades.map((actividad) => (
                                    <option key={actividad.idActividad} value={actividad.idActividad}>{actividad.nombre}</option>
                                ))}
                            </select>
                            {errors.actividad && <FormFeedback>{errors.actividad}</FormFeedback>}
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="maquinaria" sm={4} className="input-label">Maquinaria</Label>
                        <Col sm={8}>
                            <select
                                className="custom-select"
                                id="idMaquinaria"
                                name="idMaquinaria"
                                value={formData.idMaquinaria}
                                onChange={handleInputChange}
                                disabled={readOnly}
                            >
                                <option value="">Seleccione...</option>
                                {maquinarias.map((maquinaria) => (
                                    <option key={maquinaria.idMaquinaria} value={maquinaria.idMaquinaria}>{maquinaria.nombre}</option>
                                ))}
                            </select>
                            {errors.maquinaria && <FormFeedback>{errors.maquinaria}</FormFeedback>}
                        </Col>
                    </FormGroup>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="identificacion" sm={4} className="input-label">Identificación</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="identificacion"
                                name="identificacion"
                                value={formData.identificacion}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Identificación"
                                maxLength={50}
                                disabled={readOnly}
                            />
                            <FormFeedback>{errors.identificacion}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="horasTrabajadas" sm={4} className="input-label">Horas Trabajadas</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="horasTrabajadas"
                                name="horasTrabajadas"
                                value={formData.horasTrabajadas}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Horas Trabajadas"
                                disabled={readOnly}
                            />
                            <FormFeedback>{errors.horasTrabajadas}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="pagoPorHora" sm={4} className="input-label">Pago por Hora</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="pagoPorHora"
                                name="pagoPorHora"
                                value={formData.pagoPorHora}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Pago por Hora"
                                disabled={readOnly}
                            />
                            <FormFeedback>{errors.pagoPorHora}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="totalPago" sm={2} className="input-label">Total Pago</Label>
                        <Col sm={10}>
                            <Input
                                type="number"
                                id="totalPago"
                                name="totalPago"
                                value={totalPago}
                                className="input-styled"
                                disabled
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>

            <FormGroup row>
                <Label for="observaciones" sm={2} className="input-label">Observaciones</Label>
                <Col sm={10}>
                    <Input
                        type="textarea"
                        id="observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        className="input-styled"
                        style={{ height: '75px', resize: "none" }}
                        placeholder="Observaciones"
                        maxLength={200}
                        disabled={readOnly}
                    />
                    <FormFeedback>{errors.observaciones}</FormFeedback>
                </Col>
            </FormGroup>

            {!readOnly && (
                <FormGroup row>
                    <Col sm={{ size: 10, offset: 2 }}>
                        <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                    </Col>
                </FormGroup>
            )}
        </div>
    );
};

export default ModificacionPreparacionTerreno;
