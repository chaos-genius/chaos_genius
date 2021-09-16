from chaos_genius.extensions import celery as celery_ext
from chaos_genius.extensions import db

celery = celery_ext.celery


@celery.task
def print_hello():
    print('------------------------')
    print('--->>> Hello Task <<<---')
    print(db)
    return True


@celery.task
def add_together(a, b):
    return a + b
