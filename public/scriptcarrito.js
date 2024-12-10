async function cargarCarrito() {
    try {
        const response = await fetch('/carrito');
        if (!response.ok) throw new Error('Error al obtener el carrito.');

        const carrito = await response.json();
        const contenedor = document.getElementById('carrito-items');
        contenedor.innerHTML = '';

        carrito.forEach((item) => {
            const itemHTML = `
                <div class="carrito-item">
                    <img src="${item.Producto.imagen_url}" alt="${item.Producto.nombre}">
                    <h3>${item.Producto.nombre}</h3>
                    <p>Precio: $${item.Producto.precio}</p>
                    <p>Cantidad: ${item.cantidad}</p>
                    <button onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
                </div>
            `;
            contenedor.innerHTML += itemHTML;
        });
    } catch (error) {
        console.error(error);
        alert('Error al cargar el carrito.');
    }
}

async function eliminarDelCarrito(id) {
    try {
        const response = await fetch(`/carrito/eliminar/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar del carrito.');

        alert(await response.text());
        cargarCarrito();
    } catch (error) {
        console.error(error);
        alert('Error al eliminar del carrito.');
    }
}

async function finalizarCompra() {
    try {
        const response = await fetch('/carrito/comprar', { method: 'POST' });
        if (!response.ok) throw new Error('Error al procesar la compra.');

        const ticket = await response.json();
        document.getElementById('carrito-container').style.display = 'none';
        document.getElementById('ticket-container').style.display = 'block';

        const ticketDetails = document.getElementById('ticket-details');
        ticketDetails.innerHTML = `
            <p>Negocio: ${ticket.negocio}</p>
            <p>Fecha: ${ticket.fecha}</p>
            <h3>Productos:</h3>
            <ul>
                ${ticket.productos
                    .map((producto) => `<li>${producto.nombre} - ${producto.cantidad} x $${producto.subtotal}</li>`)
                    .join('')}
            </ul>
            <p>Total: $${ticket.total}</p>
        `;
    } catch (error) {
        console.error(error);
        alert('Error al finalizar la compra.');
    }
}

document.getElementById('comprar-button').addEventListener('click', finalizarCompra);

document.addEventListener('DOMContentLoaded', cargarCarrito);
