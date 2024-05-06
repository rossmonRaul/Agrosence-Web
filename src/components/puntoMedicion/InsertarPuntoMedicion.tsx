import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
//import { InsertarManejoFertilizantes } from '../../servicios/ServicioFertilizantes.ts';
import {InsertarRegistroPuntoMedicion} from '../../servicios/ServicioPuntoMedicion.ts';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';

interface InsertarPuntoMedicionProps {
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

const InsertarPuntoMedicion: React.FC<InsertarPuntoMedicionProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        codigo: '',
        altitud: '',
        latitud: '',
        longitud: '',
        usuarioCreacionModificacion:''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
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
                    const fincasResponse = await ObtenerFincas();
                    const fincasFiltradas = fincasResponse.filter((f: any) => f.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);
                    const parcelasResponse = await ObtenerParcelas();
                    const parcelasFiltradas = parcelasResponse.filter((parcela: any) => fincasFiltradas.some((f: any) => f.idFinca === parcela.idFinca));
                    setParcelas(parcelasFiltradas);
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
        obtenerParcelasDeFinca(value)
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
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

        if (!formData.codigo.trim()) {
            newErrors.codigo = 'El codigo es requerido';
        } else if (formData.codigo.length > 50) {
            newErrors.codigo = 'El codigo no puede tener más de 50 caracteres';
        } else {
            newErrors.codigo = '';
        }

        if (!formData.altitud.trim()) {
            newErrors.altitud = 'La elevación es requerida';
        }else if (!/^\d+(\.\d+)?$/.test(formData.altitud.trim())) {
            newErrors.altitud = 'La elevación debe ser un número';
        }else {
            newErrors.altitud = '';
        }


        if (!formData.latitud.trim()) {
            newErrors.latitud = 'La latitud es requerida';
        } else if (formData.latitud.length > 50) {
            newErrors.latitud = 'La latitud no pueden tener más de 50 caracteres';
        } else {
            newErrors.latitud = '';
        }
  
        if (!formData.longitud.trim()) {
            newErrors.longitud = 'La longitud  es requerida';
        } else if (formData.longitud.length > 50) {
            newErrors.longitud = 'La longitud no pueden tener más de 50 caracteres';
        } else {
            newErrors.longitud = '';
        }
        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                formData.idFinca = selectedFinca;
                formData.idParcela = selectedParcela;
                formData.altitud=formData.altitud.trim();

                const resultado = await InsertarRegistroPuntoMedicion(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Punto de medición insertado!',
                        text: 'Se ha insertado el punto de medición con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el punto de medición',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el punto de medición:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el punto de medición',
                    text: 'Ocurrió un error al intentar insertar el punto de medición. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
                <h2>Punto de Medición</h2>
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
                        <Label for="codigo" sm={4} className="input-label">Código</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="codigo"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleInputChange}
                                className={errors.codigo ? 'input-styled input-error' : 'input-styled'}
                                placeholder="código"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.codigo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="altitud" sm={4} className="input-label">Elevación(m s. n. m.)</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="altitud"
                                name="altitud"
                                value={formData.altitud}
                                onChange={handleInputChange}
                                className={errors.altitud ? 'input-styled input-error' : 'input-styled'}
                                placeholder="elevación"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.altitud}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="latitud" sm={4} className="input-label">Latitud</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="latitud"
                                name="latitud"
                                value={formData.latitud}
                                onChange={handleInputChange}
                                className={errors.latitud ? 'input-styled input-error' : 'input-styled'}
                                placeholder="latitud"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.latitud}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="longitud" sm={4} className="input-label">Longitud</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="longitud"
                                name="longitud"
                                value={formData.longitud}
                                onChange={handleInputChange}
                                className={errors.longitud ? 'input-styled input-error' : 'input-styled'}
                                placeholder="longitud"
                                maxLength={50}
                            />
                            <FormFeedback>{errors.longitud}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                
            </div>
            <FormGroup row>
                <Col sm={{ size: 10, offset: 2 }}>
                    {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                    <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                </Col>
            </FormGroup>
        </div>
    );
    
};

export default InsertarPuntoMedicion;
