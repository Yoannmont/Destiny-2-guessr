pip install uv

uv pip sync requirements.lock
source env/bin/activate
python manage.py collectstatic --no-input --clear