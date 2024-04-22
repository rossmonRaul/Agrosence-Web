import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/ManejoResiduos.css';
import { CrearRegistroEficienciaRiego } from '../../servicios/ServicioRiego.ts';


interface CrearEficienciaRiegoProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const CrearEficienciaRiegos: React.FC<CrearEficienciaRiegoProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        estadoTuberiasYAccesorios: false,
        uniformidadRiego: false,
        estadoAspersores: false,
        estadoCanalesRiego: false,
        volumenAguaUtilizado: '',
        nivelFreatico: '',
        usuarioCreacionModificacion: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;
        const newValue = type === 'checkbox' ? checked : value;
    
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: newValue
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
        formData.idParcela = value;
        setSelectedParcela(value);
    };

    const handleSubmit = async () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};

        if (!formData.idFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!formData.idParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        } else {
            newErrors.parcela = '';
        }
        if (!formData.volumenAguaUtilizado) {
            newErrors.volumenAguaUtilizado = 'Consumo de agua es requerido';
        } else {
            newErrors.finca = '';
        }

        if (!formData.nivelFreatico) {
            newErrors.nivelFreatico = 'Nivel Freático es requerido';
        } else {
            newErrors.parcela = '';
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
               
                const resultado = await CrearRegistroEficienciaRiego(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro insertado!',
                        text: 'Se ha insertado  un registro de eficiencia de riego.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el registro de eficiencia de riego.',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el manejo de residuos:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el manejo de residuos',
                    text: 'Ocurrió un error al intentar insertar el manejo de residuos. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth:'700px' }}>

            <div>
                <h2>Eficiencia de riego</h2>
                <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <div style={{ marginRight: '10px', width: '50%' }}>
                        <FormGroup>
                            <label htmlFor="fincas">Finca:</label>
                            <select className="custom-select input-styled" id="fincas" value={selectedFinca} onChange={handleFincaChange}>
                                <option key="default-finca" value="">Seleccione...</option>
                                {filteredFincas.map((finca) => (
                                    <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                                ))}
                            </select>
                            {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                        </FormGroup>
                    </div>
                    <div style={{ marginRight: '0px', width: '50%' }}>
                        <FormGroup>
                            <label htmlFor="parcelas">Parcela:</label>
                            <select className="custom-select input-styled" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                                <option key="default-parcela" value="">Seleccione...</option>
                                {parcelasFiltradas.map((parcela) => (

                                    <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                                ))}
                            </select>
                            {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                        </FormGroup>
                    </div>
                </div>
                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%', marginTop: '5px' }}>
                   
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                        <FormGroup>

                            <Label for="volumenAguaUtilizado" sm={8} className="input-label">Consumo Agua (L)</Label>

                            <Col >
                                <Input
                                    type="number"
                                    id="volumenAguaUtilizado"
                                    name="volumenAguaUtilizado"
                                    value={formData.volumenAguaUtilizado}
                                    onChange={handleInputChange}
                                    className={errors.volumenAguaUtilizado ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                            </Col>

                            <FormFeedback>{errors.volumenAguaUtilizado}</FormFeedback>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                        <FormGroup row>
                            <Label for="nivelFreatico" sm={4} className="input-label">Nivel Freático</Label>
                            <Col>
                                <Input
                                    type="number"
                                    id="nivelFreatico"
                                    name="nivelFreatico"
                                    value={formData.nivelFreatico}
                                    onChange={handleInputChange}
                                    className={errors.nivelFreatico ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.nivelFreatico}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                </div>

                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%', marginTop: '5px' }}>
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '100%' }}>
                        <FormGroup row style={{ display: 'flex' }}>
                            <Label for="uniformidadRiego" className="input-label" style={{ width: '100%', textAlign: 'left' }}>Uniformidad de Riego</Label>
                            <Col >
                                <Input
                                    type="checkbox"
                                    id="uniformidadRiego"
                                    name="uniformidadRiego"
                                    checked={formData.uniformidadRiego}
                                    onChange={handleInputChange}
                                    className={errors.uniformidadRiego ? 'input-styled input-error' : 'input-styled'}
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop:'10px' }}
                                />
                            </Col>
                            <FormFeedback>{errors.uniformidadRiego}</FormFeedback>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '100%' }}>
                        <FormGroup row style={{ display: 'flex' }}>
                            <Label for="estadoAspersores" className="input-label" style={{ width: '100%', textAlign: 'left' }}>Obstruccion en Aspersores</Label>
                            <Col >
                                <Input
                                    type="checkbox"
                                    id="estadoAspersores"
                                    name="estadoAspersores"
                                    checked={formData.estadoAspersores}
                                    onChange={handleInputChange}
                                    className={errors.estadoAspersores ? 'input-styled input-error' : 'input-styled'}
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop:'10px' }}
                                />
                            </Col>
                            <FormFeedback>{errors.estadoAspersores}</FormFeedback>
                        </FormGroup>
                    </div>

                </div>

                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%', marginTop: '5px' }}>
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '100%' }}>
                        <FormGroup row style={{ display: 'flex' }}>
                            <Label for="estadoTuberiasYAccesorios" className="input-label" style={{ width: '100%', textAlign: 'left' }}>Fugas en el Sistema de Riego</Label>
                            <Col >
                                <Input
                                    type="checkbox"
                                    id="estadoTuberiasYAccesorios"
                                    name="estadoTuberiasYAccesorios"
                                    checked={formData.estadoTuberiasYAccesorios}
                                    onChange={handleInputChange}
                                    className={errors.estadoTuberiasYAccesorios ? 'input-styled input-error' : 'input-styled'}
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop:'10px' }}
                                />
                            </Col>
                            <FormFeedback>{errors.estadoTuberiasYAccesorios}</FormFeedback>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '100%' }}>
                        <FormGroup row style={{ display: 'flex' }}>
                            <Label for="estadoCanalesRiego" className="input-label" style={{ width: '100%', textAlign: 'left' }}>Obstrucción en Canales de Riego</Label>
                            <Col >
                                <Input
                                    type="checkbox"
                                    id="estadoCanalesRiego"
                                    name="estadoCanalesRiego"
                                    checked={formData.estadoCanalesRiego}
                                    onChange={handleInputChange}
                                    className={errors.estadoCanalesRiego ? 'input-styled input-error' : 'input-styled'}
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop:'10px' }}
                                />
                            </Col>
                            <FormFeedback>{errors.estadoCanalesRiego}</FormFeedback>
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


        </div>
    );

};

export default CrearEficienciaRiegos;
