# -*- coding: utf-8 -*-
"""Create an application instance."""
from chaos_genius.app import create_app
from chaos_genius.extensions import celery as celery_ext

app = create_app()
celery = celery_ext.celery
