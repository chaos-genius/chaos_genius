from chaos_genius.app import create_app

def before_all(context):
    context.app = create_app()