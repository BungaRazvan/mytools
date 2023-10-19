from bs4 import BeautifulSoup as _bs4
from pathlib import Path
from requests import get

from src.lib.python.utils import save_image


if __name__ == "__main__":
    soup = _bs4(
        get("https://game8.co/games/Honkai-Star-Rail/archives/407119").content,
        "html.parser",
    )
    image_path = Path("../../../../public/img/star_rail/materials/")

    materials = soup.find_all("table", class_="a-table")
    materials = materials[9]
    # materials = materials[1]
    tds = materials.find_all("td")

    for td in tds:
        image_name = td.a.img.get("alt").replace("Item", "").strip().replace(" ", "_")
        save_image(
            f"{image_name}.png",
            td.a.img.get("data-src"),
            image_path,
        )
