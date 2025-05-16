window.addEventListener("load", () => {
    document.getElementById("typograph-container").focus();
});

function copyResult() {
    const text = document.getElementById("typograph-container").textContent;
    navigator.clipboard.writeText(text)
}

function processText(text) {
    const originalSizeKB = (new TextEncoder().encode(text).length / 1024).toFixed(2);

    const processedText = text
        .replace(/[\r\n\s]+/g, " ")
        .replace(/ >/g, ">")
        .replace(/ ">/g, '">')
        .replace(/ \/>/g, "/>")
        .replace(/\s*<\/td>\s*/g, "</td>")
        .replace(/\s*<td>\s*/g, "<td>")
        .replace(/\s*<tr>\s*/g, "<tr>")
        .replace(/\s*<\/tr>\s*/g, "</tr>")
        .replace(/\s*<table>\s*/g, "<table>")
        .replace(/\s*<\/table>\s*/g, "</table>")
        .replace(/\s*<table/g, "<table")
        .replace(/\s*<tr/g, "<tr")
        .replace(/\s*<td/g, "<td")
        .replace(/ @{/g, "@{")
        .replace(/(<!--)/g, "\n\n$1")
        .replace(/<([^>]*)>/g, (match, content) => {
            const processedContent = content
                .replace(/" /g, '"')
                .replace(/: /g, ":")
                .replace(/; /g, ";");
            return `<${processedContent}>`;
        });

    const processedSizeKB = (new TextEncoder().encode(processedText).length / 1024).toFixed(2);

    document.getElementById("sizeInfo").textContent = `До: ${originalSizeKB} KB → После: ${processedSizeKB} KB (сжатие ${((1 - processedSizeKB / originalSizeKB) * 100).toFixed(1)}%)`;

    return processedText;
}

document
    .getElementById("typograph-container")
    .addEventListener("paste", (event) => {
        event.preventDefault();
        const clipboardData = (event.clipboardData || window.clipboardData).getData("text/plain");
        if (clipboardData) {
            const processedText = processText(clipboardData);
            document.getElementById("typograph-container").textContent = processedText;
        }
    });