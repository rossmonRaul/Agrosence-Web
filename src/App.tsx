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


const Login = lazy(() => import('./pages/LoginPage'));
const Private = lazy(() => import('./pages/private/Private'));
const AdministacionAdministradores = lazy(() => import('./pages/private/CrearUsuarioSA/CrearUsuarioSA'))

function App() {
  return (
    <Suspense fallback={<Spinner color="success">Cargando...</Spinner>}>
      <Provider store={Store}>
    <BrowserRouter>

    <RoutesWithNotFound>
        <Route path="/" element={<Navigate to={PrivateRoutes.PRIVATE} />} />
        <Route path={PublicRoutes.LOGIN} element={<Login />} />
    
        
        
        <Route element={<AuthGuard privateValidation={true} />}>
          <Route path={`${PrivateRoutes.PRIVATE}/*`} element={<Private />} />
        </Route>

        <Route element={<RolGuard rol={Roles.SuperAdmin} />}>
            <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
            <Route path={PrivateRoutes.CREARUSUARIOSA} element={<AdministacionAdministradores />} />
        </Route>
        
      
      </RoutesWithNotFound>
     
    </BrowserRouter>
    </Provider>
    </Suspense>
  );
}

export default App;

