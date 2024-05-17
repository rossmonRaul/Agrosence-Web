import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/ManejoResiduos.css';
import { InsertarRegistroEntradaSalida } from '../../servicios/ServicioEntradaYSalida.ts';


interface CrearEntradasYSalidasProps {
    onAdd: () => void;
}



interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idFinca: number;
}

const CrearEntradasSalidas: React.FC<CrearEntradasYSalidasProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        idFinca: '',
        tipo: '',
        fecha: '',
        cantidad: '',
        precioUnitario: '',
        montoTotal: '',
        detallesCompraVenta: '',
        usuarioCreacionModificacion: ''

    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');

    const [selectedTipo, setSelectedTipo] = useState<string>('');
    

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));

        // Calculate monto total
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

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;

                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });
                    const idFincasUsuario = usuariosAsignados.map((usuario: any) => usuario.idFinca);

                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);

                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
    }, []);


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
        setSelectedFinca(value);

    };



    const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.tipo = value;
        setSelectedTipo(value);
    };

    const handleSubmit = async () => {
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

        if (!formData.cantidad) {
            newErrors.cantidad = 'La cantidad es obligatoria';
        } else {
            newErrors.cantidad = '';
        }

        if (!formData.detallesCompraVenta || formData.detallesCompraVenta === "") {
            newErrors.detalles = 'Los detalles son obligatorios';
        } else if (formData.detallesCompraVenta.length > 200) {
            newErrors.detalles = 'Los detalles no pueden ser más de 200 carateres';
        } else {
            newErrors.detalles = '';
        }

        if (!formData.precioUnitario.trim()) {
            newErrors.precioUnitario = 'El precio unitario es obligatorio';
        } else {
            newErrors.precioUnitario = '';
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

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioCreacionModificacion = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                const resultado = await InsertarRegistroEntradaSalida(formData);
                
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro insertado!',
                        text: 'Se ha insertado  un la entrada o salida'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar la entrada o salida:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la entrada o salida',
                    text: 'Ocurrió un error al intentar insertar la entrada o salida. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '90%', margin: '0 auto' }}>

            <div>
                <h2>Entrada o Salida</h2>
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
                    <div className="col-sm-4" style={{ marginRight: "0px", width: '50%' }}>
                        <FormGroup row>
                            <label htmlFor="tipos">Tipo:</label>
                            <select className="custom-select input-styled" id="tipo" value={selectedTipo} onChange={handleTipoChange}>
                                <option key="default-tipo" value="">Seleccione un tipo...</option>
                                <option key="compra" value="Compra">Compra</option>
                                <option key="venta" value="Venta">Venta</option>
                            </select>
                            {errors.tipo && <FormFeedback>{errors.tipo}</FormFeedback>}

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

                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                    <div style={{ marginRight: "10px", flex: 1 }}>
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
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="cantidad" sm={4} className="input-label">Cantidad</Label>
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
                            <Label for="precioUnitario" sm={4} className="input-label">Precio Unitario (₡)</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="precioUnitario"
                                    name="precioUnitario"
                                    value={formData.precioUnitario.toString()}
                                    onChange={handleInputChange}
                                    className={errors.precioUnitario ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.precioUnitario}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="montoTotal" sm={4} className="input-label">Monto Total (₡)</Label>
                            <Col sm={8}>
                                <Input
                                    readOnly
                                    type="number"
                                    id="montoTotal"
                                    name="montoTotal"
                                    value={formData.montoTotal.toString()}
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
                <FormGroup row>
                    <Col sm={{ size: 10, offset: 2 }}>

                        <Button onClick={handleSubmit} className="btn-styled">Guardar</Button>
                    </Col>
                </FormGroup>
            </div>


        </div>
    );

};

export default CrearEntradasSalidas;
