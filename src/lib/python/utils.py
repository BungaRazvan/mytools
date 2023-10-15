import sys


def cleanup(signum, frame):
    # Perform cleanup here (if needed)
    sys.exit(0)


def send_to_electron(data: str) -> None:
    print(data)
    # flush stdout imediatly
    sys.stdout.flush()
