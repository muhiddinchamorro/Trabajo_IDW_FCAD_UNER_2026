const formularioMascota = document.getElementById("formularioMascota");
const tablaMascotas = document.getElementById("tablaMascotas");
const totalMascotas = document.getElementById("totalMascotas");
const botonRegistrar = formularioMascota.querySelector('button[type="submit"]');

function generarIdMascota() {
    const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

    let id;

    do {
        id = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, "0");
    } while (mascotas.some(function(mascota) {
        return mascota.idMascota === id;
    }));

    return id;
}

let idMascotaEditando = null;


function mostrarMascotas() {
    const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

    tablaMascotas.innerHTML = "";

    mascotas.forEach(function(mascota) {
        const fila = document.createElement("tr");
        fila.className = "fila-registro";

        fila.innerHTML = `
            <td>${mascota.nombreMascota}</td>
            <td>${mascota.nombreDuenio}</td>
            <td>${mascota.color}</td>
            <td>${mascota.edad}</td>
            <td>${mascota.peso} kg</td>
            <td>
                <div class="acciones-mascota">
                    <button
                        class="btn-accion btn-editar"
                        onclick="editarMascota('${mascota.idMascota}')">
                        <span>✎</span> Editar
                    </button>

                    <button
                        class="btn-accion btn-eliminar"
                        onclick="eliminarMascota('${mascota.idMascota}')">
                        <span>×</span> Eliminar
                    </button>
                </div>
            </td>
        `;
        tablaMascotas.appendChild(fila);
    });

    totalMascotas.textContent = mascotas.length;
}


formularioMascota.addEventListener("submit", function(event) {
    event.preventDefault();

    const nuevaMascota = {
        nombreMascota: document.getElementById("nombreMascota").value.trim(),
        nombreDuenio: document.getElementById("nombreDuenio").value.trim(),
        color: document.getElementById("colorMascota").value.trim(),
        edad: parseInt(document.getElementById("edadMascota").value),
        peso: parseFloat(document.getElementById("pesoMascota").value)
    };

    const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

    if (idMascotaEditando === null) {

        
        nuevaMascota.idMascota = generarIdMascota();

        mascotas.push(nuevaMascota);

    } else {

       
        const indice = mascotas.findIndex(function(mascota) {
            return mascota.idMascota === idMascotaEditando;
        });

        if (indice !== -1) {
            nuevaMascota.idMascota = idMascotaEditando;
            mascotas[indice] = nuevaMascota;
        }
    }

    localStorage.setItem("mascotas", JSON.stringify(mascotas));

    formularioMascota.reset();

    idMascotaEditando = null;
    botonRegistrar.textContent = "Registrar mascota";

    mostrarMascotas();
});


function editarMascota(id) {
    const mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

    const mascota = mascotas.find(function(mascota) {
        return mascota.idMascota === id;
    });

    if (!mascota) {
        return;
    }

    document.getElementById("nombreMascota").value = mascota.nombreMascota;
    document.getElementById("nombreDuenio").value = mascota.nombreDuenio;
    document.getElementById("colorMascota").value = mascota.color;
    document.getElementById("edadMascota").value = mascota.edad;
    document.getElementById("pesoMascota").value = mascota.peso;

    idMascotaEditando = id;

    botonRegistrar.textContent = "Guardar cambios";

    formularioMascota.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function eliminarMascota(id) {
    const confirmar = confirm("¿Estás seguro de que querés eliminar esta mascota?");

    if (!confirmar) {
        return;
    }

    let mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

    mascotas = mascotas.filter(function(mascota) {
        return mascota.idMascota !== id;
    });

    localStorage.setItem("mascotas", JSON.stringify(mascotas));

   
    if (idMascotaEditando === id) {
        formularioMascota.reset();
        idMascotaEditando = null;
        botonRegistrar.textContent = "Registrar mascota";
    }

    mostrarMascotas();
}

document.addEventListener("DOMContentLoaded", function() {

    if (typeof mostrarMascotas === "function") {
        mostrarMascotas();
    }

    const idsInputs = ["fMascotaNombre", "fMascotaDuenio", "fMascotaColor", "fMascotaEdad", "fMascotaPeso"];
    idsInputs.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", filtrarTablaMascotas);
        }
    });

    const btnLimpiar = document.getElementById("btnLimpiarMascotas");
    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", function(e) {
            e.preventDefault();
            
            idsInputs.forEach(function(id) {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });

            filtrarTablaMascotas(); 
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('modo') === 'filtrar') {
        const panelFiltros = document.querySelector('[class^="panel-filtros-"]');
        if (panelFiltros) {
            panelFiltros.scrollIntoView({ behavior: 'smooth' });
        }
        const primerInput = document.getElementById("fMascotaNombre");
        if (primerInput) {
            primerInput.focus();
        }
    }
});

function filtrarTablaMascotas() {
    const inpNombre = document.getElementById("fMascotaNombre");
    const inpDuenio = document.getElementById("fMascotaDuenio");
    const inpColor  = document.getElementById("fMascotaColor");
    const inpEdad   = document.getElementById("fMascotaEdad");
    const inpPeso   = document.getElementById("fMascotaPeso");

    const vNombre  = inpNombre ? inpNombre.value.toLowerCase().trim() : "";
    const vDuenio  = inpDuenio ? inpDuenio.value.toLowerCase().trim() : "";
    const vColor   = inpColor  ? inpColor.value.toLowerCase().trim() : "";
    const vEdad    = inpEdad   ? inpEdad.value.trim() : "";
    const vPesoMax = inpPeso   ? (parseFloat(inpPeso.value) || null) : null;

    const filas = document.querySelectorAll("#tablaMascotas .fila-registro");

    filas.forEach(function(fila) {
        if (!fila.cells || fila.cells.length < 5) return;

        const tNombre  = fila.cells[0].textContent.toLowerCase();
        const tDuenio  = fila.cells[1].textContent.toLowerCase();
        const tColor   = fila.cells[2].textContent.toLowerCase();
        const tEdad    = fila.cells[3].textContent.trim();
        const tPesoRaw = fila.cells[4].textContent;
        const nPeso    = parseFloat(tPesoRaw.replace(/[^0-9.]/g, '')) || 0;

        const cNombre = tNombre.includes(vNombre);
        const cDuenio = tDuenio.includes(vDuenio);
        const cColor  = tColor.includes(vColor);
        const cEdad   = !vEdad || tEdad === vEdad;
        const cPeso   = !vPesoMax || nPeso <= vPesoMax;

        if (cNombre && cDuenio && cColor && cEdad && cPeso) {
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
