echo installing dependencies
pip3.12 install -r ../requirements.lock

echo activating env
source ../env/bin/activate

echo collecting staticfiles
python3.12 ../manage.py collectstatic --no-input --clear
