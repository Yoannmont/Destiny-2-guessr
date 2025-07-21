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


# Copy dependency files to leverage Docker cache
COPY requirements.lock requirements.lock


RUN uv pip sync requirements.lock

COPY bin/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh


COPY . .

RUN mkdir -p logs

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["sh", "-c", ".venv/bin/python manage.py collectstatic --noinput && .venv/bin/gunicorn d2guessr.wsgi:application --bind 0.0.0.0:8000"]

