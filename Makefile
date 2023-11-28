include .env

# Obtiene el sistema operativo
OS := $(shell uname)
ifeq ($(OS), Linux)
    # Reglas específicas para Linux
	DOCKER_COMPOSE_APPEND := docker-compose.linux.yml
	RANDOM_PORT_SUFFIX := $(shell shuf -i 100-999 -n 1)

else ifeq ($(OS), Darwin)
    # Reglas específicas para macOS
	DOCKER_COMPOSE_APPEND := docker-compose.mac.yml
	RANDOM_PORT_SUFFIX := $(shell awk 'BEGIN {srand(); print int(100 + rand() * 900)}')

else ifeq ($(OS), Windows_NT)
    # Reglas específicas para Windows
else
    # Reglas por defecto para sistemas no reconocidos
    all:
        @echo "Sistema operativo no reconocido: $(OS)"
endif

.PHONY: help
# Datos a mostrar en el help de makefile
DESCRIPCION=Antes de ejecutar cualquiera de los comandos deberás asegurarte de lo siguente:
DESC_ENV=- Debes tener fichero con variables de entorno .env. Puedes utilizar el comando: \033[36mcp .env.dist .env\033[0m\n  Posteriormente deberás adaptar la configuración de las variables del fichero.
DESC_CARPETA=- Comprueba que el nombre de esta carpeta no contiene espacios y todas sus letras en minúscula.

# Comprobación docker
DOCKER_DAEMON_RUNNING := $(shell docker info > /dev/null 2>&1 && echo "yes" || echo "no")

# Variables para generar los contenedores
BASE_NAME = $(shell basename $(PWD))
DB_CONTAINER=${BASE_NAME}-joomladb-1
JOOMLA_CONTAINER=$(BASE_NAME)-joomla_cms-1
PHPMYADMIN_CONTAINER=$(BASE_NAME)-php_myadmin-1
JOOMLA_CONTAINER_EXISTS = $(shell docker ps -q -f name=${BASE_NAME})
DB_VOLUMEN_NAME=${BASE_NAME}_mysql_db

EXT_FILENAME=$(shell basename ${EXT_FULLNAME})
ALL_ZIPS=$(shell find $(EXT_FOLDER) -type f)

# Gestión de usuarios del contenedor de Joomla
CURRENT_USER := $(shell id -un)
CURRENT_GROUP := $(shell id -gn)
CURRENT_UID := $(shell id -u):$(shell id -g)
MI_UID := $(shell id -u)
MI_GID := $(shell id -g)

# Colores de texto de la consola
BLANCO=\033[0m
VERDE=\033[32m
MARRON=\033[33m
AZUL=\033[34m
ROJO=\033[31m
CYAN=\033[36m
AMARILLO=\033[1;33m

# Crear puertos aleatorios
MYSQL_PORT ?= 36${RANDOM_PORT_SUFFIX}
JOOMLA_PORT ?= 37${RANDOM_PORT_SUFFIX}
PHPMYADMIN_PORT ?= 38${RANDOM_PORT_SUFFIX}

export MYSQL_PORT
export JOOMLA_PORT
export PHPMYADMIN_PORT
export CURRENT_UID
export CURRENT_USER
export CURRENT_GROUP
export MI_UID
export MI_GID
export DB_CONTAINER
export JOOMLA_CONTAINER
export PHPMYADMIN_CONTAINER

# Comprobar el plugin de docker compose instalado
ifeq (${DOCKER_DAEMON_RUNNING}, yes)
	ifneq ($(shell command -v docker-compose 2> /dev/null),)
		DOCKER_COMPOSE_COMMAND = docker-compose
	else ifneq ($(shell command -v docker compose 2> /dev/null),)
		DOCKER_COMPOSE_COMMAND = docker compose
	endif
endif

help: ##		Muestra esta pantalla de ayuda
	@awk 'BEGIN {FS = ":.*##"; \
	printf "\n${DESCRIPCION}\n${DESC_ENV}\n${DESC_CARPETA}\n\nUso:\n  make \033[36m<opcion>\033[0m\n\n\
	Opciones:\n"} \
	/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)\

check_docker:
	@if [ -n "$(shell command -v docker)" ]; then \
        echo "Docker está instalado"; \
    else \
        echo "Docker no está instalado. Instale Docker para continuar."; \
        exit 1; \
    fi

check_docker_daemon:
	@if [ "${DOCKER_DAEMON_RUNNING}" = "no" ]; then \
        echo "Error: El daemon de Docker no está en ejecución."; \
        echo "Por favor, inicia el daemon de Docker para continuar."; \
        exit 1; \
    else \
        echo "El daemon de Docker está en ejecución. Continuando..."; \
    fi

prueba:
	@echo ${RANDOM_PORT_SUFFIX}
	@echo ${OS}

check_all: check_node check_docker check_docker_daemon

check_node:
ifeq ($(wildcard ./node_modules/*),)
	@npm ci
endif

routes:
	@echo "\n\tDebes añadir:" && \
	echo "\t${AZUL}127.0.0.1\t${JOOMLA_VIRTUAL_HOST}${BLANCO}" && \
	echo "\tal fichero ${AMARILLO}/etc/hosts${BLANCO}" && \
	echo "\n\n\tJoomla:" && \
	echo "\t\t${VERDE}http://${JOOMLA_VIRTUAL_HOST}${BLANCO}" && \
	echo "\t\t${VERDE}http://localhost:$${JOOMLA_PORT}${BLANCO}" && \
	echo "\tPhpMyAdmin:" && \
	echo "\t\t${VERDE}http://localhost:$${PHPMYADMIN_PORT}${BLANCO}\n\n"

up_containers: down
	@${DOCKER_COMPOSE_COMMAND} -f docker-compose.yml -f ${DOCKER_COMPOSE_APPEND} up -d

down: check_all ## 		Para todos los contenedores (mysql, phpmyadmin y joomla)
ifneq ($(JOOMLA_CONTAINER_EXISTS),)
	@${DOCKER_COMPOSE_COMMAND} stop && ${DOCKER_COMPOSE_COMMAND} rm -f
endif

up: check_docker_daemon up_containers check_joomla_installed routes ## 		Levanta contenedores mysql, phpmyadmin y joomla

clean_installation: down
	@if [ -n "$(shell docker volume ls -q -f name="${DB_VOLUMEN_NAME}")" ]; then \
		docker volume rm ${DB_VOLUMEN_NAME} && \
		rm -rf ./joomla_data/; \
	fi 

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

check_joomla_installed:
	@if [ -f ./joomla_data/configuration.php ]; then \
		exit 0; \
	else \
		$(MAKE) check_joomla_installation; \
	fi;

check_joomla_installation:
	@echo -n "\n${VERDE}Instalando Joomla ${BLANCO}..."
	@i=1; while [ $$i -le 40 ]; do \
		if [ ! -d ./joomla_data/installation ] && [ -f ./joomla_data/configuration.php ]; then \
			echo "\nSe ha instalado Joomla correctamente"; \
			exit 0; \
		fi; \
		echo -n "."; \
		i=$$((i + 1)); \
		sleep 1; \
	done; \
	echo "\nHa habido algún problema en la instalación de Joomla"; \
	exit 1; \

cypress_open:
	@npx cypress open

