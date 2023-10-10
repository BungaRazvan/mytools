import re
import cv2
import time
import pytesseract

from grt.image import StarRailRewardsTextImage, StarRailItemsImage

pytesseract.pytesseract.tesseract_cmd = "C:\Program Files\Tesseract-OCR\\tesseract.exe"


def format_text(text):
    # Initialize an empty dictionary
    result_dict = {}
    replace_map = {"*": "", ">": "", "�": ""}

    for find, new_value in replace_map.items():
        text = text.replace(find, new_value)

    # Split the text into sections by "wards"
    sections = re.split(r"\bwards\b", text.strip())

    # Iterate through the sections and parse the data
    for section in sections:
        lines = section.strip().split("\n")

        for line in lines:
            parts = line.split(" x")

            if len(parts) < 2:
                continue

            item_name = parts[0].strip()

            try:
                item_quantity = int(parts[1].strip())
            except Exception:
                continue

            result_dict[item_name] = item_quantity

    print(result_dict)


def grab_items():
    while True:
        now = time.time()
        screen = StarRailRewardsTextImage()()
        tesstr = pytesseract.image_to_string(screen, config="--oem 3")
        # print(tesstr)

        if "Rewards" in tesstr:
            time.sleep(2)
            img = StarRailItemsImage()()
            test = pytesseract.image_to_string(img, config="--oem 3")
            print(format_text(test))

        cv2.imshow("window", screen)
        print(f"{time.time() - now}")
        if cv2.waitKey(25) & 0xFF == ord("q"):
            cv2.destroyAllWindows()
            break


def main():
    grab_items()


if __name__ == "__main__":
    main()
