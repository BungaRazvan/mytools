import cv2

import pytesseract
import sys
import os
import re
import json
import time

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
sys.path.append(parent_dir)

from utils import get_tesseract_path
from constants import TESSERACT_ARTICATS, HSR_STATS

from scorer.star_rail.image import StarRailRelicImage, StarRailRelicStatsImage, Image
from scorer.star_rail.utils import fix_line, find_stat, extract_type_lvl


def read_screen():
    while True:
        screen = StarRailRelicStatsImage()()
        data = pytesseract.image_to_string(
            screen, config="--user-words hsr_stats.txt,hsr_relic_categories.txt"
        )
        cv2.imshow("relic", screen)

        try:
            data = extract_data(data)

            if data.get("main_stat"):
                cv2.imwrite(f"./img/{data.get('type')}.png", screen)

        except Exception as e:
            continue

            raise e

        if cv2.waitKey(25) & 0xFF == ord("q"):
            cv2.destroyAllWindows()
            break

        time.sleep(1)


def extract_data(text):
    result_dict = {"sub_stats": []}

    for find in TESSERACT_ARTICATS:
        text = text.replace(find, "")

    lines = re.split("\n", text.strip())
    lines = [line for line in lines if line.strip()]

    for index, line in enumerate(lines):
        line = line.lower()

        if any(
            keyword in line
            for keyword in ("sphere", "rope", "head", "body", "feet", "hands")
        ):
            _type, lvl = extract_type_lvl(line)
            result_dict["type"] = _type.strip()
            result_dict["level"] = int(lvl)
        else:
            line = fix_line(line)

        if any(keyword in line for keyword in HSR_STATS) and index != 0:
            stat, value = find_stat(line)

            if stat is None or value is None:
                continue

            if index == 2:
                result_dict["main_stat"] = {stat: value}
            else:
                result_dict["sub_stats"].append((stat, value))

        if "set" in line:
            result_dict["set_name"] = lines[index + 1]

    print(json.dumps(lines, indent=2), len(lines))
    print(json.dumps(result_dict, indent=2), len(lines))
    return result_dict


def read_img():
    img = cv2.imread("./img/head aga 5.png")
    # img = Image.grayscale(img)

    data = pytesseract.image_to_string(img)
    # thresh = cv2.adaptiveThreshold(
    #     cv2.cvtColor(img, cv2.COLOR_BGR2GRAY),
    #     255,
    #     cv2.ADAPTIVE_THRESH_MEAN_C,
    #     cv2.THRESH_BINARY,
    #     5,
    #     5,
    # )
    cv2.imshow("img", img)

    data = extract_data(data)

    if cv2.waitKey(0) & 0xFF == ord("q"):
        cv2.destroyAllWindows()

    # # Destroying present windows on screen
    # cv2.destroyAllWindows()


if __name__ == "__main__":
    tesseract_path = get_tesseract_path()
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
    read_img()
