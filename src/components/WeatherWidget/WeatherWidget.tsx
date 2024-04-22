// import React from 'react';

// const WeatherWidget = () => {
//   return (
//     <div>
//       <h1>Pronóstico del Tiempo</h1>
//       <a className="weatherwidget-io" href="https://forecast7.com/es/9d78n83d84/orosi/" data-label_1="CARTAGO PROVINCE" data-label_2="Clima" data-theme="original" >CARTAGO PROVINCE Clima</a>
//       <script>
//         {`
//           !function(d,s,id){
//             var js,fjs=d.getElementsByTagName(s)[0];
//             if(!d.getElementById(id)){
//               js=d.createElement(s);
//               js.id=id;
//               js.src='https://weatherwidget.io/js/widget.min.js';
//               fjs.parentNode.insertBefore(js,fjs);
//             }
//           }(document,'script','weatherwidget-io-js');
//         `}
//       </script>
      
//     </div>
//   );
// }

// export default WeatherWidget;

import { LoadingButton } from "@mui/lab";
import { Box, Container, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ObtenerFincasUbicacionPorIdEmpresa } from "../../servicios/ServicioUsuario";
import { FormGroup, Label, Input, Col, FormFeedback, Button } from 'reactstrap';

const API_WEATHER = `http://api.weatherapi.com/v1/current.json?key=19d59db408fe401f928191944240504&lang=es&q=`;


interface Option {
  idFinca: number;
  nombre: string;
  ubicacion: string;
}

const WeatherWidget = () => {
  const [city, setCity] = useState("");
  const [error, setError] = useState({
    error: false,
    message: "",
  });

  const [fincas, setFincas] = useState<Option[]>([]);
  const [selectedFinca, setSelectedFinca] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  const [weather, setWeather] = useState({
    city: "",
    country: "",
    temperature: 0,
    condition: "",
    conditionText: "",
    icon: "",
  });

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
        try {
            const idEmpresaString = localStorage.getItem('empresaUsuario');
            const identificacionString = localStorage.getItem('identificacionUsuario');
            if (identificacionString && idEmpresaString) {

                const fincasResponse = await ObtenerFincasUbicacionPorIdEmpresa({IdEmpresa:idEmpresaString});
                setFincas(fincasResponse);
            } else {
                console.error('La identificación y/o el ID de la empresa no están disponibles en el localStorage.');
            }
        } catch (error) {
            console.error('Error al obtener las fincas del usuario:', error);
        }
    };
    obtenerDatosUsuario();
}, []);

 

  function quitarTildes(texto:any) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const handleFincaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFinca(value);
    const ubicacion = quitarTildes(e.target.value);
    setError({ error: false, message: "" });
    setLoading(true);
    

    try {

      const res = await fetch(API_WEATHER + ubicacion + ' CR');
      const data = await res.json();

      if (data.error) {
        throw { message: data.error.message };
      }


      setWeather({
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        condition: data.current.condition.code,
        conditionText: data.current.condition.text,
        icon: data.current.condition.icon,
      });
    } catch (error:any) {
      setError({ error: true, message: error.message });
      setWeather({
        city: "",
        country: "",
        temperature: 0,
        condition: "",
        conditionText: "",
        icon: "",
      });
    } finally {
      setLoading(false);
    }
};



  return (
    <Container
      maxWidth="xs"
      sx={{ mt: 2 }}
    >
      <Typography
        variant="h3"
        component="h3"
        align="left"
        gutterBottom
        style={{ fontSize: 'xx-large' }}>
        Pronóstico Meteorológico
      </Typography>

      <label htmlFor="fincas">Finca:</label>
                    <select className="custom-select" id="fincas" value={selectedFinca} onChange={handleFincaChange}>
                        <option key="default-finca" value="">Seleccione...</option>
                        {fincas.map((finca) => (
                            <option key={`${finca.idFinca}-${finca.nombre || 'undefined'}`} value={finca.ubicacion}>{finca.nombre || 'Undefined'}</option>
                        ))}
                    </select>
                    {errors.finca && <FormFeedback>{errors.finca}</FormFeedback>}

     
      {weather.city && (
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h2"
          >
            {weather.city}, {weather.country}
          </Typography>
          <Box
            component="img"
            alt={weather.conditionText}
            src={weather.icon}
            sx={{ margin: "0 auto" }}
          />
          <Typography
            variant="h5"
            component="h3"
          >
            {weather.temperature} °C
          </Typography>
          <Typography
            variant="h6"
            component="h4"
          >
            {weather.conditionText}
          </Typography>
        </Box>
      )}

      <Typography
        textAlign="center"
        sx={{ mt: 2, fontSize: "10px" }}
      >
        Powered by:{" "}
        <a
          href="https://www.weatherapi.com/"
          title="Weather API"
        >
          WeatherAPI.com
        </a>
      </Typography>
    </Container>
  );
}

export default WeatherWidget;