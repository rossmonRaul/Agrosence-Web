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
const MantenimientoUsuariosAsignados = lazy(() => import('./pages/private/MantenimientoUsuariosAsignados/MantenimientoUsuariosAsignados'))
 
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
            </Route>

            {/* Rutas accesibles solo para el rol de Admin */}
            <Route element={<RolGuard rol={Roles.Admin} />}>
              <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
              <Route path={PrivateRoutes.ASIGNAREMPRESA} element={<AsignarEmpresa />} />
              <Route path={PrivateRoutes.MATENIMIENTOUSUARIOSASIGNADOS} element={<MantenimientoUsuariosAsignados />} />
            </Route>
          </RoutesWithNotFound>
        </BrowserRouter>
      </Provider>
    </Suspense>
  );
}

export default App;

