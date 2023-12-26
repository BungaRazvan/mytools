def star_rail_item_name(item):
    item_name = item.lower()

    # Replace multiple spaces with a single space
    modified_text = " ".join(item.split()).lower()

    if "dade" in item_name:
        return "Jade Abacus Unit"

    if "strange" in item_name:
        return "Strange Matter of Destruction"

    if "pleasantlooking" in item_name:
        return "Pleasant-Looking Trash"

    if "preservation" in item_name:
        return "Preservation Construction Material"

    if "ambergris" in item_name:
        return "Ambergris of Abundance"

    if "tear crystal" in modified_text:
        return "Tear Crystal of Glorious Death"

    if "discarded ingenium" in modified_text:
        return "Discarded Ingenium Parts"

    if "humanheight auspici" in modified_text:
        return "Human-Height Auspicious Crops"

    if "extract of medicinal" in modified_text:
        return "Extract of Medicinal Herbs"

    if modified_text == "conquerors will":
        return "Conqueror's Will"

    elif modified_text == "thiefs instinct":
        return "Thief's Instinct"

    elif modified_text == "usurpers scheme":
        return "Usurper's Scheme"

    return item
