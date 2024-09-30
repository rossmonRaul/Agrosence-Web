import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button, Table } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import '../../css/CrearCuenta.css';
import { ModificarOrdenDeCompra, ObtenerDetalleOrdenDeCompraPorId } from '../../servicios/ServicioOrdenCompra.ts';
import { IoAddCircleOutline, IoArrowBack, IoArrowForward, IoSaveOutline } from 'react-icons/io5';


// Interfaz para las propiedades del componente
interface OrdenCompraSeleccionado {
    idFinca: string;
    idParcela: string;
    idOrdenDeCompra: number,
    numeroDeOrden: string,
    fechaOrden: string,
    fechaEntrega: string,
    total: string,
    observaciones: string,
    proveedor: string,
    onEdit?: () => void;
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}
interface DetalleOrdenCompra {
    producto: string;
    cantidad: string;
    precioUnitario: string;
    total: string;
    iva: string;
}


const EditarOrdenCompra: React.FC<OrdenCompraSeleccionado> = ({
    idFinca,
    idParcela,
    idOrdenDeCompra,
    numeroDeOrden,
    fechaOrden,
    fechaEntrega,
    total,
    observaciones,
    proveedor,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');

    const [productos, setProductos] = useState<DetalleOrdenCompra[]>([]);
    const [totalMonto, setTotalMonto] = useState(0);

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        numeroDeOrden: '',
        fechaOrden: '',
        fechaEntrega: '',
        total: '',
        observaciones: '',
        usuarioCreacionModificacion: '',
    });

    const [formData, setFormData] = useState({
        idFinca: '',
        idParcela: '',
        idOrdenDeCompra: 0,
        numeroDeOrden: '',
        proveedor: '',
        FechaOrden: '',
        FechaEntrega: '',
        Observaciones: '',
        detalles: [] as DetalleOrdenCompra[],
        total: '',
        usuarioCreacionModificacion: ''

    });

    const [formDataProducto, setFormDataProducto] = useState({
        cantidad: '',
        producto: '',
        precioUnitario: '',
        monto: '',
        iva: '',
        total: '',

    });
    const handleIvaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormDataProducto({
            ...formDataProducto,
            iva: value,
            total: calculateMontoTotal(formDataProducto.monto, value)
        });
    };
    const calculateMontoTotal = (monto: string, iva: string) => {
        const montoNumber = parseFloat(monto);
        const ivaNumber = parseFloat(iva) / 100;
        if (isNaN(montoNumber) || isNaN(ivaNumber)) return '';
        return (montoNumber + (montoNumber * ivaNumber)).toFixed(2);
    };

    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    useEffect(() => {
        const calcularTotalMonto = () => {
            const total = productos.reduce((acc, producto) => acc + parseFloat(producto.total), 0);
            setTotalMonto(total);
        };

        calcularTotalMonto();
    }, [productos]);

    // Función para manejar cambios en los inputs del formulario
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

        // Calculate total amount
        if (name === "cantidad" || name === "precioUnitario") {
            const cantidadValue = name === "cantidad" ? parseFloat(value) : formDataProducto.cantidad;
            const precioUnitarioValue = name === "precioUnitario" ? parseFloat(value) : formDataProducto.precioUnitario;

            // Check if both cantidadValue and precioUnitarioValue are valid numbers
            if (!isNaN(cantidadValue as number) && !isNaN(precioUnitarioValue as number)) {
                const montoTotal = (cantidadValue as number) * (precioUnitarioValue as number);
                formDataProducto.monto = montoTotal.toString();
            } else {

                formDataProducto.monto = "";
            }

            formDataProducto.total = calculateMontoTotal(formDataProducto.monto, formDataProducto.iva);
        }
    };



    // Obtener datos al cargar la página
    useEffect(() => {
        const obtenerDatos = async () => {
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

                    const datosDetalles = await ObtenerDetalleOrdenDeCompraPorId({ idOrdenDeCompra: idOrdenDeCompra });

                    setProductos(datosDetalles);

                } else {
                    console.error('El ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatos();
    }, [setParcelas]);

    //se filtran las parcelas de acuerdo a la finca seleccionada
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

    useEffect(() => {

        // Actualizar el formData cuando las props cambien
        const parts = fechaOrden.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const fecha = year + '-' + month + '-' + day;

        const partsManejo = fechaEntrega.split('/');
        const dayManejo = partsManejo[0];
        const monthManejo = partsManejo[1];
        const yearManejo = partsManejo[2];
        const fechaEntregaForm = yearManejo + '-' + monthManejo + '-' + dayManejo;

        setFormData({
            idFinca: idFinca,
            idParcela: idParcela,
            idOrdenDeCompra: idOrdenDeCompra,
            numeroDeOrden: numeroDeOrden,
            FechaOrden: fecha,
            FechaEntrega: fechaEntregaForm,
            total: total,
            Observaciones: observaciones,
            proveedor: proveedor,
            detalles: productos,
            usuarioCreacionModificacion: ''
        });

        setTotalMonto(parseFloat(total));


    }, [idOrdenDeCompra]);


    // Función para manejar el envío del formulario
    const handleSubmit = async () => {

        if (productos.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error al insertar',
                text: "Debe de agregar al menos un producto"
            });
        } else {
            try {
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }
                formData.detalles = productos;
                const resultado = await ModificarOrdenDeCompra(formData);

                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Orden compra Actualizada! ',
                        text: 'Orden actualizada con éxito.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar la orden de compra',
                        text: resultado.mensaje,
                    });
                };
                if (onEdit) {
                    onEdit();
                }
            } catch (error) {
                console.log(error);
            }
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
    const handleRemoveProducto = (index: number) => {
        setProductos(productos.filter((_, i) => i !== index));
    };

    const handleAddProducto = () => {
        const newErrors: Record<string, string> = {};

        if (!formDataProducto.producto.trim()) {
            newErrors.producto = 'El producto adquirido es obligatorio';
        } else if (formDataProducto.producto.length > 200) {
            newErrors.producto = 'El producto adquirido no puede ser mayor a 200 caracteres';
        } else {
            newErrors.producto = '';
        }

        if (!formDataProducto.cantidad) {
            newErrors.cantidad = 'La cantidad es obligatoria';
        } else if (parseFloat(formDataProducto.cantidad) <= 0) {
            newErrors.cantidad = 'La cantidad debe ser mayor a 0';
        } else {
            newErrors.cantidad = '';
        }

        if (!formDataProducto.precioUnitario.trim()) {
            newErrors.precioUnitario = 'El precio unitario es obligatorio';
        } else if (parseFloat(formDataProducto.precioUnitario) <= 0) {
            newErrors.precioUnitario = 'El precio unitario debe ser mayor a 0';
        } else {
            newErrors.precioUnitario = '';
        }

        if (!formDataProducto.monto.trim()) {
            newErrors.monto = 'El monto es obligatorio';
        } else if (parseFloat(formDataProducto.monto) <= 0) {
            newErrors.monto = 'El monto debe ser mayor a 0';
        } else {
            newErrors.monto = '';
        }

        if (!formDataProducto.iva.trim()) {
            newErrors.iva = 'El IVA es obligatorio';
        } else {
            newErrors.iva = '';
        }


        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            const nuevoProducto = {
                producto: formDataProducto.producto,
                cantidad: formDataProducto.cantidad,
                precioUnitario: formDataProducto.precioUnitario,
                monto: formDataProducto.monto,
                total: formDataProducto.total,
                iva: formDataProducto.iva,
            };
            setProductos([...productos, nuevoProducto]);
            // Limpia los campos del formulario después de agregar el producto
            setFormDataProducto({
                producto: '',
                cantidad: '',
                precioUnitario: '',
                monto: '',
                total: '',
                iva: '',
            });

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
                                <select className={errors.parcela ? 'input-styled input-error' : 'input-styled'} style={{ fontSize: '16px', padding: '10px', width: '100%' }} id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                                    <option key="default-parcela" value="">Seleccione...</option>
                                    {filteredParcelas.map((parcela) => (
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
                                        type="text"
                                        id="numeroDeOrden"
                                        name="numeroDeOrden"
                                        value={formData.numeroDeOrden}
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
                                <Label for="producto" sm={4} className="input-label">Producto</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="producto"
                                        name="producto"
                                        value={formDataProducto.producto}
                                        onChange={handleInputChange}
                                        className={errors.producto ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Producto"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.producto}</FormFeedback>
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
                                        value={formDataProducto.cantidad}
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
                                <Label for="precioUnitario" sm={4} className="input-label">Precio Unitario</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        id="precioUnitario"
                                        name="precioUnitario"
                                        value={formDataProducto.precioUnitario}
                                        onChange={handleInputChange}
                                        className={errors.precioUnitario ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.precioUnitario}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="monto" sm={4} className="input-label">Monto</Label>
                                <Col sm={8}>
                                    <Input
                                        readOnly
                                        type="number"
                                        id="monto"
                                        name="monto"
                                        value={formDataProducto.monto}
                                        onChange={handleInputChange}
                                        className={errors.monto ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.monto}</FormFeedback>
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
                                    value={formDataProducto.iva}
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
                                <Label for="total" sm={4} className="input-label">Monto Total</Label>
                                <Col sm={8}>
                                    <Input
                                        readOnly
                                        type="number"
                                        id="total"
                                        name="total"
                                        value={formDataProducto.total.toString()}
                                        onChange={handleInputChange}
                                        className={errors.total ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.total}</FormFeedback>
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
                    {productos.length > 0 ? (

                        <div className='table-container-style' style={{ maxHeight: '170px', overflowY: 'auto' }}>
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

                                            <td>{producto.producto}</td>
                                            <td>{producto.cantidad}</td>
                                            <td>{producto.precioUnitario}</td>
                                            <td>{parseFloat(producto.total).toFixed(2)}</td>
                                            <td>{producto.iva}</td>
                                            <td>
                                                <button className="btn-styled-danger-table" onClick={() => handleRemoveProducto(index)}>X</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>



                    ) : (
                        <p>No hay productos adquiridos.</p>
                    )}
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
                                        value={totalMonto}
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

export default EditarOrdenCompra;
