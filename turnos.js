const formularioTurno = document.getElementById("formularioTurno");
const tablaTurnos = document.getElementById("tablaTurnos");
const totalTurnos = document.getElementById("totalTurnos");
const botonRegistrar = formularioTurno ? formularioTurno.querySelector('button[type="submit"]') : null;

let idTurnoEditando = null;

function generarIdTurno() {
    const turnos = JSON.parse(localStorage.getItem("turnosVeterinaria")) || [];
    let id;
    do {
        id = Math.floor(100000 + Math.random() * 900000).toString();
    } while (turnos.some(function(t) { return t.idTurno === id; }));
    return id;
}

function mostrarTurnos() {
    if (!tablaTurnos) return;
    
    const turnos = JSON.parse(localStorage.getItem("turnosVeterinaria")) || [];
    tablaTurnos.innerHTML = "";

    turnos.forEach(function(turno) {
        const fila = document.createElement("tr");
        fila.className = "fila-registro";
        fila.dataset.dueno = (turno.dueno + " " + turno.correo).toLowerCase();
        fila.dataset.servicio = (turno.servicio || "").toLowerCase();
        fila.dataset.especie = (turno.especie || "").toLowerCase();
        const fechaFormateada = turno.fecha ? turno.fecha.split('-').reverse().join('/') : '---';

        fila.innerHTML = `
            <td>
                <strong>${turno.dueno}</strong><br>
                <small style="color: #666;">${turno.correo}</small>
            </td>
            <td>
                <strong>${turno.servicio}</strong><br>
                <small style="color: #555;">Especie: ${turno.especie}</small>
            </td>
            <td>
                <strong style="color: #008F80;">${fechaFormateada}</strong><br>
                <span>${turno.hora} hs</span>
            </td>
            <td class="celda-texto">${turno.info || '<span style="color:#999; font-style:italic;">Ninguna</span>'}</td>
            <td>
                <div class="acciones-mascota" style="display: flex; gap: 8px;">
                    <button class="btn-accion btn-editar" title="Editar Turno" onclick="window.editarTurno('${turno.idTurno}')" style="background-color: #008F80; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        Editar
                    </button>
                    <button class="btn-accion btn-eliminar" title="Eliminar Turno" onclick="window.eliminarTurno('${turno.idTurno}')" style="background-color: #f17e6d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        Eliminar
                    </button>
                </div>
            </td>
        `;
        tablaTurnos.appendChild(fila);
    });

    if (totalTurnos) {
        totalTurnos.textContent = turnos.length;
    }
}

if (formularioTurno) {
    formularioTurno.addEventListener("submit", function(event) {
        event.preventDefault();

        const nuevoTurno = {
            servicio: document.getElementById("servicioTurno").value,
            dueno: document.getElementById("duenoTurno").value.trim(),
            especie: document.getElementById("especieTurno").value,
            correo: document.getElementById("correoTurno").value.trim(),
            fecha: document.getElementById("fechaTurno").value,
            hora: document.getElementById("horaTurno").value,
            info: document.getElementById("infoTurno").value.trim()
        };

        let turnos = JSON.parse(localStorage.getItem("turnosVeterinaria")) || [];

        if (idTurnoEditando === null) {
            nuevoTurno.idTurno = generarIdTurno();
            turnos.push(nuevoTurno);
        } else {
            const indice = turnos.findIndex(function(t) { 
                return t.idTurno.toString() === idTurnoEditando.toString(); 
            });
            
            if (indice !== -1) {
                nuevoTurno.idTurno = idTurnoEditando;
                turnos[indice] = nuevoTurno;
            }
        }

        localStorage.setItem("turnosVeterinaria", JSON.stringify(turnos));
        formularioTurno.reset();
        idTurnoEditando = null;
        
        if (botonRegistrar) {
            botonRegistrar.textContent = "Pedir Turno";
        }
        
        mostrarTurnos();
    });
}

