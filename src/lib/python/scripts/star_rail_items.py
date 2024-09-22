import re
import cv2
import time
import pytesseract
import signal
import json
import os
import sys

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
sys.path.append(parent_dir)

from grt.image import StarRailRewardsTextImage, StarRailItemsImage
from grt.name_conversion import star_rail_item_name
from utils import cleanup, send_to_electron, get_tesseract_path


def format_text(text):
    # Initialize an empty dictionary
    result_dict = {}
    artifacts = (
        "*",
        ">",
        "�",
        "-",
        "_",
        "»",
        "«",
        "’",
        "'",
        "<",
        "‘",
        "|",
        "~",
        "/",
        "“",
        ":",
        "!",
        "@",
        "#",
        "$",
        "%",
        "&",
        "—",
        "=",
        "+",
        ".",
        ';',
        '"'
    )

    for find in artifacts:
        text = text.replace(find, "")

    # Split the text into sections by "wards"
    sections = re.split(r"\wards -\b", text.strip())

    # Iterate through the sections and parse the data
    for section in sections:
        lines = section.strip().split("\n")

        for line in lines:
            parts = line.split(" x")

            # If there's no "x" in the line, try 2 empty spaces
            if len(parts) == 1:
                parts = line.split("  ")

            if len(parts) < 2:
                continue

            item_name = star_rail_item_name(parts[0].strip())

            try:
                item_quantity = int(parts[1].strip())
            except Exception:
                continue

            result_dict[item_name] = result_dict.get(item_name, 0) + item_quantity

    return result_dict


def grab_items():
    while True:
        screen = StarRailRewardsTextImage()()
        bg_screen = StarRailRewardsTextImage().screenshot("Honkai: Star Rail")
        # cv2.imshow("bg_screen", screen)
        tesstr = pytesseract.image_to_string(screen, config="--oem 3")

        if "Rewards" in tesstr:
            time.sleep(1)
            img = StarRailItemsImage()()
            items = pytesseract.image_to_string(img, config="--oem 3")
            send_to_electron(json.dumps(format_text(items)))

        if cv2.waitKey(25) & 0xFF == ord("q"):
            cv2.destroyAllWindows()
            break


def main():
    signal.signal(signal.SIGTERM, cleanup)

    grab_items()


if __name__ == "__main__":
    tesseract_path = get_tesseract_path()
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
    main()
