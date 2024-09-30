import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button, Table } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import '../../css/OrdenCompra.css';
import { InsertarOrdenDeCompra, ObtenerUltimoIdOrdenDeCompra } from '../../servicios/ServicioOrdenCompra.ts';
import '../../css/lista.css';
import { IoAddCircleOutline, IoArrowBack, IoArrowForward, IoSaveOutline } from 'react-icons/io5';

interface CrearOrdenCompraProps {
    onAdd: () => void;
}

interface DetalleOrdenCompra {
    Producto: string;
    cantidad: string;
    PrecioUnitario: string;
    Total: string;
    iva: string;
}


interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const CrearOrdenCompra: React.FC<CrearOrdenCompraProps> = ({ onAdd }) => {

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [selectedParcela, setSelectedParcela] = useState<string>('');
    const [productos, setProductos] = useState<DetalleOrdenCompra[]>([]);
    const [idNumeroOrden, setIdNumeroOrden] = useState<string>('');

    const [step, setStep] = useState(1);
    const [totalMonto, setTotalMonto] = useState(0);

    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        numeroDeOrden: idNumeroOrden,
        proveedor: '',
        FechaOrden: '',
        FechaEntrega: '',
        Observaciones: '',
        detalles: [] as DetalleOrdenCompra[],
        total: 0,
        usuarioCreacionModificacion: ''

    });
    const [formDataProducto, setFormDataProducto] = useState({
        cantidad: '',
        Producto: '',
        PrecioUnitario: '',
        Monto: '',
        Iva: '',
        Total: '',

    });

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };
    const handleIvaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormDataProducto({
            ...formDataProducto,
            Iva: value,
            Total: calculateMontoTotal(formDataProducto.Monto, value)
        });

    };

    const calculateMontoTotal = (monto: string, iva: string) => {
        const montoNumber = parseFloat(monto);
        if (isNaN(montoNumber)) return '';

        if (iva === "0") {
            return montoNumber.toFixed(2);
        }

        const ivaNumber = parseFloat(iva) / 100;
        if (isNaN(ivaNumber)) return '';

        return (montoNumber + (montoNumber * ivaNumber)).toFixed(2);
    };

    useEffect(() => {
        const calcularTotalMonto = () => {
            const total = productos.reduce((acc, producto) => acc + parseFloat(producto.Total), 0);
            setTotalMonto(total);
        };

        calcularTotalMonto();
    }, [productos]);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        // Update form data
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));

        setFormDataProducto((prevState: any) => ({
            ...prevState,
            [name]: value
        }));

        // Calculate monto total y monto
        if (name === "cantidad" || name === "PrecioUnitario") {
            const cantidadValue = name === "cantidad" ? parseFloat(value) : formDataProducto.cantidad;
            const precioUnitarioValue = name === "PrecioUnitario" ? parseFloat(value) : formDataProducto.PrecioUnitario;


            if (!isNaN(cantidadValue as number) && !isNaN(precioUnitarioValue as number)) {
                const montoTotal = (cantidadValue as number) * (precioUnitarioValue as number);
                formDataProducto.Monto = montoTotal.toFixed(2);
            } else {

                formDataProducto.Monto = "";
            }

            formDataProducto.Total = calculateMontoTotal(formDataProducto.Monto, formDataProducto.Iva);
        }

    };

    const handleValidateFirstStep = () => {
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

        if (!formData.FechaOrden.trim()) {
            newErrors.FechaOrden = 'La fecha de orden es obligatoria';
        }

        if (!formData.FechaEntrega.trim()) {
            newErrors.FechaEntrega = 'La fecha de entrega es obligatoria';
        }

        if (!formData.proveedor.trim()) {
            newErrors.proveedor = 'El proveedor es obligatoria';
        } else if (formData.proveedor.length > 75) {
            newErrors.proveedor = 'El proveedor no pueden más de 75 carateres';
        } else {
            newErrors.proveedor = '';
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
            setStep(prevStep => prevStep + 1);
        }

    };

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                if (idEmpresaString) {

                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //Se filtran las fincas del usuario
                    const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaString));
                    // Extraer los identificadores de finca
                    const idsFincasFiltradas = fincasFiltradas.map((finca: any) => finca.idFinca);
                    setFincas(fincasFiltradas);;
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas();
                    //se filtran las parcelas con los idparcelasusuario
                    const parcelasUsuario = parcelasResponse.filter((parcela: any) => idsFincasFiltradas.includes(parcela.idFinca));
                    setParcelas(parcelasUsuario)

                    const datoNumeroDeOrden = await ObtenerUltimoIdOrdenDeCompra();

                    setIdNumeroOrden(datoNumeroDeOrden.numeroDeOrden.toString());



                } else {
                    console.error('El ID de la empresa no están disponibles en el localStorage.');
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

    // Función para actualizar formData.detalles con los datos de productos
    const actualizarDetalles = () => {
        setFormData(prevformData => ({
            ...prevformData,
            detalles: productos
        }));
    };

    // Llama a esta función cuando necesite actualizar los detalles
    useEffect(() => {
        actualizarDetalles();
    }, [productos]);

    const handleSubmit = async () => {
        if (productos.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error al insertar',
                text: "Debe de agregar al menos un producto"
            });
        }
        else {
            try {
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                formData.total = totalMonto
                formData.numeroDeOrden = idNumeroOrden;

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
    const handleAddProducto = () => {
        const newErrors: Record<string, string> = {};

        if (!formDataProducto.Producto.trim()) {
            newErrors.ProductosAdquiridos = 'El producto es obligatorio';
        } else if (formDataProducto.Producto.length > 200) {
            newErrors.ProductosAdquiridos = 'El producto no puede ser mayor a 200 caracteres';
        } else {
            newErrors.ProductosAdquiridos = '';
        }

        if (!formDataProducto.cantidad) {
            newErrors.cantidad = 'La cantidad es obligatoria';
        } else if (parseFloat(formDataProducto.cantidad) <= 0) {
            newErrors.cantidad = 'La cantidad debe ser mayor a 0';
        } else {
            newErrors.cantidad = '';
        }

        if (!formDataProducto.PrecioUnitario.trim()) {
            newErrors.PrecioUnitario = 'El precio unitario es obligatorio';
        } else if (parseFloat(formDataProducto.PrecioUnitario) <= 0) {
            newErrors.PrecioUnitario = 'El precio unitario debe ser mayor a 0';
        } else {
            newErrors.PrecioUnitario = '';
        }

        if (!formDataProducto.Monto.trim()) {
            newErrors.Monto = 'El monto es obligatorio';
        } else if (parseFloat(formDataProducto.Monto) <= 0) {
            newErrors.Monto = 'El monto debe ser mayor a 0';
        } else {
            newErrors.Monto = '';
        }

        if (!formDataProducto.Iva.trim()) {
            newErrors.iva = 'El IVA es obligatorio';
        } else {
            newErrors.iva = '';
        }
        if (!formDataProducto.Monto.trim()) {
            newErrors.Total = 'El total es obligatorio';
        } else if (parseFloat(formDataProducto.Monto) <= 0) {
            newErrors.Total = 'El total debe ser mayor a 0';
        } else {
            newErrors.Total = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            const nuevoProducto = {
                Producto: formDataProducto.Producto,
                cantidad: formDataProducto.cantidad,
                PrecioUnitario: formDataProducto.PrecioUnitario,
                Monto: formDataProducto.Monto,
                Total: formDataProducto.Total,
                iva: formDataProducto.Iva,
            };
            setProductos([...productos, nuevoProducto]);
            // Limpia los campos del formulario después de agregar el producto
            setFormDataProducto({
                Producto: '',
                cantidad: '',
                PrecioUnitario: '',
                Monto: '',
                Total: '',
                Iva: '',
            });

        }

    };
    const handleRemoveProducto = (index: number) => {
        setProductos(productos.filter((_, i) => i !== index));
    };



    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', minWidth: "560px", minHeight: "390px" }}>
            {step === 1 && (
                <div>
                    <h2>Orden de Compra</h2>
                    <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div style={{ marginRight: '10px', width: '50%' }}>
                            <FormGroup>
                                <label htmlFor="fincas">Finca:</label>
                                <select className={errors.finca ? 'input-styled input-error' : 'input-styled'} style={{ fontSize: '16px', padding: '10px', width: '100%' }} value={selectedFinca} onChange={handleFincaChange}>
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
                                <select className={errors.parcela ? 'input-styled input-error' : 'input-styled'} style={{ fontSize: '16px', padding: '10px', width: '100%' }} id="parcelas" value={selectedParcela} onChange={handleParcelaChange} >
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
                                        readOnly
                                        type="text"
                                        id="numeroDeOrden"
                                        name="numeroDeOrden"
                                        value={idNumeroOrden}
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
                    <Button className="btn-styled" onClick={handleValidateFirstStep} style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ marginRight: '5px' }}>Siguiente</span>
                        <IoArrowForward size={27} />
                    </Button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h2>Producto</h2>
                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                        <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="Producto" sm={4} className="input-label">Producto</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="Producto"
                                        name="Producto"
                                        value={formDataProducto.Producto.toString()}
                                        onChange={handleInputChange}
                                        className={errors.ProductosAdquiridos ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Producto"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.ProductosAdquiridos}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="cantidad" sm={4} className="input-label">Cantidad</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        id="cantidad"
                                        name="cantidad"
                                        value={formDataProducto.cantidad.toString()}
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
                                <Label for="PrecioUnitario" sm={4} className="input-label">Precio Unitario</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        id="PrecioUnitario"
                                        name="PrecioUnitario"
                                        value={formDataProducto.PrecioUnitario.toString()}
                                        onChange={handleInputChange}
                                        className={errors.PrecioUnitario ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.PrecioUnitario}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="Monto" sm={4} className="input-label">Monto</Label>
                                <Col sm={8}>
                                    <Input
                                        readOnly
                                        type="number"
                                        id="Monto"
                                        name="Monto"
                                        value={formDataProducto.Monto.toString()}
                                        onChange={handleInputChange}
                                        className={errors.Monto ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.Monto}</FormFeedback>
                                </Col>

                            </FormGroup>
                        </div>

                    </div>

                    <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                        <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                            <FormGroup row>
                                <label htmlFor="iva">IVA:</label>
                                <select
                                    className={errors.iva ? 'input-styled input-error' : 'input-styled'} style={{ fontSize: '16px', padding: '10px', width: '100%' }}
                                    id="iva"
                                    name="iva"
                                    value={formDataProducto.Iva}
                                    onChange={handleIvaChange}
                                >
                                    <option key="default-iva" value="">Seleccione...</option>
                                    <option key='Exento' value='0'>Exento</option>
                                    {[...Array(13).keys()].map(i => (
                                        <option key={i + 1} value={(i + 1).toString()}>{i + 1}%</option>
                                    ))}
                                </select>

                                {errors.iva && <FormFeedback>{errors.iva}</FormFeedback>}

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
                                        value={formDataProducto.Total.toString()}
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
                    <div >
                        <Button className="btn-styled" onClick={handleAddProducto} style={{ display: 'flex', justifyContent: 'center', marginRight: "10px" }}>
                            <IoAddCircleOutline size={27} />
                            <span style={{ marginLeft: '5px' }}>Agregar Producto</span>
                        </Button>
                    </div>
                    <div className="btn-container">
                        <Button onClick={handlePreviousStep} className='btn-styled-danger' style={{ display: 'flex', justifyContent: 'center', marginRight: "10px" }}>
                            <IoArrowBack size={27} />
                            <span style={{ marginLeft: '5px' }}>Anterior</span>

                        </Button>
                        <Button className="btn-styled" onClick={handleNextStep} style={{ display: 'flex', justifyContent: 'center' }}>
                            <span style={{ marginRight: '5px' }}>Siguiente</span>
                            <IoArrowForward size={27} />
                        </Button>
                    </div>
                </div>

            )}
            {step === 3 && (
                <div>
                    <h2>Lista de Productos</h2>

                    <div className='table-container-style' style={{ maxHeight: '170px', minHeight: "170px", overflowY: 'auto' }}>
                        {productos.length > 0 ? (
                            <Table responsive>
                                <thead>
                                    <tr>

                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio U.</th>
                                        <th>Monto T.</th>
                                        <th>IVA</th>
                                        <th>Accion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((producto, index) => (
                                        <tr key={index}>

                                            <td>{producto.Producto}</td>
                                            <td>{producto.cantidad}</td>
                                            <td>{producto.PrecioUnitario}</td>
                                            <td>{parseFloat(producto.Total).toFixed(2)}</td>
                                            <td>{producto.iva}</td>
                                            <td>
                                                <button className="btn-styled-danger-table" onClick={() => handleRemoveProducto(index)}>X</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p>No hay productos adquiridos.</p>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end' }}>
                        <div className="col-sm-4" style={{ marginLeft: "10px", width: '50%' }}>
                            <FormGroup>
                                <Label for="MontoTotal" sm={4} className="input-label">Monto Total</Label>
                                <Col sm={8}>
                                    <Input
                                        readOnly
                                        type="number"
                                        id="MontoTotal"
                                        name="MontoTotal"
                                        value={totalMonto.toString()}
                                        onChange={handleInputChange}
                                        className={errors.total ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                </Col>
                            </FormGroup>
                        </div>
                    </div>

                    <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                            <div className="btn-container">
                                <Button onClick={handlePreviousStep} className='btn-styled-danger' style={{ display: 'flex', justifyContent: 'center', marginRight: "10px" }}>
                                    <IoArrowBack size={27} />
                                    <span style={{ marginLeft: '5px' }}>Anterior</span>

                                </Button>

                                <Button onClick={handleSubmit} className="btn-styled" style={{ display: 'flex', justifyContent: 'center' }}>

                                    <span style={{ marginRight: '5px' }}>Guardar</span>
                                    <IoSaveOutline size={27} />
                                </Button>
                            </div>
                        </Col>
                    </FormGroup>
                </div>
            )}

        </div>
    );

};

export default CrearOrdenCompra;
