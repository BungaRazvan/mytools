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

  switch (itemName) {
    case "Conquerors Will":
      itemName = "Conqueror's Will";
      break;

    case "Thiefs Instinct":
      itemName = "Thief's Instinct";
      break;

    case "Usurpers Scheme":
      itemName = "Usurper’s Scheme";
      break;
  }

  return itemName;
};
