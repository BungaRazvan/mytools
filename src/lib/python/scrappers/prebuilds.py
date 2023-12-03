import os
import sys
import json

from collections import defaultdict

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
sys.path.append(parent_dir)


from bs4 import BeautifulSoup as _bs4
from requests import get
from utils import save_image
from pathlib import Path


def character_builds(link, character):
    soup = _bs4(get(link).content, "html.parser")
    builds = soup.find_all("div", class_="genshin_build")
    builds_data = []

    for build in builds:
        build_data = {
            "name": None,
            "weapon": None,
            "substitute": None,
            "artifacts": [],
            "main_stats": {"sands": None, "goblet": None, "circlet": None},
            "sub_stats": [],
        }

        h3 = build.find_previous_sibling("h3")
        table = build.table
        rows = table.find_all("tr")
        build_data["name"] = h3.text.replace("Build", "").replace(character, "").strip()

        if "Traveler" in character:
            build_data["name"] = (
                character.replace("Traveler", "").strip() + " " + build_data["name"]
            )

        for row in rows:
            category = row.th.text.lower()

            if category == "weapon":
                weapon = row.td.text.strip()
                build_data[category] = weapon

            if category == "substitute":
                substitutes = [
                    substitute.text.strip() for substitute in row.td.find_all("a")
                ]
                build_data["substitute"] = substitutes

            if category in ["best artifact", "best"]:
                tags = row.td.find_all("a")

                for tag in tags:
                    artifact_name = tag.find("img").parent.text

                    try:
                        artifact_number = int(
                            tag.parent.get_text(strip=True).split("x")[-1].strip()[0]
                        )
                    except Exception:
                        artifact_number = 4

                    # Append to the list of artifacts
                    build_data["artifacts"].append(
                        {"name": artifact_name, "no": artifact_number}
                    )

            if category == "artifact stats":
                text = row.td.text
                spans = row.td.find_all("span")
                keys = [span.text.replace(":", "").strip() for span in spans]

                for key in keys:
                    text = text.replace(":", "").replace(key, "")

                stats = text.split("  ")

                for index, key in enumerate(keys):
                    stat = stats[index].strip()

                    if stat == "EM":
                        stat = "Elemental Mastery"
                    elif stat == "ER":
                        stat = "Energy Recharge"

                    stat = stat.replace("EM", "Elemental Mastery").replace(
                        "ER", "Energy Recharge"
                    )
                    build_data["main_stats"][key.lower()] = stat

            if category == "priority sub-stats":
                text = row.td.text.replace(".", " ")

                for i in range(0, 10):
                    text = text.replace(str(i), "")

                build_data["sub_stats"] = [
                    stat.strip()
                    .replace("EM", "Elemental Mastery")
                    .replace("ER", "Energy Recharge")
                    for stat in text.split("  ")
                    if stat
                ]

        builds_data.append(build_data)

    return builds_data


def characters_links():
    soup = _bs4(
        get("https://gamewith.net/genshin-impact/article/show/22884").content,
        "html.parser",
    )
    divs = soup.find_all("div", class_="gen_chara")
    all_builds = defaultdict()

    for div in divs:
        table = div.table
        imgs = table.find_all("img", {"width": "50px", "height": "50px"})

        for img in imgs:
            character = img.get("alt")
            print(
                character,
                img.parent.get("href"),
            )
            builds_character = character_builds(img.parent.get("href"), character)

            if "Traveler" in character:
                character = "Traveler"

                if len(all_builds.get("Traveler", [])):
                    for build in builds_character:
                        all_builds["Traveler"].append(build)

                    continue

            all_builds[character] = builds_character

    return all_builds


if __name__ == "__main__":
    builds = characters_links()

    json_path = Path("../../../../public/data/genshin")

    with open(f"{json_path}/prebuilds.json", "w") as f:
        f.write(json.dumps(builds, indent=2))
