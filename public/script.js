// Obtener productos del servidor
async function cargarProductos() {
    try {
        const response = await fetch('/productos');
        if (!response.ok) throw new Error('Error al obtener los productos.');

        const productos = await response.json();
        const contenedor = document.getElementById('productos-container');
        contenedor.innerHTML = '';

        productos.forEach((producto) => {
            const productoHTML = `
                <div class="producto">
                    <img src="${producto.imagen_url}" alt="${producto.nombre}">
                    <h2>${producto.nombre}</h2>
                    <p>Precio: $${producto.precio}</p>
                    <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
                </div>
            `;
            contenedor.innerHTML += productoHTML;
        });
    } catch (error) {
        console.error(error);
        alert('Error al cargar los productos.');
    }
}

// Función para manejar agregar al carrito
function agregarAlCarrito(productoId) {
    fetch('/carrito/agregar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ producto_id: productoId, cantidad: 1 }),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Error al agregar al carrito.');
            return response.text();
        })
        .then((mensaje) => alert(mensaje))
        .catch((error) => alert('Error: ' + error.message));
}

// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);
