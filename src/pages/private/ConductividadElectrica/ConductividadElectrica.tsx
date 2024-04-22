import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import { ObtenerFincas } from "../../../servicios/ServicioFincas.ts";
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../servicios/ServicioUsuario.ts';
import '../../../css/FormSeleccionEmpresa.css'
import { ObtenerParcelas } from "../../../servicios/ServicioParcelas.ts";
import TableResponsiveColours from "../../../components/table/tableColors.tsx";
import { ObtenerConductividadElectricaEstresHidrico } from "../../../servicios/ServicioConductividad.ts";

function AdministrarConductividadRiego() {
    
    const [selectedParcela, setSelectedParcela] = useState<number | null>(null);
    const [parcelas, setParcelas] = useState<any[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<any[]>([]);
    const [datosConductividadFiltrados, setdatosConductividadFiltrados] = useState<any[]>([]);
    const [selectedFinca, setSelectedFinca] = useState<number | null>(null);
    const [fincas, setFincas] = useState<any[]>([]);

    const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);

        setSelectedFinca(value);
        setSelectedParcela(null);
    };
 
    const handleParcelaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedParcela(parseInt(value));
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
                    //se obtiene las fincas 
                    const fincasResponse = await ObtenerFincas();
                    //se filtran las fincas con las fincas del usuario
                    const fincasUsuario = fincasResponse.filter((finca: any) => idFincasUsuario.includes(finca.idFinca));
                    setFincas(fincasUsuario);
                    //se obtienen las parcelas
                    const parcelasResponse = await ObtenerParcelas();
                    //se filtran las parcelas con los idparcelasusuario
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
    }, []);


    useEffect(() => {
        const obtenerParcelasDeFinca = async () => {
            try {
                const parcelasFinca = parcelas.filter(parcela => parcela.idFinca === selectedFinca);
            //se asigna las parcelas de la IdFinca que se selecciona y se pone en parcelasfiltradas
            setParcelasFiltradas(parcelasFinca);

            } catch (error) {
                console.error('Error al obtener las parcelas de la finca:', error);
            }
        };
        obtenerParcelasDeFinca();
    }, [selectedFinca]);
    

    const obtenerInfo = async () => {
        try {
            const datosConductividad = await ObtenerConductividadElectricaEstresHidrico();

                const datosConductividadSeleccionados = datosConductividad.map((dato: any) => {
                    let color = '';
                    let nivel = '';
                    
                    if (dato.medidaHumedadSuelo <= 20) {
                        color = 'red';
                        nivel = 'Alto Estrés por Sequía'
                    } else if (dato.medidaHumedadSuelo >= 20.1 && dato.medidaHumedadSuelo <= 30 ) {
                        color = 'orange';
                        nivel = 'Medio Estrés por Sequía'
                    } else if (dato.medidaHumedadSuelo >= 30.1 && dato.medidaHumedadSuelo <= 50 ) {
                        color = 'green';
                        nivel = 'Bajo Estrés por Sequía'
                    }

                    if (dato.medidaHumedadSuelo >= 90.1) {
                        color = 'red';
                        nivel = 'Alto Estrés por Humedad'
                    } else if (dato.medidaHumedadSuelo >= 80.1 && dato.medidaHumedadSuelo <= 90) {
                        color = 'orange';
                        nivel = 'Medio Estrés por Humedad'
                    } else if (dato.medidaHumedadSuelo >= 75 && dato.medidaHumedadSuelo <= 80) {
                        color = 'green';
                        nivel = 'Bajo Estrés por Humedad'
                    }
                    return {
                        ...dato,
                        color: color,
                        sNivelEstres: nivel
                    };
                });
            
            
            // Filtrar los datos para mostrar solo los correspondientes a la finca y parcela seleccionadas
            const datosFiltrados = datosConductividadSeleccionados.filter((dato: any) => {
                //aca se hace el filtro y hasta que elija la parcela funciona
                return dato.idFinca === selectedFinca && dato.idParcela === selectedParcela;
            });
           
            
            setdatosConductividadFiltrados(datosFiltrados);
        } catch (error) {
            console.error('Error al obtener los datos de conductividad:', error);
        }
    };

    //esto carga la tabla al momento de hacer cambios en el filtro
    //carga los datos de la tabla al momento de cambiar los datos de selected parcela
    //cada vez que selected parcela cambie de datos este use effect obtiene datos
    useEffect(()=> {
        obtenerInfo();
    },[selectedParcela]);

    

    const columns2 = [
        { key: 'codigo', header: 'Punto de Medición' },
        { key: 'nombreFinca', header: 'Finca' },
        { key: 'nombreParcela', header: 'Parcela' },
        { key: 'medidaHumedadSuelo', header: 'Humedad en el Suelo (%)' },
        { key: 'sNivelEstres', header: 'Nivel de Estrés Hídrico' },
    ];

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Estrés Hídrico" />
                <div className="content col-md-12">
                    <div className="filtro-container" style={{ width: '300px' }}>
                        <select value={selectedFinca || ''} onChange={handleFincaChange} className="custom-select">
                            <option value="">Seleccione la finca...</option>
                            {fincas.map(finca => (
                                <option key={finca.idFinca} value={finca.idFinca}>{finca.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-container" style={{ width: '300px' }}>
                        <select value={selectedParcela ? selectedParcela : ''} onChange={handleParcelaChange} className="custom-select">
                            <option value="">Seleccione la parcela...</option>
                            {parcelasFiltradas.map(parcela => (
                                <option key={parcela.idParcela} value={parcela.idParcela}>{parcela.nombre}</option>
                            ))}
                        </select>
                    </div>
                    
                    <TableResponsiveColours columns={columns2} data={datosConductividadFiltrados}  />
                </div>
            </div>

           

            
        </Sidebar>
    );
}

export default AdministrarConductividadRiego;
