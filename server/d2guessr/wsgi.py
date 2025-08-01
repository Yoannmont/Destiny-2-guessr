"""
WSGI config for d2guessr project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "d2guessr.settings")  # noqa
os.environ.setdefault("DJANGO_CONFIGURATION", "Dev")  # noqa

from configurations.wsgi import get_wsgi_application

application = get_wsgi_application()
