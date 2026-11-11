const paginasProtegidas = [
    'admin',
    'mascotas',
    'veterinarios',
    'historia_clinica',
    'pedirturno'
];

const pathname = window.location.pathname.replace(/\/+$/, '');
const segmentoFinal = pathname.substring(pathname.lastIndexOf('/') + 1).toLowerCase();
const paginaActual = segmentoFinal.replace(/\.html$/, '') || 'index';

const tokenActivo = sessionStorage.getItem('userToken');

if (paginasProtegidas.includes(paginaActual) && !tokenActivo) {
    window.location.replace('./login.html');
}

if (paginaActual === 'login' && tokenActivo) {
    window.location.replace('./admin.html');
}


document.addEventListener("DOMContentLoaded", function() {
    
    const contenedorHeader = document.getElementById("global-header");
    
    if (contenedorHeader) {
        contenedorHeader.style.display = "flex";
        contenedorHeader.style.justifyContent = "space-between";
        contenedorHeader.style.alignItems = "center";
        contenedorHeader.style.padding = "10px 20px";
        contenedorHeader.style.background = "#ffffff";
        contenedorHeader.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
        contenedorHeader.style.fontFamily = "system-ui, -apple-system, sans-serif";
        contenedorHeader.style.position = "relative";
        contenedorHeader.style.zIndex = "1000";
        contenedorHeader.style.width = "100%";
        contenedorHeader.style.boxSizing = "border-box";

        const mostrarMenuPrivado = tokenActivo && urlActual !== 'login';

        const obtenerEstiloEnlace = () => '';

        contenedorHeader.innerHTML = `
        <div class="logo-seccion" style="display: flex; align-items: center;">
            <img src="./asset/images/imagen.png" alt="Logo de la veterinaria" class="logo-veterinaria" style="width: 140px;">
        </div>
        

        <button id="btn-hamburguesa" class="btn-hamburguesa" aria-label="Abrir menú" style="display: none; background: none; border: none; font-size: 28px; cursor: pointer; color: #2d3748;">
            ☰
        </button>

        <nav id="navegacion-principal" class="navegacion-principal" style="display: flex; gap: 25px; align-items: center;">
            <a href="./index.html" class="nav-link-dinamico" style="${obtenerEstiloEnlace('index.html')}">Inicio</a>
            <a href="./institucional.html" class="nav-link-dinamico" style="${obtenerEstiloEnlace('institucional.html')}">Institucional</a>
            <a href="./contacto.html" class="nav-link-dinamico" style="${obtenerEstiloEnlace('contacto.html')}">Contacto</a>
            
            ${mostrarMenuPrivado ? `
                <a href="./admin.html" class="nav-link-dinamico" style="${obtenerEstiloEnlace('admin.html')}">Panel Admin</a>
                <a href="./mascotas.html" class="nav-link-dinamico" style="${obtenerEstiloEnlace('mascotas.html')}">Mascotas</a>
                <a href="./veterinarios.html" class="nav-link-dinamico" style="${obtenerEstiloEnlace('veterinarios.html')}">Veterinarios</a>
                <a href="./historia_clinica.html" class="nav-link-dinamico" style="${obtenerEstiloEnlace('historia_clinica.html')}">Historias Clínicas</a>
            ` : ''}
            <div class="botones-sesion-movil">
                ${mostrarMenuPrivado ? `
                    <a href="./pedirturno.html" class="btn-pedir-turno" style="background-color: #f17e6d; color: white; font-weight: bold; text-decoration: none;">Pedir turno</a>
                    <a href="#" class="btn-registrar btn-logout" style="background-color: #008F80; color: white; font-weight: bold; text-decoration: none;">Cerrar Sesión</a>
                ` : `
                    <a href="./login.html" class="btn-registrar" style="background-color: #008F80; color: white; font-weight: bold; text-decoration: none;">Iniciar Sesión</a>
                `}
            </div>
        </nav>

        <div class="botones-sesion" style="display: flex; align-items: center; gap: 12px;">
            ${mostrarMenuPrivado ? `
                <a href="./pedirturno.html" class="btn-pedir-turno" style="background-color: #f17e6d; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-weight: bold;">Pedir turno</a>
                <a href="#" class="btn-registrar btn-logout" style="background-color: #008F80; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">Cerrar Sesión</a>
            ` : `
                <a href="./login.html" class="btn-registrar" style="background-color: #008F80; color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">Iniciar Sesión</a>
            `}
        </div>
        `;

        document.querySelectorAll('.nav-link-dinamico').forEach(function(enlace) {
            if (enlace.getAttribute('href') === './' + urlActual) {
                enlace.classList.add('activo');
            }
        });
        try {
            const btnHamburguesa = document.getElementById('btn-hamburguesa');
            const navPrincipal = document.getElementById('navegacion-principal');

            if (btnHamburguesa && navPrincipal) {
                btnHamburguesa.replaceWith(btnHamburguesa.cloneNode(true));
                const btnLimpio = document.getElementById('btn-hamburguesa');
                
                btnLimpio.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navPrincipal.classList.toggle('menu-activo');
                    btnLimpio.textContent = navPrincipal.classList.contains('menu-activo') ? '✖' : '☰';
                });
            }
        } catch (error) {
            console.warn("Error controlado en el menú adaptativo:", error);
        }

        document.querySelectorAll('.btn-logout').forEach(function(botonLogout) {
            botonLogout.addEventListener('click', function(evento) {
                evento.preventDefault();
                sessionStorage.removeItem('userToken');
                sessionStorage.removeItem('userData');
                window.location.href = './index.html';
            });
        });
    }

    if (urlActual === 'historia_clinica.html') {
        if (typeof mostrarHistorias === "function") {
            mostrarHistorias();
        }

        const idsInputs = ["fHistMascota", "fHistSintomas", "fHistDiag", "fHistTratamiento"];
        idsInputs.forEach(function(id) {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", filtrarTablaHistorias);
            }
        });

        const btnLimpiar = document.getElementById("btnLimpiarHistorias");
        if (btnLimpiar) {
            btnLimpiar.addEventListener("click", function(e) {
                e.preventDefault();
                idsInputs.forEach(function(id) {
                    const el = document.getElementById(id);
                    if (el) el.value = "";
                });
                filtrarTablaHistorias(); 
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('modo') === 'filtrar') {
            const panelFiltros = document.querySelector('[class^="panel-filtros-"]');
            if (panelFiltros) {
                panelFiltros.scrollIntoView({ behavior: 'smooth' });
            }
            const primerInput = document.getElementById("fHistMascota");
            if (primerInput) {
                primerInput.focus();
            }
        }
    } 
}); 


