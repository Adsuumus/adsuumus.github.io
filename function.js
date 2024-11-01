<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Типограф Майя</title>
    <link
      rel="icon"
      href="https://email-images.mindbox.ru/TJ/b6f00fe0-3e8c-444f-8c1a-a18857d960f3/69c46e6e-9e0d-460f-863e-811ad835b982.jpg"
    />

    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        padding: 0;
        background-color: #f5f5f5;
        color: #333;
      }

      .header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }

      #imageContainer {
        margin-right: 20px;
      }

      #imageContainer img {
        max-width: 50px;
        max-height: 50px;
        display: block;
        border-radius: 50%;
      }

      .radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .radio-button {
        display: inline-block;
        cursor: pointer;
        padding: 10px 20px;
        background-color: #ffffff;
        color: #007bff;
        font-size: 16px;
        text-align: center;
      }

      .radio-button.active {
        background-color: #2e2ee5;
        color: #ffffff;
      }

      #downloadButton {
        display: inline-block;
        font-size: 18px;
        padding: 10px 20px;
        color: #ffffff;
        background-color: #2e2ee5;
        border: none;
        cursor: pointer;
        margin-left: 10px;
      }

      #downloadButton:hover {
        background-color: #2222bc;
      }

      #textArea {
        width: calc(100% - 22px);
        height: 500px;
        font-size: 16px;
        padding: 10px;
        border: none;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(188, 184, 184, 0.1);
        background-color: #ffffff;
        resize: none;
        margin-top: 20px;
      }

      #textArea:focus {
        outline: none;
        border: none;
      }

      @media (max-width: 600px) {
        .radio-button {
          font-size: 14px;
          padding: 8px 15px;
        }

        #downloadButton {
          font-size: 16px;
          padding: 8px 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div id="imageContainer">
        <img
          src="https://email-images.mindbox.ru/TJ/b6f00fe0-3e8c-444f-8c1a-a18857d960f3/69c46e6e-9e0d-460f-863e-811ad835b982.jpg"
          alt="Майя"
        />
      </div>
      <div class="radio-group">
        <div class="radio-button" data-value="tj">Т—Ж</div>
        <div class="radio-button" data-value="bs">БС</div>
        <div class="radio-button" data-value="amp">АМП</div>
        <button id="downloadButton">Скачать</button>
      </div>
    </div>

    <textarea id="textArea" placeholder="Вставьте текст"></textarea>

    <script>
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

        final = doc.body.innerHTML
          .replace(/&nbsp;/g, " ")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>\s*(?=<p>)/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<p>/gi, "\n")
          .replace(/<\/?h[1-6]>/gi, "\n\n")
          .replace(/&nbsp;/g, " ")
          .replace(/^\n+|\n+$/g, "")
          .replace(/\u00AD/g, "")
          .replace(/\u200b/g, "");

        final = highlightDashes(final);
        final = applyAdditionalFormatting(final);

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
          /(^|[^А-ЯЁа-яё—\-])([Уу]л\.|[Нн]о|[Ее]е|[Сс]о(,)?|[Нн]а(,)?|[Ии]х(,)?|[Ии]м(,)?|[Тт]ы(,)?|[Тт]о(,)?|[Нн]и(,)?|[Вв]ы(,)?|[Зз]а(,)?|[Нн]у(,)?|[Нн]е(,)?|[Вв]о|[Пп]о|[Нн]е(,)?|[Оо]т(,)?|[Оо]б(,)?|[Оо]н(,)?|[Кк]о(,)?|[Мм]ы(,)?|[Дд]а(,)?|[Дд]о(,)?|[Ии]з|[Ее]й|[Ее]ю(,)?|[Яя](,)?|[Аа](,)?|[Ии](,)?|[Оо](,)?|[Уу](,)?|[Вв](,)?|[Сс](,)?|[Кк](,)?)(?=\s)/g;

        text = text.replace(
          NBSP_ONE_TWO_LETTERS,
          (match, p1, p2) => `${p1}${p2}&nbsp;`
        );

        text = text.replace(/&nbsp;\s+/g, "&nbsp;");

        const NBSP_THREE_PREDLOG =
          /(^|[^А-ЯЁа-яё—\-])([Ff]or|[Aa]nd|[Tt]he|[Уу]л\.|[Бб]ез|[Пп]ри|[Нн]ад|[Пп]од|[Пп]ро|[Дд]ля|[Оо]бо|[Ии]ли)([  ])(?=[^ \xa0])/g;
        text = text.replace(
          NBSP_THREE_PREDLOG,
          (match, p1, p2, p3) => `${p1}${p2}&nbsp;`
        );

        // неразрыв перед тире, удаление пробела перед тире
        text = text.replace(/\s*—(?=\s|$)/g, function (match) {
          return "&nbsp;" + "—";
        });

        // неразрыв перед РФ, удаление пробела перед РФ
        text = text.replace(/\s*РФ(?=\s|$)/g, function (match) {
          return "&nbsp;" + "РФ";
        });

        const NBSP_TAKI_KROMETOGO =
          /(^|[^А-ЯЁа-яё])([Тт]ак и|[Кк]ак и|[Вв]се равно|[Кк]роме того)([^А-ЯЁа-яё])/g;
        text = text.replace(
          NBSP_TAKI_KROMETOGO,
          (match, p1, p2, p3) => `${p1}${p2.replace(" ", "&nbsp;")}${p3}`
        );

        const NBSP_POTOMUCHTO =
          /(^|[^А-ЯЁа-яё])[Пп]отому([  ])что([^А-ЯЁа-яё]|$)/g;
        text = text.replace(
          NBSP_POTOMUCHTO,
          (match, p1, p2, p3) => `${p1}потому&nbsp;что${p3}`
        );

        const NBSP_TAKKAK = /(^|[^А-ЯЁа-яё])[Тт]ак([  ])как([^А-ЯЁа-яё]|$)/g;
        text = text.replace(
          NBSP_TAKKAK,
          (match, p1, p2, p3) => `${p1}так&nbsp;как${p3}`
        );

        const NBSP_OBOMNE = /(^|[^А-ЯЁа-яё])[Оо]бо([  ])мне([^А-ЯЁа-яё]|$)/g;
        text = text.replace(
          NBSP_OBOMNE,
          (match, p1, p2, p3) => `${p1}обо&nbsp;мне${p3}`
        );

        const NBSP_VNEKONTEKSTA =
          /(^|[^А-ЯЁа-яё])[Вв]не([  ])контекста([^А-ЯЁа-яё]|$)/g;
        text = text.replace(
          NBSP_VNEKONTEKSTA,
          (match, p1, p2, p3) => `${p1}вне&nbsp;контекста${p3}`
        );

        const NBSP_VSERAVNO =
          /(^|[^А-ЯЁа-яё])[Вв]с[её]([  ])равно([^А-ЯЁа-яё]|$)/g;
        text = text.replace(
          NBSP_VSERAVNO,
          (match, p1, p2, p3) => `${p1}всё&nbsp;равно${p3}`
        );

        const NOBR_TOLIBONIBUDKA =
          /(^|[^А-ЯЁа-яё])([A-Za-zА-Яа-я]+[  ]?-[  ]?(нибудь))([^А-ЯЁа-яё]|$)/g;
        text = text.replace(
          NOBR_TOLIBONIBUDKA,
          (match, p1, p2, p3, p4) => `${p1}<nobr>${p2}</nobr>${p4}`
        );

        return text;
      }

      function formattingDate(text) {
        const MONTHS_REGEX =
          /(\S+?(январ[яеь]|феврал[яеь]|мар[те]|апрел[ьяе]|ма[ейяй]|июн[ьяе]|июл[ьяе]|август[ае]|сентябр[яеь]|октябр[яеь]|ноябр[яеь]|декабр[яеь]))(?=\s|$)/gi;
        text = text.replace(MONTHS_REGEX, (match) => {
          return `<a target="_blank" style="text-decoration: none; color: #000000"><span style="color: #000000">${match}</span></a>`;
        });

        const DAYS_OF_WEEK_REGEX =
          /(^|\s)(понедельник[а|у]|вторник[а|у]|сред[а|у]|четверг[а|у]|пятниц[а|у]|суббот[а|у]|воскресень[е|я]|завра|послезавтра)($|\s)/gi;
        text = text.replace(DAYS_OF_WEEK_REGEX, (match, p1, p2, p3) => {
          return `${p1}<a target="_blank" style="text-decoration: none; color: #000000"><span style="color: #000000">${p2}</span></a>${p3}`;
        });

        const TIME_REGEX = /(^|\s)(\d{2}):(\d{2})($|\s)/g;

        text = text.replace(TIME_REGEX, (match, p1, p2, p3, p4) => {
          return `${p1}<a target="_blank" style="text-decoration: none; color: #000000"><span style="color: #000000">${p2}:${p3}</span></a>${p4}`;
        });

        return text;
      }

      document.getElementById("textArea").addEventListener("paste", (event) => {
        event.preventDefault();
        const clipboardData = (
          event.clipboardData || window.clipboardData
        ).getData("text/html");
        if (clipboardData) {
          window.savedDirtyData = clipboardData;
          updateTextArea();
        }
      });

      document
        .getElementById("downloadButton")
        .addEventListener("click", () => {
          const text = document.getElementById("textArea").value;
          const blob = new Blob([text], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "document.html";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
    </script>
  </body>
</html>
