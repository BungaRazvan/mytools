import re


def extract_type_lvl(input_text):
    items = input_text.split("+")

    if len(items) == 2:
        _type, lvl = items
        return _type, lvl

    items = input_text.split(" ")
    _type, lvl = items[0], items[-1]

    return _type, lvl


def fix_line(input_text):
    # Replace multiple spaces with a single space
    modified_text = " ".join(input_text.split()).replace("+", "")

    if "quantum.dmg" in modified_text:
        modified_text = modified_text.replace("quantum.dmg", "quantum dmg")

    if "critrate" in modified_text:
        modified_text = modified_text.replace("critrate", "crit rate")

    if "critdmg" in modified_text:
        modified_text = modified_text.replace("critdmg", "crit dmg")

    if "effectres" in modified_text:
        modified_text = modified_text.replace("effectres", "effect res")

    return modified_text


def find_stat(input_text):
    search = re.search(
        r"(\b(?:hp|atk|def|efect hit rate|outgoing healing boost|crit rate|crit dmg|spd|physical dmg boost|fire dmg boost|ice dmg boost|wind dmg boost|lightning dmg boost|quantum dmg boost|imaginary dmg boost|break effect|effect hit rate|energy regeneration rate|effect res)\b)\s*(?:(?:[.\s*])|(?:\s*[A-Z]|[a-z]))*(\d+(?:\.\d+?%)|(?:\d+%)|(?:\d+))",
        input_text,
    )

    if search is None:
        return None, None

    return search.groups()
