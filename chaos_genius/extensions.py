# -*- coding: utf-8 -*-
"""Extensions module. Each extension is initialized in the app factory located in app.py."""
from flask_bcrypt import Bcrypt
from flask_caching import Cache
from flask_debugtoolbar import DebugToolbarExtension
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_static_digest import FlaskStaticDigest
# from flask_wtf.csrf import CSRFProtect
from chaos_genius.third_party.flask_ext_integrations import FlaskThirdParty
from chaos_genius.celery_extension import CeleryExtension

bcrypt = Bcrypt()
# csrf_protect = CSRFProtect()
login_manager = LoginManager()
db = SQLAlchemy()
migrate = Migrate()
cache = Cache()
debug_toolbar = DebugToolbarExtension()
flask_static_digest = FlaskStaticDigest()
integration_connector = FlaskThirdParty()
celery = CeleryExtension()
