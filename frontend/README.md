# Cómo usar

## 1. Obtener productos (GET)
```js
const products = await API.getProducts();
```

## 2. Login (POST)
```js
const user = await API.login('admin@example.com', 'password123');
```

## 3. Crear producto (POST - requiere auth)
```js
const newProduct = await API.createProduct({
    name: 'Nuevo Producto',
    description: 'Descripción',
    price: 99.99
});
```

## 4. Eliminar producto (DELETE - requiere auth + admin)
```
await API.deleteProduct(1);
```

## 5. Añadir a lista personal (POST - requiere auth)
```
await API.addToMyList(5);
```
