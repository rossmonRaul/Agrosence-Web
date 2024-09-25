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
            <div style={{ display: 'flex', flexDirection: 'row', width: '96.5%',justifyContent: 'center', marginLeft: '9px',marginRight: '0', gap: '0'  }}>     
            <div style={{ flex: 1 }}>           
                <FormGroup style={{display:'flex', alignItems:'center',justifyContent:'space-between'}}>
                    <Label for="nombre" sm={4} className="input-label">Nombre</Label>
                    <Col sm={8}>
                    <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={errors.nombre ? 'input-styled input-error' : 'input-styled'}
                        placeholder="Nombre de la actividad"
                        maxLength={50}
                        style={{marginTop: '3%',width:'170%'}}
                    />
                    <FormFeedback>{errors.nombre}</FormFeedback>
                    </Col>
                    <div className='botonesN' style={{marginLeft:'25%', width:'25%', marginTop:'1%'}}>

                            <Button onClick={handleSubmit} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Guardar</Button>
                </div>
                </FormGroup>


                </div> 
            </div>
        </div>
    );
};

export default InsertarCatalogoActividades;
