include .env
.PHONY: help
DESCRIPCION=Antes de ejecutar cualquiera de los comandos deberás crear un fichero .env
DB_CONTAINER=${JOOMLA_DB_HOST}
JOOMLA_CONTAINER=joomla_cms
PHPMYADMIN_CONTAINER=phpmyadmin
EXT_FILENAME=$(shell basename ${EXT_FULLNAME})
ALL_ZIPS=$(shell find $(EXT_FOLDER) -type f)
DB_VOLUMEN_NAME=$(shell basename $(PWD))_mysql_db
JOOMLA_VOLUME_NAME=$(shell basename $(PWD))_joomla_data

help: ## Muestra esta pantalla de ayuda
	@awk 'BEGIN {FS = ":.*##"; \
	printf "\n${DESCRIPCION}\n\nUso:\n  make \033[36m<objetivo>\033[0m\n\n\
	Objetivos:\n"} \
	/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)\

up_containers: ## Levanta contenedores con instalación limpia de Joomla
	@docker-compose stop && docker-compose rm -f && docker-compose up -d

cypress_install: ## Instala joomla en el contenedor desde 0, junto con las extensiones. Previamente se eliminan volúmenes existentes
	@make clean_installation && \
	make up_containers && \
	make up_containers && \
	npx cypress run -s test/cypress/e2e/install/**.cy.js && \
	make install_extensions \

clean_installation: up_containers ## Limpia los contenedores para re-instalar Joomla
	@docker-compose down && \
	docker volume rm ${DB_VOLUMEN_NAME} && \
	docker volume rm ${JOOMLA_VOLUME_NAME}

cp_extensions: ## Copia las extensiones en la carpeta tmp de Joomla
	@docker cp ${EXT_FULLNAME} ${JOOMLA_CONTAINER}:/var/www/html/tmp/ && \
	docker exec -it ${JOOMLA_CONTAINER} php cli/joomla.php extension:install --path ./tmp/${EXT_FILENAME}

install_extensions: empaqueta_extensiones ## Instala todas las extensiones en Joomla
	for f in ${ALL_ZIPS} ; do \
		make cp_extensions EXT_FULLNAME=$${f} ; \
	done

empaqueta_extensiones: ## Crea los ficheros de instalación de las extensiones
	@cd ./extension2joomla && gulp release
	
