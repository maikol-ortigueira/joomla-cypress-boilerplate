ARG JOOMLA_VERSION
ARG PHP_VERSION

FROM joomla:${JOOMLA_VERSION}-php${PHP_VERSION}-apache

# Instala las dependencias necesarias
RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    libzip-dev \
    libmagickwand-dev \
    libmemcached-dev \
    && docker-php-ext-install zip

# Instala Imagick, Xdebug y Memcached
RUN pecl install imagick xdebug memcached \
    && docker-php-ext-enable imagick xdebug memcached
