const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize('inventario', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'mi_clave_secreta',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static('public'));

// Modelos
const Producto = sequelize.define('Producto', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    imagen_url: { type: DataTypes.STRING, allowNull: false },
});

const Carrito = sequelize.define('Carrito', {
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
});

// Relaciones
Carrito.belongsTo(Producto, { foreignKey: 'producto_id' });

sequelize.sync();

// Rutas
app.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.findAll();
        res.json(productos);
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
});

app.post('/carrito/agregar', async (req, res) => {
    const { producto_id } = req.body;
    try {
        const producto = await Producto.findByPk(producto_id);
        if (!producto) return res.status(404).send('Producto no encontrado.');

        const item = await Carrito.findOne({ where: { producto_id } });
        if (item) {
            item.cantidad += 1;
            await item.save();
        } else {
            await Carrito.create({ producto_id, cantidad: 1 });
        }
        res.send('Producto agregado al carrito.');
    } catch (error) {
        res.status(500).send('Error al agregar al carrito.');
    }
});

app.get('/carrito', async (req, res) => {
    try {
        const carrito = await Carrito.findAll({
            include: [Producto],
        });
        res.json(carrito);
    } catch (error) {
        res.status(500).send('Error al obtener el carrito.');
    }
});

app.delete('/carrito/eliminar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Carrito.findByPk(id);
        if (!item) return res.status(404).send('Producto no encontrado en el carrito.');

        await item.destroy();
        res.send('Producto eliminado del carrito.');
    } catch (error) {
        res.status(500).send('Error al eliminar del carrito.');
    }
});

app.post('/carrito/comprar', async (req, res) => {
    try {
        const carrito = await Carrito.findAll({ include: [Producto] });
        if (!carrito.length) return res.status(400).send('El carrito está vacío.');

        let total = 0;
        const productos = carrito.map((item) => {
            total += item.cantidad * item.Producto.precio;
            return {
                nombre: item.Producto.nombre,
                cantidad: item.cantidad,
                subtotal: item.cantidad * item.Producto.precio,
            };
        });

        await Carrito.destroy({ where: {} }); // Vaciar el carrito

        res.json({
            negocio: 'Panadería Esperanza',
            fecha: new Date().toISOString(),
            productos,
            total,
        });
    } catch (error) {
        res.status(500).send('Error al procesar la compra.');
    }
});

app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});
