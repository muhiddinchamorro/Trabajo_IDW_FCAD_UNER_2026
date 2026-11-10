const formularioHistoria = document.getElementById("formularioHistoria");
const tablaHistorias = document.getElementById("tablaHistorias");
const totalHistorias = document.getElementById("totalHistorias");
const botonRegistrar = formularioHistoria ? formularioHistoria.querySelector('button[type="submit"]') : null;

let idHistoriaEditando = null;

function generarIdHistoria() {
    const historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];
    let id;
    do {
        id = Math.floor(100000 + Math.random() * 900000).toString();
    } while (historias.some(function(h) { return h.idHistoria === id; }));
    return id;
}

function mostrarHistorias() {
    if (!tablaHistorias) return;
    
    const historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];
    tablaHistorias.innerHTML = "";

    historias.forEach(function(historia) {
        const fila = document.createElement("tr");
        fila.className = "fila-registro";

        const fechaFormateada = historia.fecha ? historia.fecha.split('-').reverse().join('/') : '---';
        const proximoControlFormateado = historia.proximoControl && historia.proximoControl.trim() !== ""
            ? `<strong style="color: #008F80;">${historia.proximoControl.split('-').reverse().join('/')}</strong>`
            : '<span style="color: #999; font-style: italic;">No requerido</span>';

        fila.innerHTML = `
            <td>
                <strong>${historia.mascota}</strong><br>
                <small style="color: #666;">${fechaFormateada}</small>
            </td>
            <td>
                <strong>Motivo:</strong> ${historia.motivo}<br>
                <small style="color: #555;">Peso: ${historia.peso || '---'} kg</small> <br>
                <small style="color: #555;">Temp: ${historia.temperatura || '---'} °C</small>
            </td>
            <td class="celda-texto">${historia.sintomas}</td>
            <td class="celda-texto"><strong>${historia.diagnostico}</strong></td>
            <td class="celda-texto">
                <strong>Tratamiento:</strong> ${historia.tratamiento}<br>
                <strong>Medicación:</strong> <em>${historia.medicacion || 'Ninguna'}</em>
            </td>
            <td>${proximoControlFormateado}</td>
            <td>
                <div class="acciones-mascota" style="display: flex; gap: 8px;">
                    <button class="btn-accion btn-editar" title="Editar Registro" onclick="window.editarHistoria('${historia.idHistoria}')" style="background-color: #008F80; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        Editar
                    </button>
                    <button class="btn-accion btn-eliminar" title="Eliminar Registro" onclick="window.eliminarHistoria('${historia.idHistoria}')" style="background-color: #f17e6d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        Eliminar
                    </button>
                </div>
            </td>
        `;
        tablaHistorias.appendChild(fila);
    });

    if (totalHistorias) {
        totalHistorias.textContent = historias.length;
    }
}

if (formularioHistoria) {
    formularioHistoria.addEventListener("submit", function(event) {
        event.preventDefault();

        const nuevaHistoria = {
            mascota: document.getElementById("mascotaHistoria").value.trim(),
            fecha: document.getElementById("fechaHistoria").value,
            motivo: document.getElementById("motivoHistoria").value.trim(),
            peso: parseFloat(document.getElementById("pesoHistoria").value) || 0,
            temperatura: parseFloat(document.getElementById("temperaturaHistoria").value) || 0,
            sintomas: document.getElementById("sintomasHistoria").value.trim(),
            diagnostico: document.getElementById("diagnosticoHistoria").value.trim(),
            tratamiento: document.getElementById("tratamientoHistoria").value.trim(),
            medicacion: document.getElementById("medicacionHistoria").value.trim(),
            proximoControl: document.getElementById("proximoControlHistoria").value
        };

        if (!nuevaHistoria.mascota || !nuevaHistoria.fecha || !nuevaHistoria.diagnostico) {
            alert("Por favor, completa los campos esenciales (Mascota, Fecha y Diagnóstico).");
            return;
        }

        let historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];

        if (idHistoriaEditando === null) {
            nuevaHistoria.idHistoria = generarIdHistoria();
            historias.push(nuevaHistoria);
        } else {
            const indice = historias.findIndex(function(h) { 
                return h.idHistoria.toString() === idHistoriaEditando.toString(); 
            });
            
            if (indice !== -1) {
                nuevaHistoria.idHistoria = idHistoriaEditando;
                historias[indice] = nuevaHistoria;
            }
        }

        localStorage.setItem("historiasClinicas", JSON.stringify(historias));
        formularioHistoria.reset();
        idHistoriaEditando = null;
        
        if (botonRegistrar) {
            botonRegistrar.textContent = "Registrar historia";
        }
        
        mostrarHistorias();
    });
}

