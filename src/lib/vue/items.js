export const startRailItemName = (item) => {
  let itemName = item;
  const modifiedText = item.replace(/\s+/g, " ").trim(); // Replace multiple spaces with a single space

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

  if (modifiedText.includes("Discarded Ingenium")) {
    itemName = "Discarded Ingenium Parts";
    return itemName;
  }

  if (modifiedText.includes("HumanHeight Auspici")) {
    itemName = "Human-Height Auspicious Crops";
    return itemName;
  }

  if (modifiedText.includes("Extract of Medicinal")) {
    itemName = "Extract of Medicinal Herbs";
    return itemName;
  }

  if (item.includes("PleasantLooking")) {
    itemName = "Pleasant-Looking Trash";
    return itemName;
  }

  switch (modifiedText) {
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
