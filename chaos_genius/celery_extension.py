from flask import current_app, _app_ctx_stack
from celery import Celery
from celery import current_app as current_celery_app
import chaos_genius.celery_config as celeryconfig

class CeleryExtension(object):
    """Celery Extension for the Application Factory Pattern"""

    def __init__(self, app=None):
        """Initialise the Celery Extension"""
        self.celery = None
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """Initialise the Flask application"""
        # app.config.setdefault('CELERY_EXTENSION', '')
        # app.teardown_appcontext(self.teardown)
        self.celery = make_celery(app)

    def teardown(self, exception):
        pass


def make_celery(app):
    # import pdb; pdb.set_trace()
    # if current_celery_app:
    #     celery = current_celery_app
    # else:
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)
    celery.config_from_object(celeryconfig)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    class MyTask(celery.Task):
        def on_failure(self, exc, task_id, args, kwargs, einfo):
            print('{0!r} failed: {1!r}'.format(task_id, exc))


    celery.Task = ContextTask

    return celery

