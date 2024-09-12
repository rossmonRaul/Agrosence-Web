import React, { useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { InsertarActividadPreparacionTerreno } from '../../servicios/ServicioCatalogoActividadPT';
import { IoSave } from 'react-icons/io5';

interface InsertarCatalogoActividadesProps {
    onAdd: (nuevaActividad: any) => void; // Correcta firma
}

const InsertarCatalogoActividades: React.FC<InsertarCatalogoActividadesProps> = ({ onAdd }) => {
    const [formData, setFormData] = useState({
        nombre: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.length > 50) {
            newErrors.nombre = 'El nombre no puede tener más de 50 caracteres';
        } else {
            newErrors.nombre = '';
        }

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => error === '')) {
            try {
                const nuevaActividad = {
                    ...formData,
                    usuarioCreacionModificacion: localStorage.getItem('identificacionUsuario') || ''
                };
                const resultado = await InsertarActividadPreparacionTerreno(nuevaActividad);

                if (resultado.indicador === 1) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actividad insertada!',
                        text: 'Se ha insertado la actividad con éxito.'
                    });
                    if (onAdd) {
                        onAdd(nuevaActividad);
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al insertar la actividad',
                        text: resultado.message
                    });
                }
            } catch (error) {
                console.error('Error al insertar la actividad:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al insertar la actividad',
                    text: 'Ocurrió un error al intentar insertar la actividad. Por favor, inténtelo de nuevo más tarde.'
                });
            }
        }
    };

    return (
        <div id='general' style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0rem', width: '100%', margin: '0 auto' }}>
            <div className="form-container-fse" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>                
                <FormGroup>
                    <Label for="nombre">Nombre</Label>
                    <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={errors.nombre ? 'input-styled input-error' : 'input-styled'}
                        placeholder="Nombre de la actividad"
                        maxLength={50}
                    />
                    <FormFeedback>{errors.nombre}</FormFeedback>
                </FormGroup>

                <div className='botonesN'>
                    <FormGroup row>
                        <Col sm={{ size: 10, offset: 2 }}>
                            <Button onClick={handleSubmit} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Guardar</Button>
                        </Col>
                    </FormGroup>
                </div>
                
            </div>
        </div>
    );
};

export default InsertarCatalogoActividades;
