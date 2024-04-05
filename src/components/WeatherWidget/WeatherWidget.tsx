import React from 'react';

const WeatherWidget = () => {
  return (
    <div>
      <h1>Pronóstico del Tiempo</h1>
      <a className="weatherwidget-io" href="https://forecast7.com/es/9d78n83d84/orosi/" data-label_1="CARTAGO PROVINCE" data-label_2="Clima" data-theme="original" >CARTAGO PROVINCE Clima</a>
      <script>
        {`
          !function(d,s,id){
            var js,fjs=d.getElementsByTagName(s)[0];
            if(!d.getElementById(id)){
              js=d.createElement(s);
              js.id=id;
              js.src='https://weatherwidget.io/js/widget.min.js';
              fjs.parentNode.insertBefore(js,fjs);
            }
          }(document,'script','weatherwidget-io-js');
        `}
      </script>
      
    </div>
  );
}

export default WeatherWidget;