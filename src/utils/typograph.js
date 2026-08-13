export function linksCreator(text, activeFormat) {
  text = text.replace(
    /<a\s+href="([^"]+)">([^<]+)<\/a>/,
    (match, href, linkText) => {
      if (activeFormat === "tj" || activeFormat === "easy") {
        return `<a href="${href}" target="_blank" style="text-decoration: none; color: #1414cc"><span class="dm_col-B2BDFF link2-und-hov" style="color: #1414cc">${linkText}</span></a>`;
      } else if (activeFormat === "bs") {
        return `<a href="${href}" target="_blank" style="text-decoration: none; color: #0068ff"><span class="dm-col-66A3FF" style="color: #0068ff">${linkText}</span></a>`;
      } else {
        return `<a class="link-interactive" href="${href}" target="_blank">${linkText}</a>`;
      }
    },
  );
  return text;
}

export function formattingDate(text) {
  const months =
    /(^|\s|&nbsp;)(январ[яеь][,.]?|феврал[яеь][,.]?|март[ае]?[,.]?|апрел[ьяе][,.]?|ма[ейя][,.]?|июн[ьяе][,.]?|июл[ьяе][,.]?|август[ае]?[,.]?|сентябр[яеь][,.]?|октябр[яеь][,.]?|ноябр[яеь][,.]?|декабр[яеь][,.]?|понедельник[ау][,.]?|вторник[ау]?[,.]?|сред[ау][,.]?|четверг[ау][,.]?|пятниц[ауе][,.]?|суббот[ауе][,.]?|воскресень[ея][,.]?|завтра[,.]?|послезавтра[,.]?|неделе[,.]?)()(?=\s|&nbsp;|$)/gi;

  text = text.replace(months, (match, p1, month) => {
    const prefix = p1 || "";
    return `${prefix}${month.slice(0, 2)}&#8288;${month.slice(2)}`;
  });

  text = text.replace(/(?<=\.)(ru|рф|com|online)/g, "&#8288;$1");

  return text;
}

