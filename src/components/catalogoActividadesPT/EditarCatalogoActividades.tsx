import React, { useState } from 'react';
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';
import Swal from 'sweetalert2';
import { ModificarActividadPreparacionTerreno } from '../../servicios/ServicioCatalogoActividadPT';
import '../../css/CrearCuenta.css';
import { IoSave } from 'react-icons/io5';

interface ActividadSeleccionada {
    idActividad: number;
    nombre: string;
    onEdit: (actividadModificada: any) => void; // Cambiado para recibir el argumento adecuado
    readOnly?: boolean;
}

const EditarCatalogoActividades: React.FC<ActividadSeleccionada> = ({
    idActividad,
    nombre,
    onEdit,
    readOnly = false
}) => {
    const [errors, setErrors] = useState<Record<string, string>>({
        nombre: ''
    });

    const [formData, setFormData] = useState<any>({
        idActividad: idActividad,
        nombre: nombre
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmitConValidacion = () => {
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
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const datos = {
            idActividad: formData.idActividad,
            nombre: formData.nombre,
            usuarioCreacionModificacion: localStorage.getItem('identificacionUsuario') || ''
        };
        try {
            const resultado = await ModificarActividadPreparacionTerreno(datos);
            if (resultado.indicador === 1) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actividad Actualizada!',
                    text: 'La actividad ha sido actualizada con éxito.',
                });
                onEdit(formData); 
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la actividad.',
                    text: resultado.mensaje,
                });
            }
        } catch (error) {
            console.log(error);
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
                        disabled={readOnly}
                        style={{marginTop: '3%',width:'170%'}}
                    />
                    <FormFeedback>{errors.nombre}</FormFeedback>
                    </Col>

                    {!readOnly && (
                    <div className='botonesN' style={{marginLeft:'25%', width:'25%', marginTop:'1%'}}>
                       
                                <Button onClick={handleSubmitConValidacion} className="btn-styled"><IoSave size={20} style={{marginRight: '2%'}}/>Actualizar datos</Button>

                    </div>
                )}
                </FormGroup>

               
            </div>
            </div>
        </div>
    );
};

export default EditarCatalogoActividades;
