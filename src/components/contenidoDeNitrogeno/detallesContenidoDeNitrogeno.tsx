import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col } from 'reactstrap';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { ObtenerPuntoMedicionFincaParcela } from "../../servicios/ServicioContenidoDeNitrogeno.ts";
import '../../css/CrearCuenta.css';

interface ContenidoDeNitrogenoSeleccionado {
    idFinca: string;
    idParcela: string;
    idContenidoDeNitrogeno: string;
    fechaMuestreo: string,
    contenidoNitrogenoSuelo: string;
    contenidoNitrogenoPlanta: string;
    metodoAnalisis: string;
    humedadObservable: string;
    condicionSuelo: string;
    observaciones: string;
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
    codigo: string;
}

const DetallesContenidoDeNitrogeno: React.FC<ContenidoDeNitrogenoSeleccionado> = ({
    idFinca,
    idParcela,
    idContenidoDeNitrogeno,
    fechaMuestreo,
    contenidoNitrogenoSuelo,
    contenidoNitrogenoPlanta,
    metodoAnalisis,
    humedadObservable,
    condicionSuelo,
    observaciones,
    idPuntoMedicion,
}) => {
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [puntosMedicion, setPuntosMedicion] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');
    const [selectedPuntoMedicion, setSelectedPuntoMedicion] = useState<string>(() => idPuntoMedicion ? idPuntoMedicion.toString() : '');
    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idParcela: '',
        idContenidoDeNitrogeno: '',
        fechaMuestreo: '',
        contenidoNitrogenoSuelo: '',
        contenidoNitrogenoPlanta: '',
        metodoAnalisis: '',
        humedadObservable: '',
        condicionSuelo: '',
        observaciones: '',
        idPuntoMedicion: '',
    });

    useEffect(() => {
        const getCurrentDate = () => {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const dateToUse = fechaMuestreo || getCurrentDate();

        const parts = dateToUse.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const Fecha = `${year}-${month}-${day}`;

        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idContenidoDeNitrogeno: idContenidoDeNitrogeno,
            fechaMuestreo: Fecha,
            contenidoNitrogenoSuelo: contenidoNitrogenoSuelo,
            contenidoNitrogenoPlanta: contenidoNitrogenoPlanta,
            metodoAnalisis: metodoAnalisis,
            humedadObservable: humedadObservable,
            condicionSuelo: condicionSuelo,
            observaciones: observaciones,
            idPuntoMedicion: idPuntoMedicion,
        });
    }, [idContenidoDeNitrogeno]);

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
                    const fincasResponse = await ObtenerFincas(parseInt(idEmpresa));
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    const parcelasResponse = await ObtenerParcelas(parseInt(idEmpresa));
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idParcelasUsuario.includes(parcela.idParcela));
                    setParcelas(parcelasUsuario);
                    }
                    const fincaParcelaCargar = {
                        idFinca: idFinca,
                        idParcela: idParcela
                    };

                    const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcelaCargar);
                    setPuntosMedicion(puntosMedicion);
                    
                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
    }, []);

    useEffect(() => {
        const cargarPuntoMedicion = async () => {
            if (idFinca && idParcela) {
                const fincaParcela = {
                    idFinca: idFinca,
                    idParcela: idParcela
                };
                const puntosMedicion = await ObtenerPuntoMedicionFincaParcela(fincaParcela);
                setPuntosMedicion(puntosMedicion);
                setSelectedPuntoMedicion(idPuntoMedicion);
            }
        };

        cargarPuntoMedicion();
    }, [idFinca, idParcela, idPuntoMedicion]);

    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <h2>Detalles del Contenido de Nitrógeno</h2>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="fincas">Finca:</label>
                        <Input type="text" id="fincas" value={selectedFinca} readOnly />
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="parcelas">Parcela:</label>
                        <Input type="text" id="parcelas" value={selectedParcela} readOnly />
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup>
                        <label htmlFor="puntosMedicion">Punto de medición:</label>
                        <Input type="text" id="puntosMedicion" value={selectedPuntoMedicion} readOnly />
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="fechaMuestreo" sm={4} className="input-label">Fecha de Muestreo</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="fechaMuestreo"
                                name="fechaMuestreo"
                                value={formData.fechaMuestreo}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', width: '100%' }}>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="contenidoNitrogenoSuelo" sm={4} className="input-label">Contenido de Nitrógeno en Suelo (%)</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="contenidoNitrogenoSuelo"
                                name="contenidoNitrogenoSuelo"
                                value={formData.contenidoNitrogenoSuelo}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="contenidoNitrogenoPlanta" sm={4} className="input-label">Contenido de Nitrógeno en Planta (%)</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="contenidoNitrogenoPlanta"
                                name="contenidoNitrogenoPlanta"
                                value={formData.contenidoNitrogenoPlanta}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="metodoAnalisis" sm={4} className="input-label">Método de Análisis</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="metodoAnalisis"
                                name="metodoAnalisis"
                                value={formData.metodoAnalisis}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="humedadObservable" sm={4} className="input-label">Humedad Observable</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="humedadObservable"
                                name="humedadObservable"
                                value={formData.humedadObservable}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="condicionSuelo" sm={4} className="input-label">Condición del Suelo</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="condicionSuelo"
                                name="condicionSuelo"
                                value={formData.condicionSuelo}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="observaciones" sm={4} className="input-label">Observaciones</Label>
                        <Col sm={8}>
                            <Input
                                type="textarea"
                                id="observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
        </div>
    );
};

export default DetallesContenidoDeNitrogeno;