export function typography(text, activeFormat) {
  const dash = /(>)([а-яА-Яa-zA-Z0-9]{1,4})([-–—−])([а-яА-Яa-zA-Z0-9]{1,4})/g;
  text = text.replace(dash, (match, p1, p2, p3, p4) => {
    if (/\d([-–—−]\d)/.test(match)) {
      return match;
    }
    return `${p1}${p2}&#8288;${p3}&#8288;${p4}`;
  });

  const period =
    /(\s)([0-9]+(?:,[0-9]+)?[-–—−][0-9]+(?:,[0-9]+)?)(?:\s([А-ЯЁа-яё&#8288;]+[.,!]?))?/g;
  if (activeFormat !== "easy") {
    text = text.replace(
      period,
      (match, p1, p2, p3) =>
        `${p1}<span style="white-space: nowrap;">${p2}${p3 ? ` ${p3}` : ""}</span>`,
    );

    const iz_za = /([Ии]з&#8288;[-–—−]&#8288;за)\s+([А-ЯЁа-яё]+)/g;
    text = text.replace(
      iz_za,
      (match, p1, p2) => `<span style="white-space: nowrap;">${match}</span>`,
    );
  } else {
    text = text.replace(/«/g, "&amp;laquo;").replace(/»/g, "&amp;raquo;");
  }

  const NBSP_ONE_TWO_LETTERS =
    /(^|[^А-ЯЁа-яё—&#8288;\-])([Уу]л\.|[Нн]о|[Ее]е|[Сс]о(,)?|[Нн]а(,)?|[Ии]х(,)?|[Ии]м(,)?|[Тт]ы(,)?|[Тт]о(,)?|[Нн]и(,)?|[Вв]ы(,)?|[Зз]а(,)?|[Нн]у(,)?|[Нн]е(,)?|[Вв]о|[Пп]о|[Нн]е(,)?|[Оо]т(,)?|[Оо]б(,)?|[Оо]н(,)?|[Кк]о(,)?|[Мм]ы(,)?|[Дд]а(,)?|[Дд]о(,)?|[Ии]з|[Ее]й|[Ее]ю(,)?|[Яя](,)?|[Аа](,)?|[Ии](,)?|[Оо](,)?|[Уу](,)?|[Вв](,)?|[Сс](,)?|[Кк](,)?)(?= )/g;

  text = text.replace(NBSP_ONE_TWO_LETTERS, "$1$2&nbsp;");

  const NBSP_CELSIUS = /(^|\d+)([ ])°C/g;
  text = text.replace(NBSP_CELSIUS, (match, p1, p2) => `${p1}&nbsp;°C`);

  const NBSP_LIZHEBI = /([А-ЯЁа-яё])([ ])(ли|ль|же|ж|бы|б)([^А-ЯЁа-яё])/g;
  text = text.replace(
    NBSP_LIZHEBI,
    (match, p1, p2, p3, p4) => `${p1}&nbsp;${p3}${p4}`,
  );

  const NBSP_MLN = /(^|[^0-9—])(\d+,?\d*)([ ])(тыс|млн|млрд|трлн)/g;
  text = text.replace(
    NBSP_MLN,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`,
  );

  const NBSP_STR = /(^|[^А-ЯЁа-яё—\-])стр\.([ ])\d+/g;
  text = text.replace(NBSP_STR, (match, p1, p2) => `${p1}стр.&nbsp;`);

  const NBSP_ANY_NUMBER = /(^|[^—0-9<])(\d+,?\d*)([ ])([A-Za-zА-Яа-я<]+)/g;
  text = text.replace(
    NBSP_ANY_NUMBER,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`,
  );

  const NBSP_COMP_NUMBER = /(^|[^—0-9])(\d+,?\d*)([ ])(\d+)/g;
  text = text.replace(
    NBSP_COMP_NUMBER,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`,
  );

  const NBSP_THREE_NUMBERS = /(^|[^—0-9])(\d{2,},?\d+)([ ])([A-Za-zА-Яа-я]+)/g;
  text = text.replace(
    NBSP_THREE_NUMBERS,
    (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`,
  );

  // неразрыв перед тире, удаление пробела перед тире
  text = text.replace(/\s*—(?=\s|$)/g, "&nbsp;—");

  const NBSP_RUB = /(^|\d+)([ ])₽/g;
  text = text.replace(NBSP_RUB, (match, p1, p2) => `${p1}&nbsp;₽`);

  text = text.replace(/(?<=[А-ЯЁа-яё]) (РФ|РФ.)/g, "&nbsp;$1");

  text = text.replace(/([А-ЯЁа-яё]) (\d+%)/g, "$1&nbsp;$2");

  const exclusion =
    /(?<=^|[^А-ЯЁа-яё])([Пп]отому что|[Тт]ак как|[Оо]бо мне|[Вв]не контекста|[Вв]се равно|[Кк]роме того|[Тт]ак и|[Кк]ак и)(?=[^А-ЯЁа-яё]|$)/g;
  text = text.replace(exclusion, (match) => match.replace(" ", "&nbsp;"));

  text = text.replace(/&nbsp;\s+/g, "&nbsp;");

  text = text
    .replace(/&nbsp;по /g, "&nbsp;по&nbsp;")
    .replace(/&nbsp;до /g, "&nbsp;до&nbsp;");

  text = text.replace(/&nbsp;&nbsp;/g, "&nbsp;");

  return text;
}

export function highlightDashes(text, activeFormat) {
  const words = text.split(" ");
  const result = words.map((word, index, array) => {
    if (activeFormat !== "easy" && /\d([-–—−]\d)/.test(word)) {
      return word;
    }

    const parts = word.split(/([-–—−])/);

    return parts
      .map((part, index) => {
        if (
          index % 2 === 1 &&
          parts[index - 1] &&
          parts[index + 1] &&
          !(
            parts[index - 1].endsWith(" ") || parts[index + 1].startsWith(" ")
          ) &&
          (parts[index + 1].replace(/[«».,!?;</p></a>]|__TAG_\d+__/g, "")
            .length < 5 ||
            parts[index - 1].replace(/[«».,!?;</p></a>]|__TAG_\d+__/g, "")
              .length < 5 ||
            parts[index + 1].replace(/[«».,!?;</p>]]/g, "").toLowerCase() ===
              "нибудь")
        ) {
          return `&#8288;${part}&#8288;`;
        }
        return part;
      })
      .join("");
  });

  return result.join(" ");
}
