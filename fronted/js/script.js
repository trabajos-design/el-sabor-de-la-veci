document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    const inputBusqueda = document.getElementById("input-busqueda");

    // Lógica inicial de carga
    if (cat) {
        configurarBanner(cat);
        cargarProductosFiltrados(cat);
    } else {
        // Si existe el contenedor de promos, cargamos promos, si no, todo
        if (document.getElementById("promociones-container")) {
            cargarPromociones();
        } else {
            cargarProductosFiltrados(null);
        }
    }

    // EVENTO DE BÚSQUEDA
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", async (e) => {
            const termino = e.target.value.toLowerCase().trim();
            const container = document.getElementById("productos-container") || document.getElementById("promociones-container");

            if (!container) return;

            try {
                const res = await fetch('../fronted/json/productos.json');
                const data = await res.json();

                // Si borra la búsqueda, regresamos al estado inicial
                if (termino === "") {
                    if (cat) cargarProductosFiltrados(cat);
                    else if (document.getElementById("promociones-container")) cargarPromociones();
                    else cargarProductosFiltrados(null);
                    return;
                }

                // Filtrado por nombre o descripción
                const filtrados = data.productos.filter(p => 
                    p.nombre.toLowerCase().includes(termino) || 
                    p.descripcion.toLowerCase().includes(termino)
                );

                container.innerHTML = "";

                if (filtrados.length > 0) {
                    renderizarCards(filtrados, container);
                } else {
                    // Muestra el mensaje si no encuentra nada
                    container.innerHTML = `
                        <div style="text-align: center; width: 100%; padding: 40px; grid-column: 1/-1;">
                            <h2 style="color: #666;">❌ No hay coincidencias para "${termino}"</h2>
                            <p>¡Intenta con otro nombre o revisa nuestras promos!</p>
                        </div>`;
                }
            } catch (error) {
                console.error("Error buscando:", error);
            }
        });
    }
});

// Función unificada para crear las tarjetas y evitar repetición
function renderizarCards(productos, container) {
    container.innerHTML = "";
    productos.forEach(prod => {
        let precioFinal = prod.precio;
        let etiquetaPromo = "";
        let precioHTML = `<p class="precio">$${prod.precio.toFixed(2)}</p>`;

        if (prod.enPromocion) {
            precioFinal = prod.precio * (1 - (prod.descuento / 100));
            etiquetaPromo = `<div class="promo-badge">¡OFERTA -${prod.descuento}%!</div>`;
            precioHTML = `
                <p class="precio">
                    <span class="precio-antes">$${prod.precio.toFixed(2)}</span> 
                    $${precioFinal.toFixed(2)}
                </p>
                <span class="ahorro-texto">¡Ahorras $${(prod.precio - precioFinal).toFixed(2)}!</span>`;
        }

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            ${etiquetaPromo}
            <img src="${prod.imagen}" alt="${prod.nombre}">
            <div style="padding: 10px; flex-grow: 1; display: flex; flex-direction: column;">
                <h3>${prod.nombre}</h3>
                <p>${prod.descripcion}</p>
                ${precioHTML}
            </div>
            <div class="order-box">
                <div>
                    <label style="font-size: 12px; display: block;">Cant:</label>
                    <input type="number" id="qty-${prod.id}" value="1" min="1" max="20" class="input-cantidad">
                </div>
                <button class="btn-pedir" onclick="confirmarPedido(${prod.id}, ${precioFinal})">Añadir</button>
            </div>`;
        container.appendChild(card);
    });
}

async function cargarProductosFiltrados(categoria) {
    const container = document.getElementById("productos-container");
    if (!container) return;
    try {
        const res = await fetch('../fronted/json/productos.json');
        const data = await res.json();
        let productosAMostrar = categoria 
            ? data.productos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase())
            : data.productos;
        renderizarCards(productosAMostrar, container);
    } catch (e) { container.innerHTML = "<h2>Error al conectar con la cocina.</h2>"; }
}

async function cargarPromociones() {
    const container = document.getElementById("promociones-container");
    if (!container) return;
    try {
        const res = await fetch('fronted/json/productos.json');
        const data = await res.json();
        const soloPromos = data.productos.filter(p => p.enPromocion === true);
        renderizarCards(soloPromos, container);
    } catch (e) { console.error("Error al cargar promos:", e); }
}

function confirmarPedido(id, precio) {
    const input = document.getElementById(`qty-${id}`);
    let cant = parseInt(input.value);
    if(cant > 20) { alert("Máximo 20 unidades."); input.value = 20; cant = 20; }
    if(cant <= 0 || isNaN(cant)) return alert("Cantidad no válida.");

    const total = (cant * precio).toFixed(2);
    if (parseFloat(total) > 0) alert(`¡Añadido!\nTotal: $${total}`);
    else alert("Error en el cálculo.");
}

function configurarBanner(categoria) {
    const titulo = document.getElementById("titulo-categoria");
    const banner = document.getElementById("banner-categoria");
    const estilos = { 'hamburguesas': 'HAMBURGUESAS VECI', 'bebidas': 'BEBIDAS HELADITAS', 'acompañantes': 'ACOMPAÑANTES' ,'salchipapas':'LAS MEJORES SALCHIPAPAS' } // Nueva categoría};
    const catKey = categoria.toLowerCase();
    if (estilos[catKey]) {
        if(titulo) titulo.innerText = estilos[catKey];
        if(banner) banner.style.backgroundColor = '#e75419';
    }
}
// 1. Función para la barra de búsqueda principal (Navbar)
const inputBusqueda = document.getElementById("input-busqueda");
if (inputBusqueda) {
    inputBusqueda.addEventListener("keypress", (e) => {
        if (e.key === "Enter") { // Cuando el usuario presiona Enter
            const termino = inputBusqueda.value.trim();
            if (termino !== "") {
                // Redirige a la nueva página pasando el término por la URL
                window.location.href = `busqueda.html?q=${encodeURIComponent(termino)}`;
            }
        }
    });
}

// 2. Función que se ejecuta SOLO en busqueda.html
async function ejecutarBusquedaSeparada(termino) {
    const container = document.getElementById("productos-container");
    if (!container) return;

    try {
        const res = await fetch('../fronted/json/productos.json');
        const data = await res.json();

        const filtrados = data.productos.filter(p => 
            p.nombre.toLowerCase().includes(termino.toLowerCase()) || 
            p.descripcion.toLowerCase().includes(termino.toLowerCase())
        );

        if (filtrados.length > 0) {
            renderizarCards(filtrados, container);
        } else {
            container.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 50px;">
                    <img src="img/not-found.png" style="width: 150px; opacity: 0.5;">
                    <h3>¡Ups! No encontramos ese sabor.</h3>
                    <p>Intenta con algo más general o vuelve al menú principal.</p>
                    <br>
                    <a href="categorias.html" class="btn-pedir" style="text-decoration:none;">Ver todo el menú</a>
                </div>`;
        }
    } catch (error) {
        console.error("Error en la búsqueda:", error);
    }

}



