#! /FlaskApp/venv/bin/python3
import sys
import logging
logging.basicConfig(stream=sys.stderr)
#sys.path.insert(0, "/usr/lib/python3")
sys.path.insert(0,"/var/www/FlaskApp/")
sys.path.insert(1, "/var/www/FlaskApp/FlaskApp/venv/lib/python3.5/site-packages")
sys.path.insert(2, "/usr/lib/python3")
sys.path.insert(3, "/home/b15root/.local/lib/python3.5/site-packages")

from FlaskApp import app as application
application.secret_key = 'notverysecret'
