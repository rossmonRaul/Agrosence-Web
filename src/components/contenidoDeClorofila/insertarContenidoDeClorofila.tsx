import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
//import { InsertarManejoFertilizantes } from '../../servicios/ServicioFertilizantes.ts';
import { InsertarRegistroContenidoDeClorofila, ObtenerPuntoMedicionFincaParcela } from '../../servicios/ServicioContenidoDeClorofila.ts';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';

interface InsertarContenidoDeClorofilaProps {
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
    idPuntoMedicion: number;
    codigo: String;
}

const InsertarContenidoDeClorofila: React.FC<InsertarContenidoDeClorofilaProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        cultivo: '',
        fecha: '',
        valorDeClorofila: '',
        idPuntoMedicion: '',
        observaciones: '',
        usuarioCreacionModificacion: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setpuntosMedicion] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);


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
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);
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
        setSelectedPuntoMedicion('');
        obtenerParcelasDeFinca(value)
    };

    const handleParcelaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);

        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: value
        }

        const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);

        setpuntosMedicion(puntosMedicion)

    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
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

        if (!formData.cultivo.trim()) {
            newErrors.cultivo = 'El cultivo es requerido';
        } else if (formData.cultivo.length > 50) {
            newErrors.cultivo = 'El cultivo no puede tener más de 50 caracteres';
        } else {
            newErrors.cultivo = '';
        }

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

        if (!formData.valorDeClorofila) {
            newErrors.valorDeClorofila   = 'El valor de clorofila es requerido';
        } else if (parseInt(formData.valorDeClorofila) < 0) {
            newErrors.valorDeClorofila = 'El valor de clorofila no puede ser menor a 0';
        } else {
            newErrors.valorDeClorofila = '';
        }

        if (!selectedPuntoMedicion) {
            newErrors.puntoMedicion = 'Debe seleccionar un punto de medición';
        } else {
            newErrors.puntoMedicion = '';
        }

        if (!formData.observaciones.trim()) {
            newErrors.observaciones = 'Las Observaciones son obligatorias';
        } else if (formData.observaciones.length > 2000) {
            newErrors.observaciones = 'Las Observaciones no puede ser mayor a 2000 caracteres';
        } else {
            newErrors.observaciones = '';
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

        formData.idPuntoMedicion = selectedPuntoMedicion;

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                formData.idFinca = selectedFinca;
                formData.idParcela = selectedParcela;
                formData.idPuntoMedicion = selectedPuntoMedicion;

                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                const resultado = await InsertarRegistroContenidoDeClorofila(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro de contenido de clorofila insertado!',
                        text: 'Se ha insertado el contenido de clorofila con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el contenido de clorofila',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el contenido de clorofila:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el contenido de clorofila',
                    text: 'Ocurrió un error al intentar insertar el contenido de clorofila. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <h2>Contenido de Clorofila</h2>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="fincas">Finca:</label>
                        <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange}>
                            <option key="default-finca" value="">Seleccione...</option>
                            {filteredFincas.map((finca) => (
                                <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                    </FormGroup>
                </div> 
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="parcelas">Parcela:</label>
                        <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                            <option key="default-parcela" value="">Seleccione...</option>
                            {parcelasFiltradas.map((parcela) => (
                                <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="cultivo" sm={4} className="input-label">Cultivo</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="cultivo"
                                name="cultivo"
                                value={formData.cultivo}
                                onChange={handleInputChange}
                                className={errors.codigo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="cultivo"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.cultivo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
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
                                className={errors.FechaEntrega ? 'input-styled input-error' : 'input-styled'}
                                placeholder="Selecciona una fecha"
                            />
                            <FormFeedback>{errors.fecha}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', width: '100%' }}>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="valorDeClorofila" sm={4} className="input-label">Valor de Clorofila (μmol m<sup>2</sup>)</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="valorDeClorofila"
                                name="valorDeClorofila"
                                value={formData.valorDeClorofila.toString()}
                                onChange={handleInputChange}
                                className={errors.valorDeClorofila ? 'input-styled input-error' : 'input-styled'}
                                placeholder="0.0"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.valorDeClorofila}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="puntosMedicion">Punto de medición:</label>
                        <select className="custom-select" id="puntosMedicion" value={selectedPuntoMedicion} onChange={handlePuntoMedicionChange}>
                            <option key="default-puntoMedicion" value="">Seleccione...</option>
                            {puntosMedicion.map((puntoMedicion) => (
                                <option key={`${puntoMedicion.idPuntoMedicion}-${puntoMedicion.codigo || 'undefined'}`} value={puntoMedicion.idPuntoMedicion}>{puntoMedicion.codigo || 'Undefined'}</option>
                            ))}
                        </select>
                        {errors.puntoMedicion && <FormFeedback>{errors.puntoMedicion}</FormFeedback>}
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="observaciones" sm={4} className="input-label">Observaciones</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange}
                                className={errors.observaciones ? 'input-styled input-error' : 'input-styled'}
                                style={{ minWidth: '350px' }}
                                placeholder="Observaciones"
                                maxLength={2000}
                            />
                            <FormFeedback>{errors.observaciones}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                </Col>
            </FormGroup>
        </div >
    );

};

export default InsertarContenidoDeClorofila;
