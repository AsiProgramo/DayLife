const ajuste = document.querySelector('#ajuste');

function setup() {
    var hora = localStorage.getItem('hora');
    var time = localStorage.getItem('time');

    if (hora !== '' && time !== '') {
        ajuste.style = 'display: none;'
    }
    //reloj
    setInterval(() => {
        var horaReal = document.querySelector('#horaReal');
        var day = new Date();
        var hr = day.getHours();
        var mn = day.getMinutes();

        horaReal.innerHTML = pmoam(hr).hr + ':' + agrega0(mn) + pmoam(hr).pmoam;
    }, 1000)
}
// agrega un 0 si el numero es menor a 10  (1:2PM)vs (1:02PM)
function agrega0(num) {
    if (num < 10) {
        num = '0' + num
    }

    return num;
}
//detecta si es am o pm y hace que sea de reloj de 12 horas
function pmoam(hr) {
    var info = {
        'hr': hr,
        'pmoam': 'AM'
    };
    if (hr < 12) {
        info.hr = hr;
        info.pmoam = 'AM';
    } else if (hr >= 12) {
        info.hr = (hr - 12);
        info.pmoam = 'PM'
    }
    return info;
}
//guarda los dato en el navegador
function guardar() {
    var hora = document.querySelector('#hora');
    var time = document.querySelector('#time');


    localStorage.setItem('hora', hora.value);
    localStorage.setItem('time', time.value);
    ajuste.style = 'display: none;'
}