(function () {
    // ---------- horario ----------
    // actividades del día, en minutos desde la hora de despertar
    const ACTIVIDADES = [
        { min: 0, nombre: 'Despertar' },
        { min: 10, nombre: 'Tomar agua y estirarse' },
        { min: 30, nombre: 'Ejercicio' },
        { min: 75, nombre: 'Ducha' },
        { min: 90, nombre: 'Desayuno' },
        { min: 120, nombre: 'Trabajo profundo' },
        { min: 270, nombre: 'Descanso' },
        { min: 285, nombre: 'Tareas y correos' },
        { min: 360, nombre: 'Almuerzo' },
        { min: 420, nombre: 'Trabajo' },
        { min: 600, nombre: 'Tiempo libre' },
        { min: 690, nombre: 'Cena' },
        { min: 780, nombre: 'Leer y desconectarse' },
        { min: 960, nombre: 'Dormir' },
    ];

    // agrega un 0 si el numero es menor a 10  (1:2PM) vs (1:02PM)
    const agrega0 = (num) => (num < 10 ? '0' + num : '' + num);

    // convierte minutos del día a formato de 12 horas
    function formato12(minutos) {
        minutos = ((minutos % 1440) + 1440) % 1440;
        const hr = Math.floor(minutos / 60);
        const mn = minutos % 60;
        const sufijo = hr < 12 ? 'AM' : 'PM';
        const hr12 = hr % 12 === 0 ? 12 : hr % 12;
        return hr12 + ':' + agrega0(mn) + sufijo;
    }

    function leer(clave) {
        try { return localStorage.getItem(clave); } catch (e) { return null; }
    }

    function guardar(clave, valor) {
        try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
    }

    // hora de despertar guardada en minutos ("06:30" -> 390)
    function horaDespertar() {
        const hora = leer('hora');
        if (!hora || !/^\d{2}:\d{2}$/.test(hora)) return null;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    function pintarHorario() {
        const inicio = horaDespertar();
        const lista = document.querySelector('#horario');
        const accionHora = document.querySelector('#accionHora');
        const accionNombre = document.querySelector('#accionNombre');
        if (inicio === null) return;

        const ahora = new Date();
        const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
        // minutos que han pasado desde que despertó (0 - 1439)
        const transcurrido = ((minutosAhora - inicio) % 1440 + 1440) % 1440;

        let actual = ACTIVIDADES[0];
        ACTIVIDADES.forEach((a) => { if (a.min <= transcurrido) actual = a; });

        if (accionHora) accionHora.textContent = formato12(inicio + actual.min);
        if (accionNombre) accionNombre.textContent = actual.nombre;

        if (lista) {
            lista.innerHTML = '';
            ACTIVIDADES.forEach((a) => {
                const li = document.createElement('li');
                li.className = 'd-flex justify-content-between py-1 px-2 rounded' +
                    (a === actual ? ' green toscuro font-weight-bold' : '');
                const nombre = document.createElement('span');
                nombre.textContent = a.nombre;
                const hora = document.createElement('span');
                hora.textContent = formato12(inicio + a.min);
                li.append(nombre, hora);
                lista.appendChild(li);
            });
        }
    }

    // ---------- reloj ----------
    function reloj() {
        const horaReal = document.querySelector('#horaReal');
        const day = new Date();
        if (horaReal) horaReal.textContent = formato12(day.getHours() * 60 + day.getMinutes());
    }

    // ---------- ventanas ----------
    const ajuste = document.querySelector('#ajuste');
    const subeimg = document.querySelector('#subeimg');

    function mostrar(el, visible) {
        if (el) el.classList.toggle('visible', visible);
    }

    // en las páginas que no tienen el formulario, los botones llevan al inicio
    document.querySelector('#add')?.addEventListener('click', () => {
        if (subeimg) mostrar(subeimg, true); else location.href = '/#subir';
    });
    document.querySelector('#edit')?.addEventListener('click', () => {
        if (ajuste) mostrar(ajuste, true); else location.href = '/#ajuste';
    });
    document.querySelectorAll('[data-close]').forEach((btn) => {
        btn.addEventListener('click', () => mostrar(document.querySelector(btn.dataset.close), false));
    });

    if (ajuste) {
        const input = document.querySelector('#hora');
        const guardada = leer('hora');
        if (guardada) input.value = guardada;
        // si no hay hora guardada se pide al entrar
        mostrar(ajuste, !guardada || location.hash === '#ajuste');

        document.querySelector('#ajusteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            guardar('hora', input.value);
            mostrar(ajuste, false);
            pintarHorario();
        });
    }
    if (subeimg && location.hash === '#subir') mostrar(subeimg, true);

    // muestra el nombre del archivo elegido
    const fileInput = document.querySelector('.custom-file-input');
    fileInput?.addEventListener('change', () => {
        const label = document.querySelector('.custom-file-label');
        if (fileInput.files[0]) label.textContent = fileInput.files[0].name;
    });

    // ---------- like y borrar ----------
    const btnLike = document.querySelector('#btn-like');
    btnLike?.addEventListener('click', async () => {
        const res = await fetch('/images/' + btnLike.dataset.id + '/like', { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            document.querySelector('.likes-count').textContent = data.likes;
        }
    });

    const btnDelete = document.querySelector('#btn-delete');
    btnDelete?.addEventListener('click', async () => {
        if (!confirm('¿Seguro que quieres borrar esta imagen?')) return;
        const res = await fetch('/images/' + btnDelete.dataset.id, { method: 'DELETE' });
        if (res.ok) location.href = '/';
        else alert('No se pudo borrar la imagen');
    });

    reloj();
    pintarHorario();
    setInterval(() => { reloj(); pintarHorario(); }, 30000);
})();
