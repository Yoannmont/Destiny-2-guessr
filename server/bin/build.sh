ls -al
pwd

echo installing dependencies
pip install -r server/requirements.lock

echo activating env
source server/env/bin/activate

echo collecting staticfiles
python manage.py collectstatic --no-input --clear
