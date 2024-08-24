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

# Instala php-cli
# RUN apt-get install -y php-cli

# Instala Xdebug y Memcached
RUN pecl install xdebug memcached pcov \
    && docker-php-ext-enable xdebug memcached pcov

# Instala Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
