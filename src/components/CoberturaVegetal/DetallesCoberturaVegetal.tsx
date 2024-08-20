import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback } from 'reactstrap';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ObtenerPuntoMedicionFincaParcela } from "../../servicios/ServicioCoberturaVegetal.ts";
import '../../css/CrearCuenta.css';

interface CoberturaVegetalSeleccionada {
    idFinca: string;
    idParcela: string;
    idCoberturaVegetal: string;
    cultivo: string;
    alturaMaleza: number;
    densidadMaleza: number;
    humedadObservable: number;
    idPuntoMedicion: string;
    onEdit?: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
    idPuntoMedicion: number;
    codigo: String;
}

const DetallesCoberturaVegetal: React.FC<CoberturaVegetalSeleccionada> = ({
    idFinca,
    idParcela,
    idCoberturaVegetal,
    cultivo,
    alturaMaleza,
    densidadMaleza,
    humedadObservable,
    idPuntoMedicion,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setpuntosMedicion] = useState<Option[]>([]);
    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>('');

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idCoberturaVegetal: '',
        cultivo: '',
        alturaMaleza: '',
        densidadMaleza: '',
        humedadObservable: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idCoberturaVegetal: '',
        cultivo: '',
        alturaMaleza: 0,
        densidadMaleza: 0,
        idPuntoMedicion: 0,
        humedadObservable: 0,
    });

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idCoberturaVegetal: idCoberturaVegetal,
            cultivo: cultivo,
            alturaMaleza: alturaMaleza,
            densidadMaleza: densidadMaleza,
            humedadObservable: humedadObservable,
        });
    }, [idCoberturaVegetal]);

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
                    const idEmpresa = localStorage.getItem('empresaUsuario');
                    if (idEmpresa) {
                    //Se obtienen las fincas 
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    //Se filtran las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtien las parcelas
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    //se filtran las parcelas
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario)
                    }

                    const fincaParcelaCargar = {
                        idFinca: idFinca,
                        idParcela: idParcela
                    }

                    const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcelaCargar);
                    setpuntosMedicion(puntosMedicion)
                    setSelectedPuntoMedicion(idPuntoMedicion);

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
        setpuntosMedicion([]);
        setSelectedPuntoMedicion('');
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }


    const handleParcelaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idParcela = value
        setSelectedParcela(value);

        const fincaParcela = {
            idFinca: selectedFinca,
            idParcela: value
        }

        setpuntosMedicion([]);
        setSelectedPuntoMedicion('');
        if (value.length > 0) {
            const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
            setpuntosMedicion(puntosMedicion)
        }

    };

    const handlePuntoMedicionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPuntoMedicion(value);
    };

    const convertToDescription = (value: number) => {
        switch (value) {
            case 1:
                return 'Bajo';
            case 2:
                return 'Medio';
            case 3:
                return 'Alto';
            default:
                return '';
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <h2>Cobertura Vegetal</h2>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="fincas">Finca:</label>
                        <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange} disabled>
                            {filteredFincas.map((finca) => (
                                <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="parcelas">Parcela:</label>
                        <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange} disabled>
                            {filteredParcelas.map((parcela) => (
                                <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                            ))}
                        </select>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '1.5rem' }}>
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
                                readOnly
                            />
                            <FormFeedback>{errors.cultivo}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="alturaMaleza" sm={4} className="input-label">Altura Maleza</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="alturaMaleza"
                                name="alturaMaleza"
                                value={convertToDescription(formData.alturaMaleza)}
                                readOnly
                            />
                            <FormFeedback>{errors.alturaMaleza}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>

            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', width: '100%' }}>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="densidadMaleza" sm={4} className="input-label">Densidad de Maleza</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="densidadMaleza"
                                name="densidadMaleza"
                                value={convertToDescription(formData.densidadMaleza)}
                                readOnly
                            />
                            <FormFeedback>{errors.densidadMaleza}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="puntosMedicion">Punto de medición:</label>
                        <select className="custom-select" id="puntosMedicion" value={selectedPuntoMedicion} onChange={handlePuntoMedicionChange} disabled>
                            {puntosMedicion.map((puntoMedicion) => (
                                <option key={`${puntoMedicion.idPuntoMedicion}-${puntoMedicion.codigo || 'undefined'}`} value={puntoMedicion.idPuntoMedicion}>{puntoMedicion.codigo || 'Undefined'}</option>
                            ))}
                        </select>
                    </FormGroup>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>

                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="humedadObservable" sm={4} className="input-label">Humedad Observable</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="humedadObservable"
                                name="humedadObservable"
                                value={convertToDescription(formData.humedadObservable)}
                                style={{ minWidth: '350px' }}
                                readOnly
                            />
                            <FormFeedback>{errors.humedadObservable}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
        </div >
    );
};

export default DetallesCoberturaVegetal;
