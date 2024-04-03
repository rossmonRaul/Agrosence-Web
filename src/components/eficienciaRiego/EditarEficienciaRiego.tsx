import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { ActualizarRegistroEficienciaRiego } from '../../servicios/ServicioRiego.ts';

// Interfaz para las propiedades del componente
interface RiegoSeleccionado {
    idFinca: number;
    idParcela: number;
    idMonitoreoEficienciaRiego: number;
    volumenAguaUtilizado: string;
    estadoTuberiasYAccesorios: boolean;
    uniformidadRiego: boolean;
    estadoAspersores: boolean;
    estadoCanalesRiego: boolean;
    nivelFreatico: string;
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const ModificacionEficienciaRiego: React.FC<RiegoSeleccionado> = ({
    idFinca,
    idParcela,
    idMonitoreoEficienciaRiego,
    volumenAguaUtilizado,
    estadoTuberiasYAccesorios,
    uniformidadRiego,
    estadoAspersores,
    estadoCanalesRiego,
    nivelFreatico,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string | boolean>>({
        idFinca: '',
        idParcela: '',
        idMonitoreoEficienciaRiego: '',
        volumenAguaUtilizado: '',
        estadoTuberiasYAccesorios: false,
        uniformidadRiego: false,
        estadoAspersores: false,
        estadoCanalesRiego: false,
        nivelFreatico: '',
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idMonitoreoEficienciaRiego: '',
        volumenAguaUtilizado: '',
        estadoTuberiasYAccesorios: false,
        uniformidadRiego: false,
        estadoAspersores: false,
        estadoCanalesRiego: false,
        nivelFreatico: '',
    });

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;
        const newValue = type === 'checkbox' ? checked : value;
    
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: newValue
        }));
    };

    useEffect(() => {

        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idMonitoreoEficienciaRiego: idMonitoreoEficienciaRiego,
            volumenAguaUtilizado: volumenAguaUtilizado,
            estadoTuberiasYAccesorios: estadoTuberiasYAccesorios,
            uniformidadRiego: uniformidadRiego,
            estadoAspersores: estadoAspersores,
            estadoCanalesRiego: estadoCanalesRiego,
            nivelFreatico: nivelFreatico,
        });
    }, [idMonitoreoEficienciaRiego]);


    // Obtener las fincas al cargar la página
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
                    //Se obtienen las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //Se filtran las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtien las parcelas
                    const parcelasResponse = await ObtenerParcelas();
                    //se filtran las parcelas
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
    }, []);


    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idFinca = value
        formData.idParcela = ""
        setSelectedFinca(value);
        setSelectedParcela('');
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
        formData.idParcela = value
        setSelectedParcela(value);
    };

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Validar campos antes de avanzar al siguiente paso
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

        // Actualizar los errores
        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
        }
    };


    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const idUsuario = localStorage.getItem('identificacionUsuario');
        const datos = {
            idFinca: selectedFinca,
            idParcela: selectedParcela,
            idMonitoreoEficienciaRiego: formData.idMonitoreoEficienciaRiego,
            volumenAguaUtilizado: formData.volumenAguaUtilizado,
            estadoTuberiasYAccesorios: formData.estadoTuberiasYAccesorios,
            uniformidadRiego: formData.uniformidadRiego,
            estadoAspersores: formData.estadoAspersores,
            estadoCanalesRiego: formData.estadoCanalesRiego,
            nivelFreatico: formData.nivelFreatico,
            usuarioCreacionModificacion: idUsuario,
        };
        

        try {
            
            const resultado = await ActualizarRegistroEficienciaRiego(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Riego Actualizado! ',
                    text: 'Riego actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar el Riego.',
                    text: resultado.mensaje,
                });
            };

            // vuelve a cargar la tabla

            if (onEdit) {
                onEdit();
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth: '700px' }}>

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
                            <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                                <option key="default-parcela" value="">Seleccione...</option>
                                {filteredParcelas.map((parcela) => (
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
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop: '10px' }}
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
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop: '10px' }}
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
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop: '10px' }}
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
                                    style={{ transform: 'scale(1.2)', marginLeft: '40px', marginTop: '10px' }}
                                />
                            </Col>
                            <FormFeedback>{errors.estadoCanalesRiego}</FormFeedback>
                        </FormGroup>
                    </div>

                </div>

                <FormGroup row>
                    <Col sm={{ size: 10, offset: 2 }}>
                        {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                        <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                    </Col>
                </FormGroup>
            </div>


        </div>


    );

};

export default ModificacionEficienciaRiego;
