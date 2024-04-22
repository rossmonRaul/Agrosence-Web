import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import TableResponsive from "../../../components/table/table.tsx";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { CambiarEstadoParcelas, ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import EditarParcela from "../../../components/parcela/EditarParcela.tsx";
import CrearParcela from "../../../components/parcela/CrearParcela.tsx";
import Swal from "sweetalert2";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";

function AdministrarParcelas() {
    const [filtroNombre, setFiltroNombre] = useState('');
    const [modalEditar, setModalEditar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState({
        idParcela: '',
        idFinca: '',
        nombre: ''
    });
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<string>('');
    const [fincas, setFincas] = useState<any[]>([]);

    // Función para manejar cambios en la selección de finca
    const handleFincaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedFinca(value);
    };

    // Obtener las fincas al cargar la página
    useEffect(() => {
        const obtenerFincas = async () => {
            try {
                const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
                if (idEmpresaUsuario) {
                    const fincasResponse = await ObtenerFincas(); // Suponiendo que ObtenerFincas devuelve las fincas de una empresa específica
                    const fincasFiltradas = fincasResponse.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));
                    setFincas(fincasFiltradas);
                }
            } catch (error) {
                console.error('Error al obtener las fincas:', error);
            }
        };
        obtenerFincas();
    }, []);


    const handleChangeFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFiltroNombre(value);
    };

    // Obtener parcelas cuando cambie la finca seleccionada
    useEffect(() => {
        obtenerParcelas();
    }, [selectedFinca]);

    // Filtrar parcelas cuando cambien la finca seleccionada, las parcelas o el filtro por nombre
    useEffect(() => {
        filtrarParcelas();
    }, [selectedFinca, parcelas, filtroNombre]);

    // Función para filtrar las parcelas
    const filtrarParcelas = () => {
        let parcelasFiltradasPorFinca = selectedFinca
            ? parcelas.filter(parcela => parcela.idFinca === parseInt(selectedFinca))
            : parcelas

        // Filtrar por nombre si hay un filtro aplicado
        if (filtroNombre.trim() !== '') {
            parcelasFiltradasPorFinca = parcelasFiltradasPorFinca.filter(parcela =>
                parcela.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
            );
        }
        setParcelasFiltradas(parcelasFiltradasPorFinca);
    };

    // Obtener las parcelas
    const obtenerParcelas = async () => {
        try {
            const idEmpresaUsuario = localStorage.getItem('empresaUsuario');
            if (idEmpresaUsuario) {

                const fincas = await ObtenerFincas();
                const fincasEmpresaUsuario = fincas.filter((finca: any) => finca.idEmpresa === parseInt(idEmpresaUsuario));

                const parcelasResponse = await ObtenerParcelas();

                const parcelasFincasEmpresaUsuario: any[] = [];

                fincasEmpresaUsuario.forEach((finca: any) => {
                    const parcelasFinca = parcelasResponse.filter((parcela: any) => parcela.idFinca === finca.idFinca);
                    parcelasFincasEmpresaUsuario.push(...parcelasFinca);
                });

                //ajustar para fertilizantes
                const parcelasConEstado = parcelasFincasEmpresaUsuario.map((parcela: any) => ({
                    ...parcela,
                    sEstado: parcela.estado === 1 ? 'Activo' : 'Inactivo'
                }));
                setParcelas(parcelasConEstado);
                setParcelasFiltradas(parcelasConEstado);
            }
        } catch (error) {
            console.error('Error al obtener las parcelas:', error);
        }
    };

    // Abrir/cerrar modal de inserción
    const abrirCerrarModalInsertar = () => {
        setModalInsertar(!modalInsertar);
    };

    // Abrir/cerrar modal de edición
    const abrirCerrarModalEditar = () => {
        setModalEditar(!modalEditar);
    };

    // Abrir modal de edición
    const openModal = (parcela: any) => {
        setSelectedParcela(parcela);
        abrirCerrarModalEditar();
    };

    // Cambiar estado de la parcela
    const toggleStatus = async (parcela: any) => {
        Swal.fire({
            title: "Cambiar Estado",
            text: "¿Estás seguro de que deseas actualizar el estado de la finca: " + parcela.nombre + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const datos = {
                        idParcela: parcela.idParcela,
                        nombre: parcela.nombre
                    };
                    const resultado = await CambiarEstadoParcelas(datos);
                    if (parseInt(resultado.indicador) === 1) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Estado Actualizado! ',
                            text: 'Actualización exitosa.',
                        });
                        await obtenerParcelas();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al actualizar el estado.',
                            text: resultado.mensaje,
                        });
                    };
                } catch (error) {
                    Swal.fire("Error al actualizar el estado de la parcela", "", "error");
                }
            }
        });
    };

    // Manejar la edición de parcela
    const handleEditarParcela = async () => {
        await obtenerParcelas();
        abrirCerrarModalEditar();
    };

    // Manejar la inserción de parcela
    const handleAgregarParcela = async () => {
        await obtenerParcelas();
        abrirCerrarModalInsertar();
    };

    // Configuración de columnas para la tabla
    const columns = [
        { key: 'nombre', header: 'Nombre Parcela' },
        { key: 'sEstado', header: 'Estado' },
        { key: 'acciones', header: 'Acciones', actions: true }
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Administrar Parcelas" />
                <div className="content col-md-12" >
                    <button onClick={() => abrirCerrarModalInsertar()} className="btn-crear">Crear Parcela</button>
                    <div className="filtro-container" style={{ width: '300px' }}>
                        <select value={selectedFinca || ''} onChange={handleFincaChange} className="custom-select">
                            <option value={''}>Todas las fincas</option>
                            {fincas.map(finca => (
                                <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container">
                        <label htmlFor="filtroNombre">Filtrar por nombre:</label>
                        <input
                            type="text"
                            id="filtroNombre"
                            value={filtroNombre}
                            onChange={handleChangeFiltro}
                            placeholder="Ingrese el nombre"
                            className="form-control"
                        />
                    </div>
                    <TableResponsive columns={columns} data={parcelasFiltradas} openModal={openModal} btnActionName={"Editar"} toggleStatus={toggleStatus} />
                </div>
            </div>

            <Modal
                isOpen={modalInsertar}
                toggle={abrirCerrarModalInsertar}
                title="Insertar Parcela"
                onCancel={abrirCerrarModalInsertar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <CrearParcela
                            onAdd={handleAgregarParcela}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalEditar}
                toggle={abrirCerrarModalEditar}
                title="Editar Parcela"
                onCancel={abrirCerrarModalEditar}
            >
                <div className='form-container'>
                    <div className='form-group'>
                        <EditarParcela
                            nombreEditar={selectedParcela.nombre}
                            idParcela={selectedParcela.idParcela}
                            onEdit={handleEditarParcela}
                        />
                    </div>
                </div>
            </Modal>
        </Sidebar>
    );
}

export default AdministrarParcelas;