window.editarTurno = function(id) {
    const turnos = JSON.parse(localStorage.getItem("turnosVeterinaria")) || [];
    const turno = turnos.find(function(t) { return t.idTurno.toString() === id.toString(); });

    if (!turno || !formularioTurno) return;

    document.getElementById("servicioTurno").value = turno.servicio;
    document.getElementById("duenoTurno").value = turno.dueno;
    document.getElementById("especieTurno").value = turno.especie;
    document.getElementById("correoTurno").value = turno.correo;
    document.getElementById("fechaTurno").value = turno.fecha;
    document.getElementById("horaTurno").value = turno.hora;
    document.getElementById("infoTurno").value = turno.info;

    idTurnoEditando = id;
    if (botonRegistrar) {
        botonRegistrar.textContent = "Guardar Cambios";
    }

    formularioTurno.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.eliminarTurno = function(id) {
    if (!confirm("¿Estás seguro de que deseas cancelar este turno permanentemente?")) return;

    let turnos = JSON.parse(localStorage.getItem("turnosVeterinaria")) || [];
    turnos = turnos.filter(function(t) { return t.idTurno.toString() !== id.toString(); });
    localStorage.setItem("turnosVeterinaria", JSON.stringify(turnos));

    if (idTurnoEditando && idTurnoEditando.toString() === id.toString()) {
        if (formularioTurno) formularioTurno.reset();
        idTurnoEditando = null;
        if (botonRegistrar) botonRegistrar.textContent = "Pedir Turno";
    }

    mostrarTurnos();
};

document.addEventListener("DOMContentLoaded", function() {
    const inputsFiltro = ["fTurnoDueno", "fTurnoServicio", "fTurnoEspecie"];
    inputsFiltro.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", filtrarTablaTurnos);
    });
    mostrarTurnos();
});

function filtrarTablaTurnos() {
    const vDueno = document.getElementById("fTurnoDueno").value.toLowerCase().trim();
    const vServicio = document.getElementById("fTurnoServicio").value.toLowerCase().trim();
    const vEspecie = document.getElementById("fTurnoEspecie").value.toLowerCase().trim();

    const filas = document.querySelectorAll("#tablaTurnos .fila-registro");

    filas.forEach(function(fila) {
        const tDueno = fila.dataset.dueno || "";
        const tServicio = fila.dataset.servicio || "";
        const tEspecie = fila.dataset.especie || "";

        const cDueno = tDueno.includes(vDueno);
        const cServicio = tServicio.includes(vServicio);
        const cEspecie = tEspecie.includes(vEspecie);

        if (cDueno && cServicio && cEspecie) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

window.exportarTurnosConFiltro = function() {
    const tituloReporte = "Reporte de Agenda - Control de Turnos Solicitados";
    const tablaOriginal = document.getElementById("tablaTurnos") ? document.getElementById("tablaTurnos").closest("table") : null;
    const contenedorImpresion = document.getElementById("contenedorImpresionDinamica");
    
    if (!tablaOriginal || !contenedorImpresion) {
        window.print();
        return;
    }

    const tablaClonada = tablaOriginal.cloneNode(true);
    const filasOriginales = tablaOriginal.querySelectorAll("tbody tr");
    const filasClonadas = tablaClonada.querySelectorAll("tbody tr");

    filasOriginales.forEach(function(filaOriginal, indice) {
        if (filaOriginal.style.display === "none" && filasClonadas[indice]) {
            filasClonadas[indice].remove();
        }
    });

    const todasLasFilasClonadas = tablaClonada.querySelectorAll("tr");
    todasLasFilasClonadas.forEach(function(f) {
        if (f.cells && f.cells.length > 0) {
            f.deleteCell(-1); // Remueve la columna de acciones (Editar/Eliminar)
        }
    });

    const fechaActual = new Date().toLocaleDateString();

    contenedorImpresion.innerHTML = `
        <div style="border-bottom: 2px solid #008F80; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-family: system-ui, sans-serif;">
            <div>
                <h1 style="margin: 0; color: #008F80; font-size: 24px;">SISTEMA VETERINARIO - LA MARY</h1>
                <p style="margin: 5px 0 0 0; color: #555; font-size: 16px; font-weight: 600;">${tituloReporte}</p>
            </div>
            <div style="text-align: right; font-size: 13px; color: #777;">
                <strong>Fecha de Emisión:</strong> ${fechaActual}<br>
                <span style="color: #008F80; font-weight: bold;">Listado de Turnos Activos</span>
            </div>
        </div>
    `;
    
    contenedorImpresion.appendChild(tablaClonada);
    const tituloOriginal = document.title;
    document.title = tituloReporte.replace(/\s+/g, '_');
    window.print();
    document.title = tituloOriginal;
    contenedorImpresion.innerHTML = "";
};
