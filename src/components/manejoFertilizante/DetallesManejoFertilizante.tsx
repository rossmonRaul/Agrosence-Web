import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback } from 'reactstrap';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';

interface ManejoFertilizantesSeleccionado {
    idFinca: string;
    idParcela: string;
    idManejoFertilizantes: string;
    fechaCreacion: string;
    fertilizante: string;
    aplicacion: string;
    dosis: number;
    dosisUnidad: string;
    cultivoTratado: string;
    condicionesAmbientales: string;
    accionesAdicionales: string;
    observaciones: string;
}

interface Option {
    idEmpresa: number;
    idFinca: number;
    idParcela: number;
    nombre: string;
}

const DetallesManejoFertilizantes: React.FC<ManejoFertilizantesSeleccionado> = ({
    idFinca,
    idParcela,
    idManejoFertilizantes,
    fechaCreacion,
    fertilizante,
    aplicacion,
    dosis,
    dosisUnidad,
    cultivoTratado,
    condicionesAmbientales,
    accionesAdicionales,
    observaciones
}) => {
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');

    const [formData, setFormData] = useState<any>({
        idFinca: idFinca,
        idParcela: idParcela,
        idManejoFertilizantes: idManejoFertilizantes,
        fechaCreacion: fechaCreacion.toString(),
        fertilizante: fertilizante,
        aplicacion: aplicacion,
        dosis: dosis,
        dosisUnidad: dosisUnidad,
        cultivoTratado: cultivoTratado,
        condicionesAmbientales: condicionesAmbientales,
        accionesAdicionales: accionesAdicionales,
        observaciones: observaciones
    });

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
            idManejoFertilizantes: idManejoFertilizantes,
            fechaCreacion: fechaCreacion.toString(),
            fertilizante: fertilizante,
            aplicacion: aplicacion,
            dosis: dosis,
            dosisUnidad: dosisUnidad,
            cultivoTratado: cultivoTratado,
            condicionesAmbientales: condicionesAmbientales,
            accionesAdicionales: accionesAdicionales,
            observaciones: observaciones
        });
    }, [idManejoFertilizantes]);

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
        setSelectedParcela(value);
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
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
                        <Label for="fertilizante" sm={4} className="input-label">Fertilizante</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="fertilizante"
                                name="fertilizante"
                                value={formData.fertilizante}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="aplicacion" sm={4} className="input-label">Aplicación</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="aplicacion"
                                name="aplicacion"
                                value={formData.aplicacion}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem', width: '100%' }}>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="dosis" sm={4} className="input-label">Dosis</Label>
                        <Col sm={8}>
                            <Input
                                type="number"
                                id="dosis"
                                name="dosis"
                                value={formData.dosis}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
                <div style={{ flex: 2, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="dosisUnidad" sm={4} className="input-label">Unidad de Dosis</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="dosisUnidad"
                                name="dosisUnidad"
                                value={formData.dosisUnidad}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="cultivoTratado" sm={4} className="input-label">Cultivo Tratado</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="cultivoTratado"
                                name="cultivoTratado"
                                value={formData.cultivoTratado}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="condicionesAmbientales" sm={4} className="input-label">Condiciones Ambientales</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="condicionesAmbientales"
                                name="condicionesAmbientales"
                                value={formData.condicionesAmbientales}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1, marginRight: '0.5rem', marginLeft: '0.5rem' }}>
                    <FormGroup row>
                        <Label for="accionesAdicionales" sm={4} className="input-label">Acciones Adicionales</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="accionesAdicionales"
                                name="accionesAdicionales"
                                value={formData.accionesAdicionales}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </Col>
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
                                readOnly
                            />
                        </Col>
                    </FormGroup>
                </div>
            </div>
        </div>
    );
};

export default DetallesManejoFertilizantes;
