import React, { useState, useEffect } from 'react';
import { FormGroup, FormFeedback } from 'reactstrap';
import '../../css/FormSeleccionEmpresa.css'
import { ObtenerParcelas } from '../../servicios/ServicioParcelas';
import { ObtenerFincas } from '../../servicios/ServicioFincas';
import Swal from 'sweetalert2';
import { EditarFincaParsela } from '../../servicios/ServicioUsuario';
import '../../css/CrearCuenta.css'

// Definición de las propiedades que espera recibir el componente
interface Props {
    idEmpresa: number;
    identificacion: string;
    idFinca?: number;
    onEdit: () => void;
    idUsuarioFincasParcelas?: number;
}

// Interfaz para el formato de los datos recibidos de la API
interface Option {
    idEmpresa: number;
    nombre: string;
    idParcela: number;
    idFinca: number;
}

// Componente funcional principal
const AsignarFincaParcela: React.FC<Props> = ({ idEmpresa, onEdit, identificacion, idFinca, idUsuarioFincasParcelas}) => {
     // Estado para almacenar los errores de validación del formulario
    const [errors, setErrors] = useState<Record<string, string>>({ finca: '', parcela: ''});

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<any>({
        idFinca: 0,
        idParcela: 0,
    });

    // Estados para almacenar los datos obtenidos de la API
    const [fincas, setFincas] = useState<Option[]>([]);
    const [parcelas, setParcelas] = useState<Option[]>([]);


    // Estado para almacenar la selección actual de cada select
    const [selectedFinca, setSelectedFinca] = useState<string>(() => idFinca ? idFinca.toString() : '');
    const [selectedParcela, setSelectedParcela] = useState<string>('');

    // Efectos para obtener las fincas y parcelas al cargar el componente
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const fincasResponse = await ObtenerFincas();
                setFincas(fincasResponse);
            } catch (error) {
                console.error('Error al obtener las fincas:', error);
            }
        };
        obtenerFincas();
    }, []);

    useEffect(() => {
        const obtenerParcelas = async () => {
            try {
                const parcelasResponse = await ObtenerParcelas();
                setParcelas(parcelasResponse);
            } catch (error) {
                console.error('Error al obtener las parcelas:', error);
            }
        };
        obtenerParcelas();
    }, []);


    // Filtrar fincas según la empresa seleccionada
    const filteredFincas = fincas.filter(finca => finca.idEmpresa === idEmpresa);

    // Filtrar parcelas según la finca seleccionada
    const filteredParcelas = parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca));


     // Funciónes para manejar el cambio de la selección de finca y parcela
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
        setSelectedParcela('');
    };

    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(value);
    };

    useEffect(() => {
        // Actualizar el formData cuando las props cambien
        setFormData({
            idEmpresa: idEmpresa,
            idFinca: idFinca
        });
    }, [idEmpresa, idFinca]);

    const handleSubmitConValidacion = () => {
        // Validar campos antes de enviar los datos al servidor
        const newErrors: Record<string, string> = {};

        // Validar selección de finca
        if (!selectedFinca) {
            newErrors.finca = 'Debe seleccionar una finca';
        } else {
            newErrors.finca = '';
        }

        // Validar selección de parcela
        if (!selectedParcela) {
            newErrors.parcela = 'Debe seleccionar una parcela';
        } else {
            newErrors.parcela = '';
        }

        // Actualizar los errores
        setErrors(newErrors);

        // Si no hay errores, enviar los datos al servidor
        if (Object.values(newErrors).every(error => error === '')) {
            // Actualizar el estado formData con las selecciones
                formData.finca = selectedFinca,
                formData.parcela = selectedParcela
            // Llamar a la función handleSubmit para enviar los datos al servidor
            handleSubmit();
        }
    };


    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        const datos = {
            idFinca: parseInt(formData.finca),
            idParcela: parseInt(formData.parcela),
            idEmpresa: idEmpresa,
            identificacion: identificacion,
            idUsuario: idUsuarioFincasParcelas
        };
        try {

            const resultado = await EditarFincaParsela(datos);

            if (parseInt(resultado.indicador) === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Asignado con Exito! ',
                    text: 'Usuario actualizado con éxito.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al asignar el usuario.',
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

     // Renderizado del componente
    return (
        <div>
            <div className="form-container-fse">
                
                <FormGroup>
                    <label htmlFor="fincas">Finca:</label>
                    <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange}>
                        <option key="default-finca" value="">Seleccione...</option>
                        {filteredFincas.map((finca) => (
                            <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.idFinca}>{finca.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}
                </FormGroup>

                <FormGroup>
                    <label htmlFor="parcelas">Parcela:</label>
                    <select className="custom-select" id="parcelas" value={selectedParcela} onChange={handleParcelaChange}>
                        <option key="default-parcela" value="">Seleccione...</option>
                        {filteredParcelas.map((parcela) => (
                            <option key={`${parcela.idParcela}-${parcela.nombre || 'undefined'}`} value={parcela.idParcela}>{parcela.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.parcela && <FormFeedback>{errors.parcela}</FormFeedback>}
                </FormGroup>
            </div>
            <button onClick={handleSubmitConValidacion} className="btn-styled">Asignar</button>
        </div>
    );
}

export default AsignarFincaParcela;