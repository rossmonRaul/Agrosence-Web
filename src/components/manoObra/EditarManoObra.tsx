import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import '../../css/CrearCuenta.css';
import { ModificarRegistroManoObra } from '../../servicios/ServicioManoObra.ts';

// Interfaz para las propiedades del componente
interface ManoObraSeleccionado {
    idFinca: number;
    idRegistroManoObra: number,
    actividad: string,
    fecha: string,
    trabajador: string,
    identificacion: string, 
    horasTrabajadas: number,
    pagoPorHora: string,
    totalPago: string,
    onEdit?: () => void; // Hacer onEdit opcional agregando "?"
}

interface Option {
    identificacion: string;
    idEmpresa: number;
    nombre: string;
    idFinca: number;
}

const EditarManoObra: React.FC<ManoObraSeleccionado> = ({
    idFinca,
    idRegistroManoObra,
    actividad,
    fecha,
    trabajador,
    identificacion, 
    horasTrabajadas,
    pagoPorHora,
    totalPago,
    onEdit
}) => {

    const [fincas, setFincas] = useState<Option[]>([]);

    //esto rellena los select de finca y parcela cuando se carga el modal
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');


    // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({
        idFinca: '',
        idRegistroManoObra: '',
        actividad: '',
        fecha: '',
        identificacion: '', 
        trabajador: '',
        horasTrabajadas: '',
        pagoPorHoraotal: '',
        totalPago: ''
    });

    const [formData, setFormData] = useState<any>({
        idFinca: '',
        idRegistroManoObra: '',
        actividad: '',
        fecha: '',
        identificacion: '', 
        trabajador: '',
        horasTrabajadas: '',
        pagoPorHoraotal: '',
        totalPago: '',
        usuarioCreacionModificacion: '',
    });

    // Función para manejar cambios en los inputs del formulario
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));

        // Calculate total pago
        if (name === "horasTrabajadas" || name === "pagoPorHora") {
            const horasTrabajadasValue = name === "horasTrabajadas" ? parseFloat(value) : formData.horasTrabajadas;
            const pagoPorHoraValue = name === "pagoPorHora" ? parseFloat(value) : formData.pagoPorHora;

            // verificar que los valores sean numéricos
            if (!isNaN(horasTrabajadasValue as number) && !isNaN(pagoPorHoraValue as number)) {
                const pagoTotal = (horasTrabajadasValue as number) * (pagoPorHoraValue as number);
                formData.totalPago = pagoTotal.toString();
            } else {

                formData.totalPago = "";
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
                    const fincasResponse = await ObtenerFincas();
                    //Se filtran las fincas del usuario
                    const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaString));
                    setFincas(fincasFiltradas);

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

        setFormData({
            idFinca: idFinca,
            idRegistroManoObra: idRegistroManoObra,
            actividad: actividad,
            fecha: fechaString,
            trabajador: trabajador,
            identificacion: identificacion, 
            horasTrabajadas: horasTrabajadas,
            pagoPorHora: pagoPorHora,
            totalPago: totalPago,
        });

    }, [idRegistroManoObra]);

    // Función para manejar el envío del formulario con validación
    const handleSubmitConValidacion = () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};

        if (!formData.idFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        if (!formData.actividad || formData.actividad === "") {
            newErrors.actividad = 'La actividad es obligatoria';
        } else {
            newErrors.actividad = '';
        }
        if (!formData.identificacion.trim()) {
            newErrors.identificacion = 'La identificacion es obligatoria';
        } else {
            newErrors.identificacion = '';
        }


        if (!formData.fecha || formData.fecha === "") {
            newErrors.fecha = 'La fecha generacion es obligatoria';
        }

        if (!formData.horasTrabajadas) {
            newErrors.horasTrabajadas = 'Las horas trabajadas es obligatoria';
        }else if (parseFloat(formData.horasTrabajadas) <= 0) {
            newErrors.horasTrabajadas = 'Las horas trabajadas deben ser mayor a 0';
        } else {
            newErrors.horasTrabajadas = '';
        }

        if (!formData.trabajador || formData.trabajador === "") {
            newErrors.trabajador = 'El trabajador son obligatorios';
        } else if (formData.trabajador.length > 200) {
            newErrors.trabajador = 'El trabajador no puede ser más de 200 carateres';
        } else {
            newErrors.trabajador = '';
        }

        if (!formData.pagoPorHora || formData.pagoPorHora === "") {
            newErrors.pagoPorHora = 'El pago por hora es obligatorio';
        }else if (parseFloat(formData.pagoPorHora) <= 0) {
            newErrors.pagoPorHora = 'El pago por hora debe ser mayor a 0';
        } else {
            newErrors.pagoPorHora = '';
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

            const resultado = await ModificarRegistroManoObra(formData);

            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Mano de obra Actualizada! ',
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
                <h2>Mano de obra</h2>
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
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="actividad" sm={4} className="input-label">Actividad</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="actividad"
                                    name="actividad"
                                    value={formData.actividad}
                                    onChange={handleInputChange}
                                    className={errors.actividad ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Actividad"
                                />
                                <FormFeedback>{errors.actividad}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>

                </div>
                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>
                    <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                        <FormGroup row>
                            <Label for="identificacion" sm={4} className="input-label">Identificación</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="identificacion"
                                    name="identificacion"
                                    value={formData.identificacion}
                                    onChange={handleInputChange}
                                    className={errors.identificacion ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Identificación"
                                />
                                <FormFeedback>{errors.identificacion}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>
                    <div className="col-sm-4" style={{ width: '50%' }}>
                        <FormGroup row>
                            <Label for="trabajador" sm={4} className="input-label">Trabajador</Label>
                            <Col sm={8}>
                                <Input
                                    type="text"
                                    id="trabajador"
                                    name="trabajador"
                                    value={formData.trabajador}
                                    onChange={handleInputChange}
                                    className={errors.trabajador ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="Trabajador"
                                />
                                <FormFeedback>{errors.trabajador}</FormFeedback>
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
                            <Label for="horasTrabajadas" sm={4} className="input-label">Horas Trabajadas</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="horasTrabajadas"
                                    name="horasTrabajadas"
                                    value={formData.horasTrabajadas}
                                    onChange={handleInputChange}
                                    className={errors.horasTrabajadas ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.horasTrabajadas}</FormFeedback>
                            </Col>
                        </FormGroup>
                    </div>


                </div>
                <div className="row" style={{ display: "flex", flexDirection: 'row', width: '100%' }}>

                    <div className="col-sm-4" style={{ marginRight: "10px", width: '50%' }}>
                        <FormGroup row>
                            <Label for="pagoPorHora" sm={4} className="input-label">Pago por Hora (₡)</Label>
                            <Col sm={8}>
                                <Input
                                    type="number"
                                    id="pagoPorHora"
                                    name="pagoPorHora"
                                    value={formData.pagoPorHora}
                                    onChange={handleInputChange}
                                    className={errors.pagoPorHora ? 'input-styled input-error' : 'input-styled'}
                                    placeholder="0.0"
                                    maxLength={50}
                                />
                                <FormFeedback>{errors.pagoPorHora}</FormFeedback>
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
                                    value={formData.totalPago}
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

export default EditarManoObra;
