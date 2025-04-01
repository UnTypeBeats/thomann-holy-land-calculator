document.addEventListener("mouseup", function () {
  try {
    function parseShekelPrice(value) {
      // Remove the currency symbol and any whitespace
      let numericPart = value.replace(/[^\d.,]/g, "").trim();

      // Replace commas with an empty string and periods with commas
      numericPart = numericPart.replace(".", ",").replace(/,/g, "");

      // Parse the resulting string as a float
      return parseFloat(numericPart);
    }

    // Function to replace text in text nodes
    function replaceSelectedText(newText) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      selection.deleteFromDocument(); // Remove the current selection

      const range = selection.getRangeAt(0);
      range.deleteContents();

      // Insert new text node
      range.insertNode(document.createTextNode(newText));

      // Clear selection to avoid confusion
      selection.removeAllRanges();
    }

    let selectedText = window.getSelection().toString();
    if (selectedText.trim() && !isNaN(selectedText)) {
      let multipliedValue = parseShekelPrice(selectedText) * 1.2818228558;
      replaceSelectedText(multipliedValue.toFixed(2).toString());
    }
  } catch (error) {
    console.error("An error occurred: ", error);
  }
});
