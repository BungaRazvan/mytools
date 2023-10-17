import json

from bs4 import BeautifulSoup as _bs4
from requests import get
from pathlib import Path

sets_data = []


def save_image(img_name, img_url, save_path):
    with open(f"{save_path}/{img_name}", "wb") as f:
        f.write(get(img_url).content)


def extract_bonuses(bonuses):
    for bonus in bonuses:
        bonus_text = (
            bonus.text.replace("\n", "").replace("4-Piece", "").replace("2-Piece", "")
        )
        _bonuses = bonus_text.split(":")

        if len(_bonuses) <= 1:
            continue

        return {"2-piece": _bonuses[1].strip(), "4-piece": _bonuses[2].strip()}


def extract_aritifacts(set_link, set_name):
    artifacts = {}
    index_to_type = {1: "flower", 2: "feather", 3: "sands", 4: "goblet", 5: "circlet"}

    soup = _bs4(get(set_link).content, "html.parser")

    tables = soup.find_all("table", class_="a-table")
    idx = 4

    art_index_table = {
        "Desert": 6,
        "Deepwood": 6,
        "Flower": 6,
        "Noblesse": 6,
        "Husk": 6,
        "Nymph's": 5,
        "Ocean": 6,
        "Vermillion": 5,
        "Vourukasha's": 5,
    }
    set_start_name = set_name.split(" ")[0]

    if art_index_table.get(set_start_name):
        idx = art_index_table.get(set_start_name)

    print(set_name, idx, set_start_name)
    table_stats = tables[idx]

    trs = table_stats.find_all("tr")

    for index, tr in enumerate(trs):
        tds = tr.find_all("td")
        artifact_type = index_to_type.get(index)

        if not artifact_type:
            continue

        artifacts[artifact_type] = {}

        for td in tds:
            if td.img:
                img_name = f'{set_name.replace(" ", "_")}_{artifact_type}.png'
                # save_image(f'{img_name}', td.img.get('data-src'), Path('../../../../public/img/genshin/artifacts/'))

                artifacts[artifact_type]["name"] = (
                    td.img.get("alt").replace("Image", "").strip()
                )
                artifacts[artifact_type]["image"] = img_name

            if td.br:
                stats = (
                    str(td)
                    .replace('<td class="center">', "")
                    .replace("(Always)", "")
                    .strip()
                    .replace("<br/>", "~")
                    .replace("</td>", "")
                    .split("~")
                )

                if not stats[1]:
                    stats = [stats[0]]

                artifacts[artifact_type]["main_stats"] = stats

    return artifacts


def all_sets():
    soup = _bs4(
        get("https://game8.co/games/Genshin-Impact/archives/297493").content,
        "html.parser",
    )
    json_path = Path("../../../../public/data/genshin")

    sets = soup.find_all("table", class_="a-table")[1]

    trs = sets.find_all("tr")
    trs = [tr for tr in trs if len(tr.find_all("td")) == 2]

    for tr in trs:
        new_set = {
            "set_name": None,
            "bonus": {
                "2-piece": None,
                "4-peiece": None,
            },
            "artifacts": {},
        }
        set_link = tr.a.get("href")
        bonuses = tr.find_all("td")
        artifact_details = extract_aritifacts(set_link, tr.b.text)
        new_set["bonus"] = extract_bonuses(bonuses)
        new_set["set_name"] = tr.b.text
        new_set["artifacts"] = artifact_details

        sets_data.append(new_set)

    print(len(sets_data))

    with open(f"{json_path}/artifacts.json", "w") as f:
        f.write(json.dumps({"data": sets_data}, indent=2))


# presets
# https://gamewith.net/genshin-impact/article/show/22405

if __name__ == "__main__":
    all_sets()