window.editarHistoria = function(id) {
    const historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];
    const historia = historias.find(function(h) { return h.idHistoria.toString() === id.toString(); });

    if (!historia || !formularioHistoria) return;

    document.getElementById("mascotaHistoria").value = historia.mascota;
    document.getElementById("fechaHistoria").value = historia.fecha;
    document.getElementById("motivoHistoria").value = historia.motivo;
    document.getElementById("pesoHistoria").value = historia.peso;
    document.getElementById("temperaturaHistoria").value = historia.temperatura;
    document.getElementById("sintomasHistoria").value = historia.sintomas;
    document.getElementById("diagnosticoHistoria").value = historia.diagnostico;
    document.getElementById("tratamientoHistoria").value = historia.tratamiento;
    document.getElementById("medicacionHistoria").value = historia.medicacion;
    document.getElementById("proximoControlHistoria").value = historia.proximoControl || "";

    idHistoriaEditando = id;
    if (botonRegistrar) {
        botonRegistrar.textContent = "Guardar cambios";
    }

    formularioHistoria.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.eliminarHistoria = function(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro clínico permanentemente?")) return;

    let historias = JSON.parse(localStorage.getItem("historiasClinicas")) || [];
    historias = historias.filter(function(h) { return h.idHistoria.toString() !== id.toString(); });
    localStorage.setItem("historiasClinicas", JSON.stringify(historias));

    if (idHistoriaEditando && idHistoriaEditando.toString() === id.toString()) {
        if (formularioHistoria) formularioHistoria.reset();
        idHistoriaEditando = null;
        if (botonRegistrar) botonRegistrar.textContent = "Registrar historia";
    }

    mostrarHistorias();
};
document.addEventListener("DOMContentLoaded", function() {
    const inputs = ["fHistMascota", "fHistSintomas", "fHistDiag", "fHistTratamiento"];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", filtrarTablaHistorias);
    });
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('modo') === 'filtrar') {
        const panelFiltros = document.querySelector('[class^="panel-filtros-"]');
        if (panelFiltros) {
            panelFiltros.scrollIntoView({ behavior: 'smooth' });
        }
        
        const primerInput = document.querySelector('[id^="fMascota"], [id^="fVet"], [id^="fHist"]');
        if (primerInput) {
            primerInput.focus();
        }
    }

});

function filtrarTablaHistorias() {
    const vMascota = document.getElementById("fHistMascota").value.toLowerCase().trim();
    const vSintomas = document.getElementById("fHistSintomas").value.toLowerCase().trim();
    const vDiag = document.getElementById("fHistDiag").value.toLowerCase().trim();
    const vTrat = document.getElementById("fHistTratamiento").value.toLowerCase().trim();

    // Apunta de manera precisa al tbody que vemos en tu captura HTML
    const filas = document.querySelectorAll("#tablaHistorias .fila-registro");

    filas.forEach(function(fila) {
        // Mapeo directo basándonos en tu estructura sin columna ID
        const tMascota = fila.cells[0] ? fila.cells[0].textContent.toLowerCase() : "";
        const tSintomas = fila.cells[2] ? fila.cells[2].textContent.toLowerCase() : "";
        const tDiag = fila.cells[3] ? fila.cells[3].textContent.toLowerCase() : "";
        const tTrat = fila.cells[4] ? fila.cells[4].textContent.toLowerCase() : "";

        // Evaluaciones cruzadas de los criterios escritos
        const cMascota = tMascota.includes(vMascota);
        const cSintomas = tSintomas.includes(vSintomas);
        const cDiag = tDiag.includes(vDiag);
        const cTrat = tTrat.includes(vTrat);

        // Muestra u oculta la fila según el estado de los filtros
        if (cMascota && cSintomas && cDiag && cTrat) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}
window.exportarSeccionConFiltro = function(seccion) {
    let tituloReporte = "";
    let tablaId = "";

    if (seccion === 'mascotas') {
        tituloReporte = "Reporte de Control - Gestión de Mascotas";
        tablaId = "tablaMascotas";
    } else if (seccion === 'veterinarios') {
        tituloReporte = "Reporte de Control - Cuerpo Veterinario Staff";
        tablaId = "tablaVeterinarios";
    } else if (seccion === 'historias') {
        tituloReporte = "Reporte Clínico - Expedientes e Historias Clínicas";
        tablaId = "tablaHistorias";
    }

    const tablaOriginal = document.getElementById(tablaId) ? document.getElementById(tablaId).closest("table") : null;
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
            f.deleteCell(-1); 
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
                <span style="color: #008F80; font-weight: bold;">Listado Filtrado Personalizado</span>
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


document.addEventListener("DOMContentLoaded", mostrarHistorias);
