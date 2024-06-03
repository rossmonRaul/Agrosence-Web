import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button, Table } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { ModificarRegistroEntradaSalida, ObtenerDetalleRegistroEntradaSalidaPorId } from '../../servicios/ServicioEntradaYSalida.ts';
import { IoAddCircleOutline, IoArrowBack, IoArrowForward, IoSaveOutline } from 'react-icons/io5';

// Interfaz para las propiedades del componente
interface EntradaYSalidaSeleccionado {
    idFinca: string;
    idRegistroEntradaSalida: number,
    tipo: string,
    fecha: string,
    detallesCompraVenta: string,
    total: string,
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idFinca: number;
}

interface DetalleEntradasSalidas {
    producto: string;
    cantidad: string;
    precioUnitario: string;
    total: string;
    iva: string;
}


const EditarEntradaYSalida: React.FC<EntradaYSalidaSeleccionado> = ({
    idFinca,
    idRegistroEntradaSalida,
    tipo,
    fecha,
    detallesCompraVenta,
    total,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');

    const [selectedTipo, setSelectedTipo] = useState<string>('');
    const [step, setStep] = useState(1);

    const [productos, setProductos] = useState<DetalleEntradasSalidas[]>([]);
    const [totalMonto, setTotalMonto] = useState(0);
    const [monto, setmonto] = useState(0);


    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idRegistroEntradaSalida: '',
        tipo: '',
        fecha: '',
        precioUnitario: '',
        cantidad: '',
        montoTotal: '',
        detalles: ''
    });

    const [formData, setFormData] = useState({
        idFinca: '',
        idRegistroEntradaSalida: 0,
        tipo: '',
        fecha: '',
        total: '',
        detallesCompraVenta: '',
        detalles: [] as DetalleEntradasSalidas[],
        usuarioCreacionModificacion: ''

    });

    const [formDataProducto, setFormDataProducto] = useState({
        cantidad: '',
        producto: '',
        precioUnitario: '',
        iva: '',
        total: '',

    });

    useEffect(() => {
        const calcularTotalMonto = () => {
            const total = productos.reduce((acc, producto) => acc + parseFloat(producto.total), 0);
            setTotalMonto(parseFloat(total.toFixed(2)));
        };

        calcularTotalMonto();
    }, [productos]);

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));

        setFormDataProducto((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
        let montoTotal = 0;

        // Calcular el monto del producto
        if (name === "cantidad" || name === "precioUnitario") {
            const cantidadValue = name === "cantidad" ? parseFloat(value) : formDataProducto.cantidad;
            const precioUnitarioValue = name === "precioUnitario" ? parseFloat(value) : formDataProducto.precioUnitario;


            if (!isNaN(cantidadValue as number) && !isNaN(precioUnitarioValue as number)) {
                montoTotal = (cantidadValue as number) * (precioUnitarioValue as number);

                setmonto(montoTotal);
            } else {

                setmonto(0);
            }
        }

        formDataProducto.total = calculateMontoTotal(montoTotal.toString(), formDataProducto.iva);
    };
    const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.tipo = value;
        setSelectedTipo(value);
    };



    // Obtener datos al cargar la página
    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                if (idEmpresaString) {

                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //Se filtran las fincas del usuario
                    const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);;

                    const detalles = await ObtenerDetalleRegistroEntradaSalidaPorId({ idRegistroEntradaSalida: idRegistroEntradaSalida.toString() });
                    setProductos(detalles);

                } else {
                    console.error('El ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosIniciales();
    }, []);

    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.idFinca = value
        setSelectedFinca(value);
    };

    const empresaUsuarioString = localStorage.getItem('empresaUsuario');
    let filteredFincas: Option[] = [];

    if (empresaUsuarioString !== null) {
        const empresaUsuario = parseInt(empresaUsuarioString, 10);
        filteredFincas = fincas.filter(finca => finca.idEmpresa === empresaUsuario);
    } else {
        console.error('El valor de empresaUsuario en localStorage es nulo.');
    }

    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        const parts = fecha.split('/');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const fechaString = year + '-' + month + '-' + day;

        setSelectedTipo(tipo)
        setFormData({
            idFinca: idFinca,
            idRegistroEntradaSalida: idRegistroEntradaSalida,
            tipo: tipo,
            fecha: fechaString,
            detallesCompraVenta: detallesCompraVenta,
            detalles: productos,
            total: total,
            usuarioCreacionModificacion: ''
        });

    }, [idRegistroEntradaSalida]);

    // Función para actualizar formData.detalles con los datos de productos
    const actualizarDetalles = () => {
        setFormData(prevformData => ({
            ...prevformData,
            detalles: productos
        }));
    };

    // Llama a esta función cuando se necesite actualizar los detalles
    useEffect(() => {
        actualizarDetalles();
    }, [productos]);

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};

        if (!formData.idFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!formData.tipo.trim()) {
            newErrors.tipo = 'El tipo es obligatorio';
        } else {
            newErrors.tipo = '';
        }

        if (!formData.fecha.trim()) {
            newErrors.fecha = 'La fecha es obligatoria';
        }

        if (!formData.detallesCompraVenta || formData.detallesCompraVenta === "") {
            newErrors.detalles = 'Los detalles son obligatorios';
        } else if (formData.detallesCompraVenta.length > 200) {
            newErrors.detalles = 'Los detalles no pueden ser más de 200 carateres';
        } else {
            newErrors.detalles = '';
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

        setErrors(newErrors);

        if (productos.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error al insertar',
                text: "Debe de agregar al menos un producto"
            });
        } else {

            // Avanzar al siguiente paso si no hay errores
            if (Object.values(newErrors).every(error => error === '')) {
                handleSubmit();
            }
        }
    };
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
            iva: value,
            total: calculateMontoTotal(monto.toString(), value)
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
    const handleRemoveProducto = (index: number) => {
        setProductos(productos.filter((_, i) => i !== index));
    };
    const handleAddProducto = () => {
        const newErrors: Record<string, string> = {};

        if (!formDataProducto.producto.trim()) {
            newErrors.producto = 'El producto es obligatorio';
        } else if (formDataProducto.producto.length > 200) {
            newErrors.producto = 'El producto no puede ser mayor a 200 caracteres';
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
                total: formDataProducto.total,
                iva: formDataProducto.iva,
            };
            setProductos([...productos, nuevoProducto]);
            // Limpia los campos del formulario después de agregar el producto
            setFormDataProducto({
                producto: '',
                cantidad: '',
                precioUnitario: '',
                total: '',
                iva: '',
            });

        }

    };
    // Función para manejar el envío del formulario
    const handleSubmit = async () => {


        try {
            const idUsuario = localStorage.getItem('identificacionUsuario');

            if (idUsuario !== null) {
                formData.usuarioCreacionModificacion = idUsuario;
            } else {
                console.error('El valor de identificacionUsuario en localStorage es nulo.');
            }

            const resultado = await ModificarRegistroEntradaSalida(formData);

            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Entrada o Salida Actualizada! ',
                    text: 'Se ha actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar.',
                    text: resultado.mensaje,
                });
            };
            if (onEdit) {
                onEdit();
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto', minWidth: "590px", minHeight: "490px", flexGrow: 1 }}>

            <div>
                {step === 1 && (
                    <div>
                        <h2 style={{ marginBottom: '7px' }}>Entrada o Salida</h2>
                        <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                            <div style={{ marginRight: '10px', width: '50%' }}>
                                <FormGroup>
                                    <label htmlFor="fincas">Finca:</label>
                                    <select className={errors.finca ? 'input-styled input-error' : 'input-styled'} style={{ fontSize: '16px', padding: '10px', width: '100%' }} id="fincas" value={selectedFinca} onChange={handleFincaChange}>
                                        <option key="default-finca" value="">Seleccione...</option>
                                        {filteredFincas.map((finca) => (
                                            <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                                        ))}
                                    </select>
                                    {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                                </FormGroup>
                            </div>
                            <div className="col-sm-4" style={{ marginRight: "10px", width: '33%' }}>
                                <FormGroup row>
                                    <label htmlFor="tipos">Tipo:</label>
                                    <select className={errors.tipo ? 'input-styled input-error' : 'input-styled'} style={{ fontSize: '16px', padding: '10px', width: '100%' }} id="tipo" value={selectedTipo} onChange={handleTipoChange}>
                                        <option key="default-tipo" value="">Seleccione un tipo...</option>
                                        <option key="compra" value="Compra">Compra</option>
                                        <option key="venta" value="Venta">Venta</option>
                                    </select>
                                    {errors.tipo && <FormFeedback>{errors.tipo}</FormFeedback>}

                                </FormGroup>
                            </div>
                            <div style={{ marginRight: "0px", width: '33%' }}>
                                <FormGroup row>
                                    <Label for="fecha" sm={4} className="input-label">Fecha</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="date"
                                            id="fecha"
                                            name="fecha"
                                            value={formData.fecha}
                                            onChange={handleInputChange}
                                            className={errors.fecha ? 'input-styled input-error' : 'input-styled'}
                                            placeholder="Selecciona una fecha"
                                        />
                                        <FormFeedback>{errors.fecha}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>

                        </div>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>

                            <div className="col-sm-4" style={{ width: '100%' }}>
                                <FormGroup row>
                                    <Label for="detallesCompraVenta" sm={4} className="input-label">Detalles</Label>
                                    <Col sm={8}>
                                        <Input
                                            type="text"
                                            id="detallesCompraVenta"
                                            name="detallesCompraVenta"
                                            value={formData.detallesCompraVenta}
                                            onChange={handleInputChange}
                                            className={errors.detalles ? 'input-styled input-error' : 'input-styled'}
                                            placeholder="Detalles"
                                        />
                                        <FormFeedback>{errors.detalles}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>

                        </div>
                        <h2 style={{ marginBottom: '7px' }}>Producto</h2>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>

                            <div className="col-sm-4" style={{ marginRight: "0px", width: '100%' }}>
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
                                        <FormFeedback>{errors.Producto}</FormFeedback>
                                    </Col>
                                </FormGroup>
                            </div>

                        </div>

                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>


                            <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
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
                            <div className="col-sm-4" style={{ marginRight: "0px", flex: '50%' }}>
                                <FormGroup row>
                                    <Label for="precioUnitario1" sm={4} className="input-label">Precio Unitario (₡)</Label>
                                    <Col sm={4}>
                                        <Input
                                            type="number"
                                            id="precioUnitario1"
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


                        </div>
                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>

                            <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                                <FormGroup row>
                                    <label htmlFor="iva">IVA:</label>
                                    <select
                                        className='input-styled'
                                        id="iva"
                                        name="iva"
                                        value={formDataProducto.iva}
                                        onChange={handleIvaChange}
                                        style={{ fontSize: '16px', padding: '10px', width: '100%' }}
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
                                <FormGroup>
                                    <Label for="total" sm={4} className="input-label">Monto Total (₡)</Label>
                                    <Col sm={4}>
                                        <Input
                                            readOnly
                                            type="number"
                                            id="total"
                                            name="total"
                                            value={formDataProducto.total}
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

                        <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>

                        </div>

                        <div className="btn-container">

                            <Button className="btn-styled" onClick={handleAddProducto} style={{ display: 'flex', justifyContent: 'center', marginRight: "10px" }}>
                                <IoAddCircleOutline size={27} />
                                <span style={{ marginLeft: '5px' }}>Agregar Producto</span>
                            </Button>
                            <Button className="btn-styled" onClick={handleNextStep} style={{ display: 'flex', justifyContent: 'center' }}>
                                <span style={{ marginRight: '5px' }}>Siguiente</span>
                                <IoArrowForward size={27} />
                            </Button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <h2>Productos Adquiridos</h2>


                        <div className='table-container-style' style={{ maxHeight: '255px', minHeight: '255px', overflowY: 'auto' }}>
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
                            ) : (
                                <p>No hay productos adquiridos.</p>
                            )}
                        </div>




                        <div style={{ marginTop: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', marginTop: '30px' }}>
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
                                    <div className="btn-container" style={{ marginBottom: "10px" }}>
                                        <Button onClick={handlePreviousStep} className='btn-styled-danger' style={{ display: 'flex', justifyContent: 'center', marginRight: "10px" }}>
                                            <IoArrowBack size={27} />
                                            <span style={{ marginLeft: '5px' }}>Anterior</span>

                                        </Button>
                                        <Button onClick={handleSubmitConValidacion} className="btn-styled" style={{ display: 'flex', justifyContent: 'center' }}>

                                            <span style={{ marginRight: '5px' }}>Guardar</span>
                                            <IoSaveOutline size={27} />
                                        </Button>
                                    </div>
                                </Col>
                            </FormGroup>

                        </div>

                    </div>


                )}
            </div>


        </div>
    );
};

export default EditarEntradaYSalida;
