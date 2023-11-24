include .env
.PHONY: help
DESCRIPCION=Antes de ejecutar cualquiera de los comandos deberás asegurarte de lo siguente:
DESC_ENV=- Debes tener fichero con variables de entorno .env. Puedes utilizar el comando: \033[36mcp .env.dist .env\033[0m\n  Posteriormente deberás adaptar la configuración de las variables del fichero.
DESC_CARPETA=- Comprueba que el nombre de esta carpeta no contiene espacios y todas sus letras en minúscula.
BASE_NAME = $(shell basename $(PWD))
DB_CONTAINER=${BASE_NAME}_joomladb_1
JOOMLA_CONTAINER=$(BASE_NAME)_joomla_cms_1
PHPMYADMIN_CONTAINER=$(BASE_NAME)_php_myadmin_1
JOOMLA_CONTAINER_EXISTS = $(shell docker ps -q -f name=${BASE_NAME})
EXT_FILENAME=$(shell basename ${EXT_FULLNAME})
ALL_ZIPS=$(shell find $(EXT_FOLDER) -type f)
DB_VOLUMEN_NAME=$(shell basename $(PWD))_mysql_db
JOOMLA_VOLUME_NAME=$(shell basename $(PWD))_joomla_data
CURRENT_USER := $(shell id -un)
CURRENT_GROUP := $(shell id -gn)
CURRENT_UID := $(shell id -u):$(shell id -g)
# Colores de texto de la consola
BLANCO=\033[0m
VERDE=\033[32m
MARRON=\033[33m
AZUL=\033[34m
ROJO=\033[31m
CYAN=\033[36m
AMARILLO=\033[1;33m

# Crear puertos aleatorio
RANDOM_PORT_SUFFIX := $(shell shuf -i 100-999 -n 1)
MYSQL_PORT ?= 36${RANDOM_PORT_SUFFIX}
JOOMLA_PORT ?= 37${RANDOM_PORT_SUFFIX}
PHPMYADMIN_PORT ?= 38${RANDOM_PORT_SUFFIX}

# Mostrar datos al usuario
SHOW_DATA = 1

export MYSQL_PORT
export JOOMLA_PORT
export PHPMYADMIN_PORT
export CURRENT_UID
export CURRENT_USER
export CURRENT_GROUP

# Comprobar el plugin de docker compose instalado
ifneq ($(shell docker compose --version | grep "version"), "")
	DOCKER_COMPOSE_COMMAND := "docker-compose"
else ifneq ($(shell docker compose version | grep "version"), "")
	DOCKER_COMPOSE_COMMAND := "docker compose"
endif

help: ##		Muestra esta pantalla de ayuda
	@awk 'BEGIN {FS = ":.*##"; \
	printf "\n${DESCRIPCION}\n${DESC_ENV}\n${DESC_CARPETA}\n\nUso:\n  make \033[36m<opcion>\033[0m\n\n\
	Opciones:\n"} \
	/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)\

check_all: check_node

check_node:
ifeq ($(wildcard ./node_modules/*),)
	@npm ci
endif

routes:
ifeq (${SHOW_DATA},1)
	@echo "\n\tDebes añadir:" && \
	echo "\t${AZUL}127.0.0.1\t${JOOMLA_VIRTUAL_HOST}${BLANCO}" && \
	echo "\tal fichero ${AMARILLO}/etc/hosts${BLANCO}" && \
	echo "\n\n\tJoomla:" && \
	echo "\t\t${VERDE}http://${JOOMLA_VIRTUAL_HOST}${BLANCO}" && \
	echo "\t\t${VERDE}http://localhost:$${JOOMLA_PORT}${BLANCO}" && \
	echo "\tPhpMyAdmin:" && \
	echo "\t\t${VERDE}http://localhost:$${PHPMYADMIN_PORT}${BLANCO}\n\n"
else
	@echo ""
endif

up_containers: down
	@${DOCKER_COMPOSE_COMMAND} up -d

down: ## 		Para todos los contenedores (mysql, phpmyadmin y joomla)
ifneq ($(JOOMLA_CONTAINER_EXISTS),)
	@${DOCKER_COMPOSE_COMMAND} stop && ${DOCKER_COMPOSE_COMMAND} rm -f
endif

up: up_containers routes ## 		Levanta contenedores mysql, phpmyadmin y joomla

install_joomla: check_all clean_installation up_containers ## 	Instala joomla en el contenedor desde 0, junto con las extensiones. Previamente se eliminan volúmenes existentes
	@sleep 10 && \
	npx cypress run -s test/cypress/e2e/install/**.cy.js && \
	make install_extensions && \
	if test -d ./test/cypress/e2e/mi_install; then \
		npx cypress run -s test/cypress/e2e/mi_install/**/**.cy.js; \
	fi; \
	make routes

clean_installation: down
	@docker volume rm ${DB_VOLUMEN_NAME} && \
	rm -rf ./joomla/

cp_extensions:
	@docker cp ${EXT_FULLNAME} ${JOOMLA_CONTAINER}:/var/www/html/tmp/ && \
	docker exec -it --user ${CURRENT_UID} ${JOOMLA_CONTAINER} php cli/joomla.php extension:install --path ./tmp/${EXT_FILENAME}

install_extensions: pack_extensions ## 	Instala todas las extensiones en Joomla
	@if test -d ${EXT_FOLDER}; then \
		echo "Instalando extensiones ..."; \
		for f in ${ALL_ZIPS} ; do \
			make cp_extensions EXT_FULLNAME=$${f} ; \
		done ; \
	else \
		echo "No existe la carpeta ${EXT_FOLDER}" con extensiones para instalar; \
	fi;

pack_extensions: check_all ## 	Crea los ficheros de instalación de las extensiones en la carpeta definida en el fichero .env
	@if test -f ./extensions-config.json; then \
		cd ./extension2joomla && \
		echo "Preparando extensiones propias para instalar ..."; \
		gulp release; \
	fi;

develop: ##		Empieza a desarrollar en tus extensiones (los cambios aplicados en tus extensiones serán aplicados en el árbol de ficheros de Joomla)
	@gulp
