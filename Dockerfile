# -----------------------
# 1. Base PHP image
# -----------------------
FROM php:8.2-fpm

# -----------------------
# 2. Install system dependencies
# -----------------------
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    libzip-dev

# -----------------------
# 3. Install PHP extensions required for Laravel
# -----------------------
RUN docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd

# -----------------------
# 4. Install Composer
# -----------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# -----------------------
# 5. Set working directory
# -----------------------
WORKDIR /var/www

# -----------------------
# 6. Copy project files
# -----------------------
COPY . .

# -----------------------
# 7. Install dependencies
# -----------------------
RUN composer install --no-dev --optimize-autoloader

# -----------------------
# 8. Set permissions
# -----------------------
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# -----------------------
# 9. Final CMD
# -----------------------
CMD ["php-fpm"]
