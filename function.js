let activeFormat = "tj";

function updateTextArea() {
  const textArea = document.getElementById("textArea");
  const clipboardData = window.savedDirtyData;

  if (clipboardData) {
    const cleanData = extractLinksAndText(clipboardData);
    textArea.value = cleanData;
  }
}

document.querySelectorAll(".radio-button").forEach((button) => {
  button.addEventListener("click", function () {
    document
      .querySelectorAll(".radio-button")
      .forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
    activeFormat = this.getAttribute("data-value");
    updateTextArea();
  });
});

document
  .querySelector('.radio-button[data-value="tj"]')
  .classList.add("active");

window.onload = function () {
  document.getElementById("textArea").focus();
};

function cleanHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.body.querySelectorAll("*").forEach((el) => {
    const computedStyle = getComputedStyle(el);
    const isBold =
      el.style.fontWeight === "700" ||
      (el.style.fontWeight === "" && computedStyle.fontWeight === "700");

    if (isBold && !el.closest("a")) {
      const boldTag = document.createElement("b");
      boldTag.innerHTML = el.innerHTML;
      el.replaceWith(boldTag);
      return;
    }

    if (
      !["A", "BR", "P"].includes(el.tagName) &&
      !el.tagName.startsWith("H")
    ) {
      el.replaceWith(...el.childNodes);
      return;
    }

    [...el.attributes].forEach((attr) => {
      if (el.tagName === "A" && attr.name === "href") return;
      el.removeAttribute(attr.name);
    });
  });

  let final = doc.body.innerHTML
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*(?=<p>)/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p>/gi, "\n")
    .replace(/<\/?h[1-6]>/gi, "\n\n")
    .replace(/&nbsp;/g, " ")
    .replace(/^\n+|\n+$/g, "")
    .replace(/\u00AD/g, "")
    .replace(/\u200b/g, "");


  final = applyAdditionalFormatting(final);
  final = highlightDashes(final);

  return final;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unescapeHTML(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractLinksAndText(html) {
  let text = cleanHTML(html);

  const result = text.replace(
    /<a\s+href="([^"]+)">([^<]+)<\/a>/g,
    (match, href, linkText) => {
      if (activeFormat === "tj") {
        return `<a href="${href}" target="_blank" style="text-decoration: none; color: #1414cc"><span class="dm_col-B2BDFF link2-und-hov" style="color: #1414cc">${linkText}</span></a>`;
      } else if (activeFormat === "bs") {
        return `<a href="${href}" target="_blank" style="text-decoration: none; color: #0068ff"><span class="dm-col-66A3FF" style="color: #0068ff">${linkText}</span></a>`;
      } else {
        return `<a class="link-interactive" href="${href}" target="_blank">${linkText}</a>`;
      }
    }
  );

  return unescapeHTML(result);
}

function highlightDashes(text) {
  const words = text.split(" ");
  const result = words.map((word) => {
    if (
      word.includes("http") ||
      word.includes("link") ||
      word.includes("class")
    ) {
      return word;
    }
    if (word.includes("—") || word.includes("-")) {
      const parts = word.split(/—|-/);
      const firstPart = parts[0].trim();
      const secondPart = parts[1].trim();

      if (
        (firstPart.replace(/[«»]/g, "").length < 4 ||
          secondPart.replace(/[«».,!?;]/g, "").length < 4) &&
        secondPart !== ""
      ) {
        return `${firstPart}&amp;#8288;${
          word.includes("—") ? "—" : "-"
        }&amp;#8288;${secondPart}`;
      }
    }
    return word;
  });

  return result.join(" ");
}

function applyAdditionalFormatting(text) {
  const IZ_ZA = /(^|\s)(из-за)(\s|$)/g;

  text = text.replace(
    IZ_ZA,
    (match, p1, p2, p3) => `${p1}${p2}&nbsp;${p3}`
  );

  const NBSP_RUB = /(^|\d+)([  ])₽/g;
  text = text.replace(NBSP_RUB, (match, p1, p2) => `${p1}&nbsp;₽`);

  const NBSP_CELSIUS = /(^|\d+)([  ])°C/g;
  text = text.replace(NBSP_CELSIUS, (match, p1, p2) => `${p1}&nbsp;°C`);

  const NBSP_LIZHEBI =
    /([А-ЯЁа-яё])([  ])(ли|ль|же|ж|бы|б)([^А-ЯЁа-яё])/g;
  text = text.replace(
    NBSP_LIZHEBI,
    (match, p1, p2, p3, p4) => `${p1}&nbsp;${p3}${p4}`
  );

  const NBSP_MLN = /(^|[^0-9—])(\d+,?\d*)([  ])(тыс|млн|млрд|трлн)/g;
  text = text.replace(
    NBSP_MLN,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`
  );

  const NBSP_STR = /(^|[^А-ЯЁа-яё—\-])стр\.([  ])\d+/g;
  text = text.replace(NBSP_STR, (match, p1, p2) => `${p1}стр.&nbsp;`);

  const NBSP_ANY_NUMBER =
    /(^|[^—0-9<])(\d+,?\d*)([  ])([A-Za-zА-Яа-я<]+)/g;
  text = text.replace(
    NBSP_ANY_NUMBER,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`
  );

  const NBSP_COMP_NUMBER = /(^|[^—0-9])(\d+,?\d*)([  ])(\d+)/g;
  text = text.replace(
    NBSP_COMP_NUMBER,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`
  );

  const NBSP_THREE_NUMBERS =
    /(^|[^—0-9])(\d{2,},?\d+)([  ])([A-Za-zА-Яа-я]+)/g;
  text = text.replace(
    NBSP_THREE_NUMBERS,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`
  );

  const NBSP_ONE_TWO_LETTERS =
    /(^|[^А-ЯЁа-яё—\-])([Уу]л\.|[Нн]о|[Ее]е|[Сс]о(,)?|[Нн]а(,)?|[Ии]х(,)?|[Ии]м(,)?|[Тт]ы(,)?|[Тт]о(,)?|[Нн]и(,)?|[Вв]ы(,)?|[Зз]а(,)?|[Нн]у(,)?|[Нн]е(,)?|[Вв]о|[Пп]о|[Нн]е(,)?|[Оо]т(,)?|[Оо]б(,)?|[Оо]н(,)?|[Кк]о(,)?|[Мм]ы(,)?|[Дд]а(,)?|[Дд]о(,)?|[Ии]з|[Ее]й|[Ее]ю(,)?|[Яя](,)?|[Йй]|[Ээ]|[Сс]е|[Кк]а)([ ])/g;
  text = text.replace(NBSP_ONE_TWO_LETTERS, (match, p1, p2, p3) => {
    if (p2.trim() !== "и") {
      return `${p1}${p2}&nbsp;`;
    }
    return `${p1}${p2}${p3}`;
  });

  return text;
}
