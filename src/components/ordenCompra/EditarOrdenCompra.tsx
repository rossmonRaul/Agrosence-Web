import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { ModificarOrdenDeCompra } from '../../servicios/ServicioOrdenCompra.ts';


// Interfaz para las propiedades del componente
interface OrdenCompraSeleccionado {
    idFinca: number;
    idParcela: number;
    idOrdenDeCompra: number,
    numeroDeOrden: string,
    fechaOrden: string,
    fechaEntrega: string,
    productosAdquiridos: string,
    cantidad: string,
    proveedor: string,
    precioUnitario: string,
    montoTotal: string,
    observaciones: string,
    onEdit?: () => void; 
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

const EditarOrdenCompra: React.FC<OrdenCompraSeleccionado> = ({
    idFinca,
    idParcela,
    idOrdenDeCompra,
    numeroDeOrden,
    fechaOrden,
    fechaEntrega,
    productosAdquiridos,
    cantidad,
    proveedor,
    precioUnitario,
    montoTotal,
    observaciones,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>(() => idParcela ? idParcela.toString() : '');

    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idParcela: '',
        idOrdenDeCompra: '',
        numeroDeOrden: '',
        fechaOrden: '',
        fechaEntrega: '',
        productosAdquiridos: '',
        cantidad: '',
        proveedor: '',
        precioUnitario: '',
        montoTotal: '',
        observaciones: '',
        usuarioCreacionModificacion: '',
    });

