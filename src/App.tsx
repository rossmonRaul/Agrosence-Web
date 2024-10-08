import './App.css'
import { BrowserRouter, Navigate, Route } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes } from './models/routes';
import { AuthGuard, RolGuard } from './guards';
import { RoutesWithNotFound } from './utilities';
import { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import Store from './redux/Store';
import { Roles } from './models';
import { Dashboard } from './pages/private';
import { Spinner } from 'reactstrap';


// Importar componentes con lazy loading
const Login = lazy(() => import('./pages/LoginPage'));
const Private = lazy(() => import('./pages/private/Private'));
const AdministacionAdministradores = lazy(() => import('./pages/private/CrearUsuarioSA/CrearUsuarioSA'))
const AsignarEmpresa = lazy(() => import('./pages/private/AsignarUsuarios/AsignarUsuarios'))
const AdministrarEmpresas = lazy(() => import('./pages/private/AdministrarEmpresas/AdministrarEmpresas'))
const AdministrarFincas = lazy(() => import('./pages/private/AdministrarFincas/AdministrarFincas'))
const AdministrarParcelas = lazy(() => import('./pages/private/AdministrarParcelas/AdministrarParcelas'))
const MantenimientoUsuariosAsignados = lazy(() => import('./pages/private/MantenimientoUsuariosAsignados/MantenimientoUsuariosAsignados'))
const ManejodeFertilizantes = lazy(() => import('./pages/private/ManejodeFertilizantes/ManejodeFertilizantes'))
const MedicionesdeSuelos = lazy(() => import('./pages/private/CalidadSuelo/CalidadSuelo'))
const PreparacionTerreno = lazy(() => import('./pages/private/PreparacionTerreno/PreparacionTerreno'))
const AdministrarRotacionCultivosEstacion = lazy(() => import('./pages/private/RotacionCultivosEstacion/RotacionCultivosEstacion'))
const ProduccionCultivos = lazy(() => import('./pages/private/RegistroProductividadCultivo/RegistroProductividadCultivo'))
const RegistroSeguimientoUsoAgua = lazy(() => import('./pages/private/RegistroSeguimientoUsoAgua/RegistroSeguimientoUsoAgua'))
const Conductividadelectrica = lazy(() => import('./pages/private/ConductividadElectrica/ConductividadElectrica'))
const ManejoResiduos = lazy(() => import('./pages/private/ManejoResiduos/ManejoResiduos'))
const EficienciaRiego = lazy(() => import('./pages/private/EficienciaRiego/EficienciaRiego'))
const PronosticoMeteorologico = lazy(() => import('./pages/private/PronosticoMeteorologico/PronosticoMeteorologico'))
//import CondicionesMeteorologicasClimaticas from './pages/private/RegistroCondicionesMetereologicas/RegistroCondicionesMetereologicas';
const CondicionesMeteorologicasClimaticas = lazy(() => import('./pages/private/RegistroCondicionesMetereologicas/RegistroCondicionesMetereologicas'))

//TipoAplicacion
const TipoAplicacion = lazy(() => import('./pages/private/TipoAplicacion/TipoAplicacion'))

const RiesgosNaturales = lazy(() => import('./pages/private/RiesgoNatural/RiesgoNatural'))
const ProblemasPlagas = lazy(() => import('./pages/private/ProblemasPlagas/ProblemasPlagas'))
const MedicionesSensor = lazy(() => import('./pages/private/MedicionesSensor/MedicionesSensor'))
const PuntoMedicion = lazy(() => import('./pages/private/PuntoMedicion/PuntoMedicion'))
const RegistroSensores = lazy(() => import('./pages/private/RegistroSensores/RegistroSensores'));
const OrdenCompra = lazy(() => import('./pages/private/OrdenCompra/OrdenCompra'));
const EntradasYSalidas = lazy(() => import('./pages/private/EntradasYSalidas/EntradasYSalidas'));
const ReporteEntradasYSalidas = lazy(() => import('./pages/private/ReporteEntradasySalidas/ReporteEntradasySalidas'));
const ReporteEntradas = lazy(() => import('./pages/private/ReporteEntradas/ReporteEntradas'));
const ReporteSalidas = lazy(() => import('./pages/private/ReporteSalidas/ReporteSalidas'));
const ReportePlanilla = lazy(() => import('./pages/private/ReportePlanilla/ReportePlanilla'));
const ReporteOrdenDeCompra = lazy(() => import('./pages/private/ReporteOrdenDeCompra/ReporteOrdenDeCompra'));
const ReporteMedicionesSensor = lazy(() => import('./pages/private/ReporteMedicionesSensor/ReporteMedicionesSensor'));
const ReporteSensores = lazy(() => import('./pages/private/ReporteSensores/ReporteSensores'));
const ManoObra = lazy(() => import('./pages/private/ManoObra/ManoObra'));
const ContenidoDeClorofila = lazy(() => import('./pages/private/ContenidoDeClorofila/ContenidoDeClorofila'))
const SaludPlanta = lazy(() => import('./pages/private/SaludPlanta/SaludPlanta'))
const CantidadDePlantas = lazy(() => import('./pages/private/CantidadDePlantas/CantidadDePlantas'))
const ContenidoDeAgua = lazy(() => import('./pages/private/ContenidoDeAgua/ContenidoDeAgua'))
const CoberturaVegetal = lazy(() => import('./pages/private/CoberturaVegetal/CoberturaVegetal'))
const ContenidoDeNitrogeno = lazy(() => import('./pages/private/ContenidoDeNitrogeno/ContenidoDeNitrogeno'))
const CatalogoActividadesPT = lazy(() => import('./pages/private/CatalogoActividadesPT/CatalogoActividadesPT'))
const MedidasCultivos = lazy(() => import('./pages/private/MedidasCultivos/MedidasCultivos'))
const Cultivos = lazy(() => import('./pages/private/Cultivos/Cultivos'))

function App() {
  return (
    // Suspense para manejar la carga de componentes lazy
    <Suspense fallback={<Spinner color="success">Cargando...</Spinner>}>
      {/* Proveedor del store de Redux */}
      <Provider store={Store}>
        {/* Enrutador principal */}
        <BrowserRouter>
          {/* Rutas con NotFound handling */}
          <RoutesWithNotFound>
            {/* Ruta por defecto redirige a la ruta privada */}
            <Route path="/" element={<Navigate to={PrivateRoutes.PRIVATE} />} />
            {/* Ruta pública para el inicio de sesión */}
            <Route path={PublicRoutes.LOGIN} element={<Login />} />

            {/* Ruta con guardia de autenticación */}
            <Route element={<AuthGuard privateValidation={true} />}>
              {/* Rutas privada */}
              <Route path={`${PrivateRoutes.PRIVATE}/*`} element={<Private />} />
            </Route>

            {/* Rutas accesibles solo para el rol de SuperAdmin */}
            <Route element={<RolGuard rol={Roles.SuperAdmin} />}>
              <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
              {/* donde se crean los administradores */}
              <Route path={PrivateRoutes.CREARUSUARIOSA} element={<AdministacionAdministradores />} />
              <Route path={PrivateRoutes.ADMINISTRAREMPRESAS} element={<AdministrarEmpresas />} />
              <Route path={PrivateRoutes.MEDICIONESSENSOR} element={<MedicionesSensor />} />
              <Route path={PrivateRoutes.MEDIDASCULTIVOS} element={<MedidasCultivos />} />
            </Route>

            {/* Rutas accesibles solo para el rol de Admin */}
            <Route element={<RolGuard rol={Roles.Admin} />}>
              <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
              <Route path={PrivateRoutes.ASIGNAREMPRESA} element={<AsignarEmpresa />} />
              <Route path={PrivateRoutes.MATENIMIENTOUSUARIOSASIGNADOS} element={<MantenimientoUsuariosAsignados />} />
              <Route path={PrivateRoutes.ADMINISTRARFINCAS} element={<AdministrarFincas />} />
              <Route path={PrivateRoutes.ADMINISTRARPARCELAS} element={<AdministrarParcelas />} />
              <Route path={PrivateRoutes.PUNTOMEDICION} element={<PuntoMedicion />} />
              <Route path={PrivateRoutes.SENSORES} element={<RegistroSensores />} />
              <Route path={PrivateRoutes.MANOOBRA} element={<ManoObra />} />
              <Route path={PrivateRoutes.ORDENCOMPRA} element={<OrdenCompra />} />
              <Route path={PrivateRoutes.ENTRADAYSALIDA} element={<EntradasYSalidas />} />
              <Route path={PrivateRoutes.REPORTEENTRADASYSALIDAS} element={<ReporteEntradasYSalidas />} />
              <Route path={PrivateRoutes.REPORTEENTRADAS} element={<ReporteEntradas />} />
              <Route path={PrivateRoutes.REPORTESALIDAS} element={<ReporteSalidas />} />
              <Route path={PrivateRoutes.REPORTEPLANILLA} element={<ReportePlanilla/>} />
              <Route path={PrivateRoutes.REPORTEORDENCOMPRA} element={<ReporteOrdenDeCompra/>} />
              <Route path={PrivateRoutes.REPORTEMEDICIONESSENSOR} element={<ReporteMedicionesSensor/>} />
              <Route path={PrivateRoutes.REPORTESENSORES} element={<ReporteSensores />} />
              <Route path={PrivateRoutes.CATALOGOACTIVIDADESPT} element={<CatalogoActividadesPT/>}/>
              <Route path={PrivateRoutes.CULTIVOS} element={<Cultivos/>} />
            </Route>
            {/* Rutas accesibles solo para el rol de usuario asignado */}
            <Route element={<RolGuard rol={Roles.UsuarioAsignado} />}>
              <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
              <Route path={PrivateRoutes.MANEJODEFERTILIZANTES} element={<ManejodeFertilizantes />} />
              <Route path={PrivateRoutes.MEDICIONESDESUELOS} element={<MedicionesdeSuelos />} />
              <Route path={PrivateRoutes.PREPARACIONTERRENOS} element={<PreparacionTerreno />} />
              <Route path={PrivateRoutes.ROTACIONESCULTIVOSESTACION} element={<AdministrarRotacionCultivosEstacion />} />
              <Route path={PrivateRoutes.RESIDUOS} element={<ManejoResiduos />} />
              <Route path={PrivateRoutes.RIEGOS} element={<EficienciaRiego />} />
              <Route path={PrivateRoutes.CONDUCTIVIDADELECTRICA} element={<Conductividadelectrica />} />
              <Route path={PrivateRoutes.PRODUCCIONCULTIVOS} element={<ProduccionCultivos />} />
              <Route path={PrivateRoutes.REGISTROSEGUIMIENTOUSOAGUA} element={<RegistroSeguimientoUsoAgua />} />
              <Route path={PrivateRoutes.RIESGOSNATURALES} element={<RiesgosNaturales />} />
              <Route path={PrivateRoutes.PROBLEMASPLAGAS} element={<ProblemasPlagas />} />
              <Route path={PrivateRoutes.TIPOAPLICACION} element={<TipoAplicacion />} />
              <Route path={PrivateRoutes.PRONOSTICOMETEOROLOGICO} element={<PronosticoMeteorologico />} />
              <Route path={PrivateRoutes.CONDICIONESMETEOROLOGICASCLIMATICAS} element={<CondicionesMeteorologicasClimaticas />} />
              <Route path={PrivateRoutes.CONTENIDODECLOROFILA} element={<ContenidoDeClorofila/>} />
              <Route path={PrivateRoutes.SALUDPLANTA} element={<SaludPlanta/>} />
              <Route path={PrivateRoutes.CANTIDADDEPLANTAS} element={<CantidadDePlantas/>} />
              <Route path={PrivateRoutes.CONTENIDODEAGUA} element={<ContenidoDeAgua/>} />
              <Route path={PrivateRoutes.COBERTURAVEGETAL} element={<CoberturaVegetal/>} />
              <Route path={PrivateRoutes.CONTENIDODENITROGENO} element={<ContenidoDeNitrogeno/>}/>
              <Route path={PrivateRoutes.CATALOGOACTIVIDADESPT} element={<CatalogoActividadesPT/>}/>
            </Route>
          </RoutesWithNotFound>
        </BrowserRouter>
      </Provider>
    </Suspense>
  );
}

export default App;

