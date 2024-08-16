import Sidebar from "../../../components/sidebar/Sidebar";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior.tsx";
import Topbar from "../../../components/topbar/Topbar.tsx";
import '../../../css/FormSeleccionEmpresa.css'
import WeatherWidget from "../../../components/WeatherWidget/WeatherWidget.tsx";

function PronosticoMeteorologico() {

    return (
        <Sidebar>
            <div className="main-container">
                <Topbar />
                <BordeSuperior text="Pronóstico Meteorológico" />
                <div className="content, col-md-12" >
                <WeatherWidget />
                {/* <br />
                    <iframe src="https://openweathermap.org/weathermap?basemap=map&cities=true&layer=precipitation&lat=9.8201&lon=-83.8718&zoom=10"
                     width="600" height="400" ></iframe> */}
                </div>
            </div>
        </Sidebar>
    );
}

export default PronosticoMeteorologico;
