# joomla-cypress-boilerplate
Base cypress para realizar tests de mis extensiones en Joomla.

Este repositorio lo he creado a partir del [proyecto de Joomla](https://github.com/joomla/joomla-cms/tree/4.4-dev/tests/System)

## Requisitos

- Es imprescindible para que funcione que hayas añadido al fichero /etc/hosts el mapeo de 127.0.0.1 al nombre utilizado en la configuración.

```bash
# Si JOOMLA_VIRTUAL_HOST=joomla.local en el fichero .env
127.0.0.1   joomla.local
```

## Como usar cypress

https://docs.cypress.io/guides/overview/why-cypress para ver la documentación de cypress.

Desde la línea de comandos se puede empezar con el comando:

```bash
npx cypress open
```