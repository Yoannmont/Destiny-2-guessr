FROM python:3.12-slim

WORKDIR /server

# Install build dependencies (C compiler)
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.lock .

RUN pip install uv

# Create a virtual environment using uv
RUN uv venv

# Add the virtual environment's bin folder to PATH
ENV PATH="/app/env/bin:$PATH"

# Copy dependency files to leverage Docker cache
COPY requirements.lock requirements.lock


RUN uv pip sync requirements.lock


COPY . .
RUN mkdir -p logs

EXPOSE 8000


CMD ["sh", "-c", ".venv/bin/python manage.py collectstatic --noinput && .venv/bin/gunicorn d2guessr.wsgi:application --bind 0.0.0.0:8000"]

