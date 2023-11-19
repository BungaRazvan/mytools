export const startRailItemName = (item) => {
  let itemName = item;

  if (item.includes("Strange")) {
    itemName = "Strange Matter of Destruction";
    return itemName;
  }

  if (item.includes("Preservation")) {
    itemName = "Preservation Construction Material";
    return itemName;
  }

  if (item.includes("Tear")) {
    itemName = "Tear Crystal of Glorious Death";
    return itemName;
  }

  if (item.includes("Ambergris")) {
    itemName = "Ambergris of Abundance";
    return itemName;
  }

  if (item.includes("Discarded Ingenium")) {
    itemName = "Discarded Ingenium Parts";
    return itemName;
  }

  if (item.includes("HumanHeight Auspici")) {
    itemName = "Human-Height Auspicious Crops";
    return itemName;
  }

  if (item.includes("Extract of Medicinal")) {
    itemName = "Extract of Medicinal Herbs";
    return itemName;
  }

  if (item.includes("PleasantLooking")) {
    itemName = "Pleasant-Looking Trash";
    return itemName;
  }

  switch (itemName) {
    case "Conquerors Will":
      itemName = "Conqueror's Will";
      break;

    case "Thiefs Instinct":
      itemName = "Thief's Instinct";
      break;

    case "Usurpers Scheme":
      itemName = "Usurper's Scheme";
      break;
  }

  return itemName;
};
