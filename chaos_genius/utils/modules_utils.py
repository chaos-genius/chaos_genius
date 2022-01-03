# TODO: Fix this with validation from the CG key
import re
from cryptography.fernet import Fernet
from chaos_genius.settings import CHAOSGENIUS_ENTERPRISE_EDITION_KEY, SECRET_KEY


def is_enterprise_edition():
    """
    Checks if the current installation is the enterprise edition.
    :return: True if the current installation is the enterprise edition.
    """
    try:
        f = Fernet(SECRET_KEY)
        LICENSE_REGEX = re.compile(r"^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$", re.IGNORECASE)
        decrypted_license = f.decrypt(CHAOSGENIUS_ENTERPRISE_EDITION_KEY.encode())
        if LICENSE_REGEX.match(decrypted_license.decode()):
            return True
        else:
            return False
    except Exception as err:
        return False
