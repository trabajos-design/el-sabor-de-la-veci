// Función para el buscador
function filtrarProductos() {
    let input = document.getElementById('buscar').value.toLowerCase();
    let cards = document.querySelectorAll('.category-card');

    cards.forEach(card => {
        let titulo = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = titulo.includes(input) ? "block" : "none";
    });
}

// [2025-12-10] Corrección de facturación para evitar el error de 0.00
function procesarFactura(subtotal) {
    // Validar que el subtotal sea mayor a cero [cite: 2025-12-10]
    if (subtotal <= 0) {
        console.error("Error: Intento de facturación con valor 0.00");
        return;
    }

    // [2026-01-02] Control para evitar números gigantes que saturen la BD
    if (subtotal > 9999) {
        alert("El monto máximo por pedido es de $9,999.00");
        return;
    }

    const IVA = subtotal * 0.15;
    const TOTAL = subtotal + IVA;

    console.log(`Subtotal: ${subtotal} | IVA: ${IVA} | Total: ${TOTAL}`);
    // Aquí se enviaría al backend/generar_factura.php
}