# joomla-cypress-boilerplate
Base cypress para realizar tests de mis extensiones en Joomla.

Este repositorio lo he creado a partir del [proyecto de Joomla](https://github.com/joomla/joomla-cms/tree/4.4-dev/tests/System)

## Requisitos

- Ubuntu 22.04
- Nodejs

Para que las pruebas funcionen correctamente es fundamental que se realicen contra una instalación limpia de Joomla (4 ó 5) en un entorno local.

## Instalación

1. Instalar Joomla en un entorno local. Se debe tener en cuenta los parámetros de configuración del fichero `cypress.config.js` (se creará a partir del fichero `cypress.config.dist.js`)

```javascript
  env: {
    sitename: 'Joomla CMS Test',
    name: 'jane doe',
    email: 'admin@example.com',
    username: 'ci-admin',
    password: 'joomla-17082005',
    db_type: 'MySQLi',
    db_host: '127.0.0.1',
    db_port: '',
    db_name: 'test_joomla_4',
    db_user: 'root',
    db_password: '',
    db_prefix: 'jos_',
    smtp_host: 'localhost',
    smtp_port: '1025',
    cmsPath: '.',
  },
```

2. Instalar extensiones a probar en Joomla directamente desde el backend.

3. Actualizar paquetes de Node con el comando:

```bash
npm ci
```

4. Crear una copia del fichero de configuración:

```bash
cp cypress.config.dist.js cypress.config.js
```

5. Modificar los parámetros en el fichero de configuración, especialmente los siguientes:

```javascript
// URL de la instalación de Joomla para las pruebas
baseUrl: 'http://localhost' // Sustituir http://localhost

// Datos del superusuario en la instalación de Joomla
name: 'jane doe',
email: 'admin@example.com',
username: 'ci-admin',
password: 'joomla-17082005',


// Comprobar conexión a la BBDD
db_type: 'MySQLi',
db_host: '127.0.0.1',
db_port: '',
db_name: 'test_joomla_4',
db_user: 'root',
db_password: '',
db_prefix: 'jos_',

// Ruta absoluta o relativa a la instalación de Joomla en el servidor local
cmsPath: '.',


```

6. Es importante para que todo funcione como es debido que el parámetro `$secret` en el fichero `configuration.php` de la instalación de Joomla tenga el valor `tEstValue`

```php
public $secret = 'tEstValue';
```
