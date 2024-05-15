import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/ManejoResiduos.css';
import { InsertarOrdenDeCompra } from '../../servicios/ServicioOrdenCompra.ts';


interface CrearOrdenCompraProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const CrearOrdenCompra: React.FC<CrearOrdenCompraProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        numeroDeOrden: '',
        proveedor: '',
        FechaOrden: '',
        FechaEntrega: '',
        cantidad: '',
        ProductosAdquiridos: '',
        PrecioUnitario: '',
        MontoTotal: '',
        Observaciones: '',
        usuarioCreacionModificacion: ''

    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
    
        // Update form data
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    
        // Calculate total amount
        if (name === "cantidad" || name === "PrecioUnitario") {
            const cantidadValue = name === "cantidad" ? parseFloat(value) : formData.cantidad;
            const precioUnitarioValue = name === "PrecioUnitario" ? parseFloat(value) : formData.PrecioUnitario;
    
            // Check if both cantidadValue and precioUnitarioValue are valid numbers
            if (!isNaN(cantidadValue as number) && !isNaN(precioUnitarioValue as number)) {
                const montoTotal = (cantidadValue as number) * (precioUnitarioValue as number);
                formData.MontoTotal = montoTotal.toString();
            } else {
                // If either input value is not a number, reset the total amount
                formData.MontoTotal = "";
            }
        }
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

        if (!formData.numeroDeOrden.trim()) {
            newErrors.numeroDeOrden = 'El numero de orden es obligatorio';
        } else if (formData.numeroDeOrden.length > 50) {
            newErrors.numeroDeOrden = 'El numero de orden no pueden tener más de 50 caracteres';
        } else {
            newErrors.numeroDeOrden = '';
        }

        if (!formData.FechaOrden.trim()) {
            newErrors.FechaOrden = 'La fecha de orden es obligatoria';
        }

        if (!formData.FechaEntrega.trim()) {
            newErrors.FechaEntrega = 'La fecha de entrega es obligatoria';
        }

        if (!formData.cantidad) {
            newErrors.cantidad = 'La cantidad es obligatoria';
        } else {
            newErrors.cantidad = '';
        }

        if (!formData.proveedor.trim()) {
            newErrors.proveedor = 'El proveedor es obligatoria';
        } else if (formData.proveedor.length > 75) {
            newErrors.proveedor = 'El proveedor no pueden más de 75 carateres';
        } else {
            newErrors.proveedor = '';
        }

        if (!formData.ProductosAdquiridos.trim()) {
            newErrors.ProductosAdquiridos = 'El producto adquirido es obligatorio';
        } else if (formData.ProductosAdquiridos.length > 200) {
            newErrors.ProductosAdquiridos = 'El producto adquirido no puede ser mayor a 200 caracteres';
        } else {
            newErrors.ProductosAdquiridos = '';
        }

        if (!formData.PrecioUnitario.trim()) {
            newErrors.PrecioUnitario = 'El precio unitario es obligatorio';
        } else {
            newErrors.PrecioUnitario = '';
        }

        if (!formData.Observaciones.trim()) {
            newErrors.Observaciones = 'Las observaciones son obligatorias';
        } else if (formData.Observaciones.length > 200) {
            newErrors.Observaciones = 'Las observaciones no puede ser mayor a 200 caracteres';
        } else {
            newErrors.Observaciones = '';
        }

        const fechaOrdenParts = formData.FechaOrden.split("/");
        const fechaOrdenFormatted = `${fechaOrdenParts[2]}-${fechaOrdenParts[1]}-${fechaOrdenParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaOrdenDate = new Date(fechaOrdenFormatted);

        const fechaEntregaParts = formData.FechaEntrega.split("/");
        const fechaEntregaFormatted = `${fechaEntregaParts[2]}-${fechaEntregaParts[1]}-${fechaEntregaParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaEntregaDate = new Date(fechaEntregaFormatted)

        if (fechaOrdenDate > fechaEntregaDate) {
            newErrors.FechaOrden = 'Error Fecha de Orden';
        }

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si fechaGenerativaDate es mayor que hoy
        if (fechaOrdenDate > today) {
            newErrors.FechaOrden = 'Fecha de Orden no puede ser mayor a hoy';
        }

        // Verificar si fechaManejoDate es mayor que hoy
        if (fechaEntregaDate > today) {
            newErrors.FechaEntrega = 'Fecha de Entrega no puede ser mayor a hoy';
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

                const resultado = await InsertarOrdenDeCompra(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro insertado!',
                        text: 'Se ha insertado  un registro orden de compra.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el registro de orden de compra',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar la orden de compra:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la orden de compra',
                    text: 'Ocurrió un error al intentar insertar la orden de compra Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', minWidth: "560px" }}>
            {step === 1 && (
                <div>
                    <h2>Orden de compra</h2>
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

                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                        <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="numeroDeOrden" sm={4} className="input-label">Numero de orden</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        id="numeroDeOrden"
                                        name="numeroDeOrden"
                                        value={formData.numeroDeOrden.toString()}
                                        onChange={handleInputChange}
                                        className={errors.numeroDeOrden ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Numero de Orden"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.numeroDeOrden}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="proveedor" sm={4} className="input-label">Proveedor</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="proveedor"
                                        name="proveedor"
                                        value={formData.proveedor.toString()}
                                        onChange={handleInputChange}
                                        className={errors.proveedor ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Proveedor"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.proveedor}</FormFeedback>
                                </Col>

                            </FormGroup>
                        </div>

                    </div>

                    <div className="row" style={{ display: "flex" }}>
                        <div style={{ flex: 1, marginRight: '10px' }}>
                            <FormGroup row>
                                <Label for="FechaOrden" sm={4} className="input-label">Fecha Orden</Label>
                                <Col sm={8}>
                                    <Input
                                        type="date"
                                        id="FechaOrden"
                                        name="FechaOrden"
                                        value={formData.FechaOrden}
                                        onChange={handleInputChange}
                                        className={errors.FechaOrden ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Selecciona una fecha"
                                    />
                                    <FormFeedback>{errors.FechaOrden}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1 }}>
                            <FormGroup row>
                                <Label for="FechaEntrega" sm={4} className="input-label">Fecha Entrega</Label>
                                <Col sm={8}>
                                    <Input
                                        type="date"
                                        id="FechaEntrega"
                                        name="FechaEntrega"
                                        value={formData.FechaEntrega}
                                        onChange={handleInputChange}
                                        className={errors.FechaEntrega ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Selecciona una fecha"
                                    />
                                    <FormFeedback>{errors.FechaEntrega}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>

                    </div>
                    <button onClick={handleNextStep} className="btn-styled">Siguiente</button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h2>Orden de Compra</h2>
                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                        <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="ProductosAdquiridos" sm={4} className="input-label">Producto Adquirido</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="ProductosAdquiridos"
                                        name="ProductosAdquiridos"
                                        value={formData.ProductosAdquiridos.toString()}
                                        onChange={handleInputChange}
                                        className={errors.ProductosAdquiridos ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Producto Adquirido"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.ProductosAdquiridos}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="cantidad" sm={4} className="input-label">Cantidad (kg)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        id="cantidad"
                                        name="cantidad"
                                        value={formData.cantidad.toString()}
                                        onChange={handleInputChange}
                                        className={errors.cantidad ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.cantidad}</FormFeedback>
                                </Col>

                            </FormGroup>
                        </div>

                    </div>
                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                        <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="PrecioUnitario" sm={4} className="input-label">Precio Unitario (₡/kg)</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        id="PrecioUnitario"
                                        name="PrecioUnitario"
                                        value={formData.PrecioUnitario.toString()}
                                        onChange={handleInputChange}
                                        className={errors.PrecioUnitario ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Precio Unitario"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.PrecioUnitario}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="MontoTotal" sm={4} className="input-label">Monto Total</Label>
                                <Col sm={8}>
                                    <Input
                                        readOnly
                                        type="number"
                                        id="MontoTotal"
                                        name="MontoTotal"
                                        value={formData.MontoTotal.toString()}
                                        onChange={handleInputChange}
                                        className={errors.MontoTotal ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.MontoTotal}</FormFeedback>
                                </Col>

                            </FormGroup>
                        </div>

                    </div>
                    <div className="col-sm-4">
                        <FormGroup row>
                            <Label for="Observaciones" sm={4} className="input-label">Observaciones</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="Observaciones"
                                    name="Observaciones"
                                    value={formData.Observaciones}
                                    onChange={handleInputChange}
                                    className={errors.Observaciones ? 'input-styled input-error' : 'input-styled'}
                                    style={{ minWidth: '350px' }}
                                    placeholder="Observaciones"
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.Observaciones}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                    <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                            {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                            <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                            <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                        </Col>
                    </FormGroup>
                </div>

            )}
        </div>
    );

};

export default CrearOrdenCompra;
