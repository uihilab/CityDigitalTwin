// Utility function to format text based on options and key mappings
export default function formatObjectData(item, keyMappings, type = "tooltip") {
  const output = [];

  // Define separator based on the type of display (tooltip or detail box)
  const separator = type === "tooltip" ? "\n" : "<br/>";

  // Iterate through the keys in the provided keyMappings
  for (const [key, label] of Object.entries(keyMappings)) {
    if (item[key] !== undefined) {
      if (type !== "tooltip") {
        // Bold the key titles for the detail box
        output.push(`<strong>${label}</strong>: ${item[key]}`);
      } else {
        // Plain text for tooltips
        output.push(`${label}: ${item[key]}`);
      }
    }
  }

  // Join the formatted output with the separator
  return output.join(separator);
}
