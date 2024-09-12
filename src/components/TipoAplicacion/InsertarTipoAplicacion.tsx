import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ObtenerFincas } from '../../servicios/ServicioFincas.ts';
import { ObtenerParcelas } from '../../servicios/ServicioParcelas.ts';
import { ObtenerTipoFertilizantes } from '../../servicios/ServicioTipoFertilizante.ts';
import { InsertarTipoAplicacion } from '../../servicios/ServicioTipoAplicacion.ts';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../servicios/ServicioUsuario.ts';
import { IoSave } from 'react-icons/io5';

interface InsertarTipoAplicacionProps {
    onAdd: () => void;
}


interface Option {

    nombre: string;
    idParcela: number;

}

const InsertarManejoFertilizante: React.FC<InsertarTipoAplicacionProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({

        nombre: '',
        usuarioAuditoria: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [tiposFertilizantes, setTiposFertilizantes] = useState<string[]>([]);
    const [TipoAplicacion, setTipoAplicacion] = useState<string[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const idEmpresaString = localStorage.getItem('empresaUsuario');
                const identificacionString = localStorage.getItem('identificacionUsuario');
                if (identificacionString && idEmpresaString) {
                    const identificacion = identificacionString;

                    const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion({ identificacion: identificacion });

                    // Obtener tipos de fertilizantes
                    const tiposFertilizantesResponse = await ObtenerTipoFertilizantes();
                    setTiposFertilizantes(tiposFertilizantesResponse.map((fertilizante: any) => fertilizante.nombre));



                } else {
                    console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
                }
            } catch (error) {
                console.error('Error al obtener las fincas del usuario:', error);
            }
        };
        obtenerDatosUsuario();
    }, []);






    const handleSubmit = async () => {
        // Realizar validación de campos antes de enviar el formulario
        const newErrors: Record<string, string> = {};







        if (!formData.nombre.trim()) {
            newErrors.nombre = 'Las acciones adicionales son requeridas';
        } else if (formData.nombre.length > 200) {
            newErrors.nombre = 'Las acciones adicionales no pueden tener más de 200 caracteres';
        } else {
            newErrors.nombre = '';
        }


        
        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
 
                const idUsuario = localStorage.getItem('identificacionUsuario');

                if (idUsuario !== null) {
                    formData.usuarioAuditoria = idUsuario;
                } else {
                    console.error('El valor de identificacionUsuario en localStorage es nulo.');
                }

                const resultado = await InsertarTipoAplicacion(formData);
                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Manejo de fertilizante insertado!',
                        text: 'Se ha insertado el manejo de fertilizante con éxito.'
                    });
                    if (onAdd) {
                        onAdd();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar el manejo de fertilizante',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar el manejo de fertilizante:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar el manejo de fertilizante',
                    text: 'Ocurrió un error al intentar insertar el manejo de fertilizante. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0' }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0rem' }}>
                <div style={{ flex: 1 }}>
                    <FormGroup row>
                        <Label for="nombre" sm={4} className="input-label">Nombre</Label>
                        <Col sm={8}>
                            <Input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                className="input-styled"
                                placeholder="Acciones adicionales"
                                maxLength={200}
                                style={{marginTop: '3%'}}
                            />
                            <FormFeedback>{errors.nombre}</FormFeedback>
                        </Col>
                    </FormGroup>
                </div>
            </div>
            
            <div className='botonesN'>
                <Button onClick={handleSubmit} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Guardar</Button>
            </div>
        </div >
    );


};

export default InsertarManejoFertilizante;
