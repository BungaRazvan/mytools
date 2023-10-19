import sys

from requests import get


def cleanup(signum, frame):
    # Perform cleanup here (if needed)
    sys.exit(0)


def send_to_electron(data: str) -> None:
    print(data)
    # flush stdout imediatly
    sys.stdout.flush()


def save_image(img_name, img_url, save_path):
    with open(f"{save_path}/{img_name}", "wb") as f:
        f.write(get(img_url).content)
