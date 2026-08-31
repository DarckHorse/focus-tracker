function classifySize(windowArea, monitorArea) {
  if (!windowArea || !monitorArea || monitorArea <= 0) {
    return "small";
  }

  const ratio = windowArea / monitorArea;

  if (ratio >= 0.9) return "full";
  if (ratio >= 0.65) return "large";
  if (ratio >= 0.4) return "half";
  if (ratio >= 0.2) return "medium";
  if (ratio >= 0.1) return "quarter";
  return "small";
}

module.exports = {
  classifySize,
};