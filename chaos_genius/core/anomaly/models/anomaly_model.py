import os


class AnomalyModel(object):
    def __init__(self, *args, **kwargs) -> None:
        pass

    def save(self, *args, **kwargs):
        raise NotImplementedError

    def load(self, *args, **kwargs):
        raise NotImplementedError

    def check_and_make_path(self, file_path):
        dir_path, _ = file_path.rsplit('/', 1)
        try:
            os.makedirs(dir_path)
        except FileExistsError:
            pass
