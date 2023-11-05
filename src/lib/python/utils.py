import sys
import winreg
import os

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


def get_tesseract_path():
    key = winreg.OpenKey(
        winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Tesseract-OCR", 0, winreg.KEY_READ
    )
    tesseract_path, _ = winreg.QueryValueEx(key, "InstallDir")
    winreg.CloseKey(key)
    return os.path.join(tesseract_path, "tesseract.exe")
