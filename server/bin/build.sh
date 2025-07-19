echo installing dependencies
pip install -r requirements.lock

echo activating env
source env/bin/activate

echo collecting staticfiles
python manage.py collectstatic --no-input --clear