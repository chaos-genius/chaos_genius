from flask import current_app, _app_ctx_stack
from chaos_genius.airbyte.airbyte_client import AirByteClient


class FlaskAirByte(object):
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.config.setdefault('AIRBYTE_CONFIG', '')
        app.teardown_appcontext(self.teardown)

    def connect(self):
        config = current_app.config['AIRBYTE_CONFIG']
        return AirByteClient()

    def teardown(self, exception):
        ctx = _app_ctx_stack.top
        if hasattr(ctx, 'airbyte_client'):
            pass
            # ctx.airbyte_client.close()

    @property
    def connection(self):
        ctx = _app_ctx_stack.top
        if ctx is not None:
            if not hasattr(ctx, 'airbyte_client'):
                ctx.airbyte_client = self.connect()
            return ctx.airbyte_client
