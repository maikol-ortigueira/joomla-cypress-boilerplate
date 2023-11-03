include .env
.PHONY: help
DESCRIPCION=Antes de ejecutar cualquiera de los comandos deberás crear un fichero .env
DB_CONTAINER=${JOOMLA_DB_HOST}
JOOMLA_CONTAINER=mi_joomla
PHPMYADMIN_CONTAINER=phpmyadmin
EXT_FILENAME=$(shell basename ${EXT_FULLNAME})
ALL_ZIPS=$(shell find $(EXT_FOLDER) -type f)

help: ## Muestra esta pantalla de ayuda
	@awk 'BEGIN {FS = ":.*##"; \
	printf "\n${DESCRIPCION}\n\nUso:\n  make \033[36m<objetivo>\033[0m\n\n\
	Objetivos:\n"} \
	/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)\

prueba: ## Prueba recorrer lista de ficheros
	for f in ${ALL_ZIPS} ; do \
		TMP=$(basename $(f)) ; \
	done

run_db: ## Inicia el contenedor de MySql
ifeq ($(shell docker ps -f 'name=${DB_CONTAINER}' --format '{{json .Names}}'),"${DB_CONTAINER}")
	@docker stop ${DB_CONTAINER} && docker rm -f ${DB_CONTAINER};
endif
	@docker run --name ${DB_CONTAINER} \
	-e MYSQL_ROOT_PASSWORD=${JOOMLA_DB_PASSWORD} \
	-e MYSQL_DATABASE=${JOOMLA_DB_NAME} \
	-p ${JOOMLA_DB_PORT}:3306 \
	-d \
	mysql:${MYSQL_VERSION} \
	--default-authentication-plugin=mysql_native_password

run_phpmyadmin: run_db ## Inicia el contenedor de PhpMyadmin
ifeq ($(shell docker ps -f 'name=${PHPMYADMIN_CONTAINER}' --format '{{json .Names}}'),"${PHPMYADMIN_CONTAINER}")
	@docker stop ${PHPMYADMIN_CONTAINER} && docker rm -f ${PHPMYADMIN_CONTAINER};
endif
	@docker run --name ${PHPMYADMIN_CONTAINER} \
	--link ${DB_CONTAINER}:db \
	-p ${PHPMYADMIN_PORT}:80 \
	-e MYSQL_ROOT_PASSWORD=${JOOMLA_DB_PASSWORD} \
	-d \
	phpmyadmin:latest

cypress_install: run_joomla ## Instala joomla en el contenedor, junto con las extensiones
	@npx cypress run -s test/cypress/e2e/install/**.cy.js && \
	make cp_extensions && \
	make cp_extensions EXT_FULLNAME=./test/cypress/fixtures/com_odt/extensions/pkg_jce_2951.zip

run_joomla: run_phpmyadmin ## Inicia el contenedor de MySql y posteriormente Joomla
ifeq ($(shell docker ps -f 'name=${JOOMLA_CONTAINER}' --format '{{json .Names}}'),"${JOOMLA_CONTAINER}")
	@docker stop ${JOOMLA_CONTAINER} && docker rm -f ${JOOMLA_CONTAINER};
endif
	@docker run --name ${JOOMLA_CONTAINER} \
	--link ${DB_CONTAINER} \
	-e JOOMLA_DB_USER=${JOOMLA_DB_USER} \
	-e JOOMLA_DB_PASSWORD=${JOOMLA_DB_PASSWORD} \
	-e JOOMLA_DB_NAME=${JOOMLA_DB_NAME} \
	-e JOOMLA_DB_HOST=${DB_CONTAINER} \
	-p ${JOOMLA_PORT}:80 \
	-v ./src:/var/www/html \
	-d \
	joomla:${JOOMLA_VERSION}-php${PHP_VERSION}-apache

reinstall_joomla: ## Reinicia la instalación de joomla
	@docker exec -it ${JOOMLA_CONTAINER} rm -rf ./* && \
	make run_joomla && \
	make cypress_install

cp_extensions: ## Copia las extensiones en la carpeta tmp de Joomla
	@docker cp ${EXT_FULLNAME} ${JOOMLA_CONTAINER}:/var/www/html/tmp/ && \
	docker exec -it ${JOOMLA_CONTAINER} php cli/joomla.php extension:install --path ./tmp/${EXT_FILENAME}

install_extensions: ## Prueba recorrer lista de ficheros
	echo ${ALL_ZIPS}

git_clone_extension2joomla: ## Añadir el repositorio a la carpeta de pruebas
	@git clone git@github.com:maikol-ortigueira/extension2joomla.git
