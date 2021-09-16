import os
import shutil
import click

def cg_print(info, color=None):
    click.echo(info)


def which(program):
    """Find the program executable
    """
    _executable = shutil.which(program)
    if not _executable:
        raise ValueError(f"Executable {program} not found")

    return _executable


def is_file_exists(file_path, is_relative=True):
    if is_relative:
        file_path = os.path.join(os.getcwd(), file_path)
    if not os.path.exists(file_path):
        return False
    return file_path
