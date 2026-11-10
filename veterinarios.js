const formularioVeterinario = document.getElementById("formularioVeterinario");
const tablaVeterinarios = document.getElementById("tablaVeterinarios");
const totalVeterinarios = document.getElementById("totalVeterinarios");
const botonRegistrar = formularioVeterinario.querySelector('button[type="submit"]');

function generarIdVeterinario() {
    const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];
    let id;
    do {
        id = Math.floor(100000 + Math.random() * 900000).toString();
    } while (veterinarios.some(function(veterinario) {
        return veterinario.idVeterinario === id;
    }));
    return id;
}

let idVeterinarioEditando = null;

function mostrarVeterinarios() {
    const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];
    tablaVeterinarios.innerHTML = "";

    const fotoPorDefecto = "https://wikimedia.org";

    veterinarios.forEach(function(veterinario) {
        const fila = document.createElement("tr");
        fila.className = "fila-registro"; 

        const id = veterinario.idVeterinario || "---";
        const matricula = veterinario.matricula || "Sin matrícula";
        const nombre = veterinario.nombreVeterinario || "Sin nombre";
        const especializacion = veterinario.especializacion || "General";
        const valor = veterinario.valorConsulta || 0;
        const foto = (veterinario.fotoVeterinario && veterinario.fotoVeterinario.trim() !== "") 
            ? veterinario.fotoVeterinario 
            : fotoPorDefecto;

        fila.innerHTML = `
            <td>${id}</td>
            <td>${matricula}</td>
            <td style="display: flex; align-items: center; gap: 10px;">
                <img src="${foto}" alt="Foto" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #ccc;">
                <span>${nombre}</span>
            </td>
            <td>${especializacion}</td>
            <td>$${valor}</td>
            <td>
                <div class="acciones-veterinario">
                    <button
                        class="btn-accion btn-editar"
                        onclick="editarVeterinario('${id}')">
                        <span>✎</span> Editar
                    </button>
                    <button
                        class="btn-accion btn-eliminar"
                        onclick="eliminarVeterinario('${id}')">
                        <span>×</span> Eliminar
                    </button>
                </div>
            </td>
        `;
        tablaVeterinarios.appendChild(fila);
    });

    totalVeterinarios.textContent = veterinarios.length;
}

formularioVeterinario.addEventListener("submit", function(event) {
    event.preventDefault();

    const inputFoto = document.getElementById("fotoVeterinario");
    const urlFoto = inputFoto ? inputFoto.value.trim() : "";

    const nuevoVeterinario = {
        nombreVeterinario: document.getElementById("nombreVeterinario").value.trim(),
        matricula: document.getElementById("matricula").value.trim(),
        especializacion: document.getElementById("especializacion").value.trim(),
        valorConsulta: parseFloat(document.getElementById("valorConsulta").value) || 0,
        fotoVeterinario: urlFoto
    };

    const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];

    if (idVeterinarioEditando === null) {
        nuevoVeterinario.idVeterinario = generarIdVeterinario();
        veterinarios.push(nuevoVeterinario);
    } else {
        const indice = veterinarios.findIndex(function(veterinario) {
            return veterinario.idVeterinario === idVeterinarioEditando;
        });

        if (indice !== -1) {
            nuevoVeterinario.idVeterinario = idVeterinarioEditando;
            veterinarios[indice] = nuevoVeterinario;
        }
    }

    localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
    formularioVeterinario.reset();

    idVeterinarioEditando = null;
    botonRegistrar.textContent = "Registrar veterinario";

    mostrarVeterinarios();
});

function editarVeterinario(id) {
    const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];
    const veterinario = veterinarios.find(function(veterinario) {
        return veterinario.idVeterinario === id;
    });

    if (!veterinario) {
        return;
    }

    document.getElementById("nombreVeterinario").value = veterinario.nombreVeterinario;
    document.getElementById("matricula").value = veterinario.matricula;
    document.getElementById("especializacion").value = veterinario.especializacion;
    document.getElementById("valorConsulta").value = veterinario.valorConsulta;
    
    const inputFoto = document.getElementById("fotoVeterinario");
    if (inputFoto) {
        inputFoto.value = veterinario.fotoVeterinario || "";
    }

    idVeterinarioEditando = id;
    botonRegistrar.textContent = "Guardar cambios";

    formularioVeterinario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    }); 
}

function eliminarVeterinario(id) {
    const confirmar = confirm("¿Estás seguro de que querés eliminar este veterinario?");
    if (!confirmar) {
        return;
    }

    let veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || [];
    veterinarios = veterinarios.filter(function(veterinario) {
        return veterinario.idVeterinario !== id;
    });

    localStorage.setItem("veterinarios", JSON.stringify(veterinarios));

    if (idVeterinarioEditando === id) {
        formularioVeterinario.reset();
        idVeterinarioEditando = null;
        botonRegistrar.textContent = "Registrar veterinario";
    }

    mostrarVeterinarios();
}

document.addEventListener("DOMContentLoaded", function() {
    if (typeof mostrarVeterinarios === "function") {
        mostrarVeterinarios();
    }

    const idsInputs = ["fVetMatricula", "fVetNombre", "fVetEspecialidad", "fVetPrecio"];
    idsInputs.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", filtrarTablaVeterinarios);
        }
    });

    const btnLimpiar = document.getElementById("btnLimpiarVeterinarios");
    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", function(e) {
            e.preventDefault();
            idsInputs.forEach(function(id) {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
            filtrarTablaVeterinarios(); 
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('modo') === 'filtrar') {
        const panelFiltros = document.querySelector('[class^="panel-filtros-"]');
        if (panelFiltros) {
            panelFiltros.scrollIntoView({ behavior: 'smooth' });
        }
        const primerInput = document.getElementById("fVetMatricula");
        if (primerInput) {
            primerInput.focus();
        }
    }
});

function filtrarTablaVeterinarios() {
    const inpMatricula = document.getElementById("fVetMatricula");
    const inpNombre = document.getElementById("fVetNombre");
    const inpEspecialidad = document.getElementById("fVetEspecialidad");
    const inpPrecio = document.getElementById("fVetPrecio");

    const vMatricula = inpMatricula ? inpMatricula.value.toLowerCase().trim() : "";
    const vNombre = inpNombre ? inpNombre.value.toLowerCase().trim() : "";
    const vEspecialidad = inpEspecialidad ? inpEspecialidad.value.toLowerCase().trim() : "";
    const vPrecioMax = inpPrecio ? (parseFloat(inpPrecio.value) || null) : null;

    const filas = document.querySelectorAll("#tablaVeterinarios .fila-registro");

    filas.forEach(function(fila) {
        if (!fila.cells || fila.cells.length < 5) return;

        const tMatricula = fila.cells[1] ? fila.cells[1].textContent.toLowerCase() : "";
        const tNombre = fila.cells[2] ? fila.cells[2].textContent.toLowerCase() : "";
        const tEspecialidad = fila.cells[3] ? fila.cells[3].textContent.toLowerCase() : "";
        
        const tPrecioRaw = fila.cells[4] ? fila.cells[4].textContent : "";
        const nPrecio = parseFloat(tPrecioRaw.replace(/[^0-9.]/g, '')) || 0;

        const cMatricula = tMatricula.includes(vMatricula);
        const cNombre = tNombre.includes(vNombre);
        const cEspecialidad = tEspecialidad.includes(vEspecialidad);
        const cPrecio = !vPrecioMax || nPrecio <= vPrecioMax;

        if (cMatricula && cNombre && cEspecialidad && cPrecio) {
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
