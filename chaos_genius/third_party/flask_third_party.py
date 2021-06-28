from flask import current_app, _app_ctx_stack
from chaos_genius.third_party.third_party_client import ThirdPartyClient


class FlaskThirdParty(object):
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.config.setdefault('THIRD_PARTY_CONFIG', '')
        app.teardown_appcontext(self.teardown)

    def connect(self):
        config = current_app.config['THIRD_PARTY_CONFIG']
        return ThirdPartyClient()

    def teardown(self, exception):
        ctx = _app_ctx_stack.top
        if hasattr(ctx, 'third_party_client'):
            pass
            # ctx.third_party_client.close()

    @property
    def connection(self):
        ctx = _app_ctx_stack.top
        if ctx is not None:
            if not hasattr(ctx, 'third_party_client'):
                ctx.third_party_client = self.connect()
            return ctx.third_party_client
