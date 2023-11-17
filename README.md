# Joomla Test Boilerplate

## Desarrollo de extensiones para Joomla con entorno de pruebas

### Contenido

- docker-compose con contenedores para iniciar una instalación limpia de Joomla, útil para el desarrollo de extensiones personalizadas. Los contenedores que se inician son:
    - MySql para los datos de Joomla
    - PhpMyadmin con acceso a la base de datos de Joomla
    - Servidor Apache para la instalación de Joomla
- Carpeta test para automatizar las pruebas. Actualmente he añadido cypress, partiendo de la configuración utilizada por el equipo de desarrollo de Joomla, realizando unas pequeñas modificaciones para adaptar a este repositorio.
- Carpeta extension2joomla. Esta carpeta es una modificación de mi repositorio para desarrollo de extensiones en joomla. Permite añadir las carpetas con el código de mis extensiones en una ruta fuera del árbol de ficheros de joomla. Los beneficios son que puedo tener agrupado todo el código de mis extensiones en una carpeta que fácilmente puedo añadir a un repositorio.

## Requisitos

- SO Ubuntu 22.04, aunque no he realizado pruebas en otros sistemas operativos, pero probablemente funcione en MAC
- Nodejs (https://nodejs.org/)
- Make (https://www.gnu.org/software/make/)
- Docker (https://docs.docker.com/desktop/)
- docker-compose (https://docs.docker.com/compose/install/)

## Uso

Antes de nada copia y pega el fichero de environments, y adapta a tu configuración:

```bash
cp .env.dist .env
```

Es necesario cargar los paquetes de node con el comando:

```bash
npm ci
```

El fichero Makefile contiene una serie de scripts que permiten automatizar muchas cosas. Para saber las posibles opciones solo tienes que escribir en línea de comandos:

```bash
make help
```

Mostrará la lista de opciones con un pequeño resumen por opción.

## Instalar joomla en localhost

Con el comando `make cypress_install` realiza una instalación de joomla en la versión y con los datos expecificados en el fichero `.env` 