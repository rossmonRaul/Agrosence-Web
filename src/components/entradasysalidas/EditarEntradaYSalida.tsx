import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import '../../css/CrearCuenta.css';
import { ModificarRegistroEntradaSalida } from '../../servicios/ServicioEntradaYSalida.ts';

// Interfaz para las propiedades del componente
interface EntradaYSalidaSeleccionado {
    idFinca: number;
    idRegistroEntradaSalida: number,
    tipo: string,
    fecha: string,
    precioUnitario: string,
    cantidad: number,
    montoTotal: string,
    detalles: string,
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idFinca: number;
}

const EditarEntradaYSalida: React.FC<EntradaYSalidaSeleccionado> = ({
    idFinca,
    idRegistroEntradaSalida,
    tipo,
    fecha,
    precioUnitario,
    cantidad,
    montoTotal,
    detalles,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');

    const [selectedTipo, setSelectedTipo] = useState<string>('');


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

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idRegistroEntradaSalida: '',
        tipo: '',
        fecha: '',
        precioUnitario: '',
        cantidad: '',
        montoTotal: '',
        detallesCompraVenta: '',
        usuarioCreacionModificacion: '',
    });

    // Función para manejar cambios en los inputs del formulario
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
    const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        formData.tipo = value;
        setSelectedTipo(value);
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
                    //Se obtienen las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //Se filtran las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);

                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerFincas();
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
            precioUnitario: precioUnitario,
            cantidad: cantidad,
            montoTotal: montoTotal,
            detallesCompraVenta: detalles,
        });

    }, [idRegistroEntradaSalida]);

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};

        if (!formData.idFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!formData.tipo || formData.tipo === "") {
            newErrors.tipo = 'El tipo es obligatorio';
        } else {
            newErrors.tipo = '';
        }

        if (!formData.fecha || formData.fecha === "") {
            newErrors.fecha = 'La fecha generacion es obligatoria';
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

        if (!formData.precioUnitario || formData.precioUnitario === "") {
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

        // Verificar si fecha es mayor que hoy
        if (fechaDate > today) {
            newErrors.fecha = 'Fecha no puede ser mayor a hoy';
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
            console.log(formData)
            const resultado = await ModificarRegistroEntradaSalida(formData);
            console.log(resultado)
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

                        <Button onClick={handleSubmitConValidacion} className="btn-styled">Guardar</Button>
                    </Col>
                </FormGroup>
            </div>


        </div>
    );
};

export default EditarEntradaYSalida;