    const [formData, setFormData] = useState<any>({
        idFinca: 0,
        idParcela: 0,
        idOrdenDeCompra: 0,
        numeroDeOrden: '',
        fechaOrden: '',
        fechaEntrega: '',
        productosAdquiridos: '',
        cantidad: '',
        proveedor: '',
        precioUnitario: '',
        montoTotal: '',
        observaciones: '',
        usuarioCreacionModificacion: '',
    });

    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        setStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setStep(prevStep => prevStep - 1);
    };

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
    
        // Update form data
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    
        // Calculate total amount
        if (name === "cantidad" || name === "precioUnitario") {
            const cantidadValue = name === "cantidad" ? parseFloat(value) : formData.cantidad;
            const precioUnitarioValue = name === "precioUnitario" ? parseFloat(value) : formData.precioUnitario;
    
            // Check if both cantidadValue and precioUnitarioValue are valid numbers
            if (!isNaN(cantidadValue as number) && !isNaN(precioUnitarioValue as number)) {
                const montoTotal = (cantidadValue as number) * (precioUnitarioValue as number);
                formData.montoTotal = montoTotal.toString();
            } else {
                // If either input value is not a number, reset the total amount
                formData.montoTotal = "";
            }
        }
    };
    


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
            fechaOrden: fecha,
            fechaEntrega: fechaEntregaForm,
            productosAdquiridos: productosAdquiridos,
            cantidad: cantidad,
            proveedor: proveedor,
            precioUnitario: precioUnitario,
            montoTotal: montoTotal,
            observaciones: observaciones,
        });
        

    }, [idOrdenDeCompra]);

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
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

        if (!formData.fechaOrden || formData.fechaOrden === "") {
            newErrors.fechaOrden = 'La fecha de orden es obligatoria';
        }
        
        if (!formData.fechaEntrega || formData.fechaEntrega === "") {
            newErrors.fechaEntrega = 'La fecha de entrega es obligatoria';
        }
        

        if (!formData.cantidad) {
            newErrors.cantidad = 'La cantidad es obligatoria';
        } else {
            newErrors.cantidad = '';
        }

        if (!formData.proveedor.trim()) {
            newErrors.proveedor = 'El proveedor es obligatoria';
        } else if (formData.proveedor.length > 75) {
            newErrors.proveedor = 'El proveedor no pueden mas de 75 carateres';
        } else {
            newErrors.proveedor = '';
        }
        
        if (!formData.productosAdquiridos || formData.productosAdquiridos === "") {
            newErrors.productosAdquiridos = 'El producto adquirido es obligatorio';
        } else if (formData.productosAdquiridos.length > 200) {
            newErrors.productosAdquiridos = 'El producto adquirido no puede ser mayor a 200 caracteres';
        } else {
            newErrors.productosAdquiridos = '';
        }
        
        if (!formData.precioUnitario || formData.precioUnitario === "") {
            newErrors.precioUnitario = 'El precio unitario es obligatorio';
        } else {
            newErrors.precioUnitario = '';
        }

        if (!formData.observaciones || formData.observaciones === "") {
            newErrors.observaciones = 'La observacion es obligatoria';
        }else if (formData.observaciones.length > 200) {
            newErrors.observaciones = 'Las observaciones no puede ser mayor a 200 caracteres';
        } else {
            newErrors.observaciones = '';
        }
        

        const fechaOrdenParts = formData.fechaOrden.split("/");
        const fechaOrdenFormatted = `${fechaOrdenParts[2]}-${fechaOrdenParts[1]}-${fechaOrdenParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaOrdenDate = new Date(fechaOrdenFormatted);

        const fechaEntregaParts = formData.fechaEntrega.split("/");
        const fechaEntregaFormatted = `${fechaEntregaParts[2]}-${fechaEntregaParts[1]}-${fechaEntregaParts[0]}`;

        // Crear el objeto Date con la fecha formateada
        const fechaEntregaDate = new Date(fechaEntregaFormatted)

        if (fechaOrdenDate > fechaEntregaDate) {
            newErrors.fechaOrden = 'Error Fecha de Orden';
        }

        // Obtener la fecha actual
        const today = new Date();

        // Verificar si fechaGenerativaDate es mayor que hoy
        if (fechaOrdenDate > today) {
            newErrors.fechaOrden = 'Fecha de Orden no puede ser mayor a hoy';
        }

        // Verificar si fechaManejoDate es mayor que hoy
        if (fechaEntregaDate > today) {
            newErrors.fechaEntrega = 'Fecha de Entrega no puede ser mayor a hoy';
        }


        setErrors(newErrors);

        // Avanzar al siguiente paso si no hay errores
        if (Object.values(newErrors).every(error => error === '')) {
            handleSubmit();
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
            console.log("sdvsffvsffvb",formData)
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
                                        value={formData.proveedor}
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
                                <Label for="fechaOrden" sm={4} className="input-label">Fecha Orden</Label>
                                <Col sm={8}>
                                    <Input
                                        type="date"
                                        id="fechaOrden"
                                        name="fechaOrden"
                                        value={formData.fechaOrden}
                                        onChange={handleInputChange}
                                        className={errors.fechaOrden ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Selecciona una fecha"
                                    />
                                    <FormFeedback>{errors.fechaOrden}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div style={{ flex: 1 }}>
                            <FormGroup row>
                                <Label for="fechaEntrega" sm={4} className="input-label">Fecha Entrega</Label>
                                <Col sm={8}>
                                    <Input
                                        type="date"
                                        id="fechaEntrega"
                                        name="fechaEntrega"
                                        value={formData.fechaEntrega}
                                        onChange={handleInputChange}
                                        className={errors.fechaEntrega ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Selecciona una fecha"
                                    />
                                    <FormFeedback>{errors.fechaEntrega}</FormFeedback>
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
                                <Label for="productosAdquiridos" sm={4} className="input-label">Producto Adquirido</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="productosAdquiridos"
                                        name="productosAdquiridos"
                                        value={formData.productosAdquiridos}
                                        onChange={handleInputChange}
                                        className={errors.productosAdquiridos ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Producto Adquirido"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.productosAdquiridos}</FormFeedback>
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
                                        id="precioUnitario"
                                        name="precioUnitario"
                                        value={formData.precioUnitario}
                                        onChange={handleInputChange}
                                        className={errors.precioUnitario ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="Precio Unitario"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.precioUnitario}</FormFeedback>
                                </Col>
                            </FormGroup>
                        </div>
                        <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                            <FormGroup row>
                                <Label for="montoTotal" sm={4} className="input-label">Monto Total</Label>
                                <Col sm={8}>
                                    <Input
                                        readOnly
                                        type="number"
                                        id="montoTotal"
                                        name="montoTotal"
                                        value={formData.montoTotal}
                                        onChange={handleInputChange}
                                        className={errors.montoTotal ? 'input-styled input-error' : 'input-styled'}
                                        placeholder="0.0"
                                        maxLength={50}
                                    />
                                    <FormFeedback>{errors.montoTotal}</FormFeedback>
                                </Col>

                            </FormGroup>
                        </div>

                    </div>
                    <div className="col-sm-4">
                        <FormGroup row>
                            <Label for="observaciones" sm={4} className="input-label">Observaciones</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="observaciones"
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    className={errors.observaciones ? 'input-styled input-error' : 'input-styled'}
                                    style={{ minWidth: '350px' }}
                                    placeholder="observaciones"
                                    maxLength={100}
                                />
                                <FormFeedback>{errors.observaciones}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                    <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                            {/* Agregar aquí el botón de cancelar proporcionado por el modal */}
                            <button onClick={handlePreviousStep} className='btn-styled-danger'>Anterior</button>
                            <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                        </Col>
                    </FormGroup>
                </div>

            )}
        </div>
    );
};

export default EditarOrdenCompra;
