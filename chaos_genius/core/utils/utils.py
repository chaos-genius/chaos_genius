import random
import string


def randomword(length: int) -> str:
    """Return a random word of specified length."""
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for _ in range(length))
