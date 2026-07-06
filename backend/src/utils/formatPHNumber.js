const formatPHNumber = (number) => {
  if (!number) return "N/A";

  let cleaned = number.replace(/\D/g, "");

  if (cleaned.startsWith("63")) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length !== 10) return number;

  return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

module.exports = formatPHNumber;