# settings.py

INSTALLED_APPS = [
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# Allow all origins (not recommended for production)
CORS_ALLOW_ALL_ORIGINS = True

# OR

# Allow specific origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",  # Add your front-end URL here
]

CORS_ALLOW_HEADERS = '*'  # Allow all headers

# Optional: Allow credentials
CORS_ALLOW_CREDENTIALS = True