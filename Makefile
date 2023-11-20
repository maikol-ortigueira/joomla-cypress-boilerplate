include .env
.PHONY: help
DESCRIPCION=Antes de ejecutar cualquiera de los comandos deberás crear un fichero .env
BASE_NAME = $(shell basename $(PWD))
DB_CONTAINER=${BASE_NAME}_joomladb_1
JOOMLA_CONTAINER=$(BASE_NAME)_joomla_cms_1
PHPMYADMIN_CONTAINER=$(BASE_NAME)_php_myadmin_1
EXT_FILENAME=$(shell basename ${EXT_FULLNAME})
ALL_ZIPS=$(shell find $(EXT_FOLDER) -type f)
DB_VOLUMEN_NAME=$(shell basename $(PWD))_mysql_db
JOOMLA_VOLUME_NAME=$(shell basename $(PWD))_joomla_data
CURRENT_USER := $(shell id -un)
CURRENT_GROUP := $(shell id -gn)
CURRENT_UID := $(shell id -u):$(shell id -g)

export CURRENT_UID
export CURRENT_USER
export CURRENT_GROUP

# Comprobar el plugin de docker compose instalado
ifneq ($(shell docker compose --version | grep "version"), "")
	DOCKER_COMPOSE_COMMAND := "docker-compose"
else ifneq ($(shell docker compose version | grep "version"), "")
	DOCKER_COMPOSE_COMMAND := "docker compose"
endif

help: ## Muestra esta pantalla de ayuda
	@awk 'BEGIN {FS = ":.*##"; \
	printf "\n${DESCRIPCION}\n\nUso:\n  make \033[36m<objetivo>\033[0m\n\n\
	Objetivos:\n"} \
	/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)\

up_containers: stop_containers ## Levanta contenedores con instalación limpia de Joomla
	@${DOCKER_COMPOSE_COMMAND} up -d

cypress_install: ## Instala joomla en el contenedor desde 0, junto con las extensiones. Previamente se eliminan volúmenes existentes
	@make clean_installation && \
	${DOCKER_COMPOSE_COMMAND} up -d && \
	sleep 10 && \
	npx cypress run -s test/cypress/e2e/install/**.cy.js && \
	make install_extensions && \
	if test -d ./test/cypress/e2e/mi_install; then \
		npx cypress run -s test/cypress/e2e/mi_install/**/**.cy.js; \
	fi;

clean_installation: stop_containers ## Limpia los contenedores para re-instalar Joomla
	@docker volume rm ${DB_VOLUMEN_NAME} && \
	rm -rf ./joomla/

stop_containers: ## Para los contenedores
	@if [ "$(shell docker container inspect -f '{{.State.Running}}' ${JOOMLA_CONTAINER} )" = "true" ]; then \
		${DOCKER_COMPOSE_COMMAND} stop && ${DOCKER_COMPOSE_COMMAND} rm -f; \
	fi; \


cp_extensions: ## Copia las extensiones en la carpeta tmp de Joomla
	@docker cp ${EXT_FULLNAME} ${JOOMLA_CONTAINER}:/var/www/html/tmp/ && \
	docker exec -it --user ${CURRENT_UID} ${JOOMLA_CONTAINER} php cli/joomla.php extension:install --path ./tmp/${EXT_FILENAME}

install_extensions: empaqueta_extensiones ## Instala todas las extensiones en Joomla
	@if test -d ${EXT_FOLDER}; then \
		echo "Instalando extensiones ..."; \
		for f in ${ALL_ZIPS} ; do \
			make cp_extensions EXT_FULLNAME=$${f} ; \
		done ; \
	else \
		echo "No existe la carpeta ${EXT_FOLDER}" con extensiones para instalar; \
	fi;

empaqueta_extensiones: ## Crea los ficheros de instalación de las extensiones
	@cd ./extension2joomla && \
	if test -f extensions-config.json; then \
		echo "Preparando extensiones propias para instalar ..."; \
		gulp release; \
	fi;