function filtrarTablaHistorias() {
    const inpMascota = document.getElementById("fHistMascota");
    const inpSintomas = document.getElementById("fHistSintomas");
    const inpDiag = document.getElementById("fHistDiag");
    const inpTratamiento = document.getElementById("fHistTratamiento");

    if (!inpMascota && !inpSintomas && !inpDiag && !inpTratamiento) return;

    const vMascota = inpMascota ? inpMascota.value.toLowerCase().trim() : "";
    const vSintomas = inpSintomas ? inpSintomas.value.toLowerCase().trim() : "";
    const vDiag = inpDiag ? inpDiag.value.toLowerCase().trim() : "";
    const vTrat = inpTratamiento ? inpTratamiento.value.toLowerCase().trim() : "";

    const filas = document.querySelectorAll("#tablaHistorias .fila-registro");

    if (filas.length === 0) return;

    filas.forEach(function(fila) {
        if (!fila.cells || fila.cells.length < 5) return;

        const tMascota = fila.cells[0] ? fila.cells[0].textContent.toLowerCase() : "";
        const tSintomas = fila.cells[2] ? fila.cells[2].textContent.toLowerCase() : "";
        const tDiag = fila.cells[3] ? fila.cells[3].textContent.toLowerCase() : "";
        const tTrat = fila.cells[4] ? fila.cells[4].textContent.toLowerCase() : "";

        const cMascota = tMascota.includes(vMascota);
        const cSintomas = tSintomas.includes(vSintomas);
        const cDiag = tDiag.includes(vDiag);
        const cTrat = tTrat.includes(vTrat);

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
