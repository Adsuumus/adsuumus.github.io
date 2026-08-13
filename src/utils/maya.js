import {
  linksCreator,
  formattingDate,
  typography,
  highlightDashes,
} from "./typograph";

import { html as beautifyHtml } from "js-beautify";

const statecode = [
  { doc: "Карточка статьи:", state: "card", shortcode: "card" },
  { doc: "Карточки статьи:", state: "card", shortcode: "card" },
  { doc: "Карточка с деталями:", state: "cardDetails", shortcode: "card-d" },
  { doc: "Карточки с деталями:", state: "cardDetails", shortcode: "card-d" },
  { doc: "Баннер:", state: "banner", shortcode: "banner" },
  { doc: "Блок с картинкой:", state: "blockImg", shortcode: "block-img" },
  { doc: "Квадратные обложки:", state: "picList", shortcode: "pic-list" },
  { doc: "Квадратная обложка:", state: "picList", shortcode: "pic-list" },
  {
    doc: "Квадратные обложки (социокнопки):",
    state: "picListSoc",
    shortcode: "pic-list-s",
  },
  {
    doc: "Квадратные обложки (описания):",
    state: "picListDesc",
    shortcode: "pic-list-d",
  },
  { doc: "Блок:", state: "block", shortcode: "block" },
  {
    doc: "Статьи с комментами:",
    state: "articleComments",
    shortcode: "comments-list",
  },
  {
    doc: "Статья с&nbsp;комментами:",
    state: "articleComments",
    shortcode: "comments-list",
  },
  {
    doc: "Статьи с автором:",
    state: "articleAuthor",
    shortcode: "author-list",
  },
  { doc: "Блок с картинкой:", state: "blockImage", shortcode: "block-img" },
];

const states = Object.fromEntries(statecode.map((el) => [el.doc, el.state]));
const shortcodes = Object.fromEntries(
  statecode.map((el) => [el.state, el.shortcode]),
);

export function baseWay(text, activeFormat) {
  text = decodeHtml(text);

  text = cleanHtml(text, activeFormat);

  const tags = [];
  text = text.replace(/<[^>]*>/g, (match) => {
    tags.push(match);
    return `__TAG_${tags.length - 1}__`;
  });

  text = highlightDashes(text, activeFormat);

  text = typography(text, activeFormat);

  text = formattingDate(text);

  text = text.replace(/__TAG_(\d+)__/g, (match, index) => {
    return tags[parseInt(index, 10)];
  });

  if (activeFormat !== "easy") {
    text = bridge(text, activeFormat);
    text = blockCreator(text, activeFormat);
  }

  if (activeFormat === "easy") {
    text = clean(text, activeFormat);
  }

  if (activeFormat === "bs") {
    text = addPadding(text, "state", activeFormat);
  }

  text = beautifyHtml(text);

  text = escapeHtml(text);

  text = highlight(text);

  return text;
}

const regex = /<a\s+href="([^"]+)">([^<]+)<\/a>/g;

export function clean(text, activeFormat) {
  const cleaner = /\n\n\n/g;

  text = linksCreator(text, activeFormat);

  text = text
    .replace(/<\/p>/g, "\n\n")
    .replace(/<p>|<\/p>/g, "")
    .replace(/<b>|<\/b>/g, "")
    .replace(cleaner, "\n");
  return text;
}

export function decodeHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.innerHTML;
}

const styleMap = [
  { regex: /font-weight:700/i, type: "tag", value: "b" },
  { regex: /font-style:italic/i, type: "tag", value: "i" },
  { regex: /font-size:10pt/i, type: "tag", value: "label" },
  { regex: /background-color:#ffff00/i, type: "mark", value: "&yelloow;" },
  { regex: /background-color:#efefef/i, type: "mark", value: "&grey;" },
  { regex: /background-color:#d9ead3/i, type: "mark", value: "&green;" },
  { regex: /background-color:#e6b8af/i, type: "mark", value: "&red;" },
  { regex: /background-color:#0000ff/i, type: "mark", value: "&blue;" },
];

export function marker(text) {
  const parts = text.split("<p");

  const processed = parts.map((part, index) => {
    if (index === 0) return part;

    const hasAll =
      part.includes("background-color") &&
      part.includes("[") &&
      part.includes("]") &&
      part.includes("href");

    part = part.replace(
      /<span[^>]*style="([^"]*)"[^>]*>(.*?)<\/span>/gi,
      (_, style, content) => {
        style = style.toLowerCase();
        for (const map of styleMap) {
          if (map.regex.test(style)) {
            if (map.type === "tag") {
              return `<${map.value}>${content}</${map.value}>`;
            }
            if (map.type === "mark" && hasAll) {
              return `${map.value}${content}`;
            }
          }
        }
        return content;
      },
    );

    return "<p" + part;
  });

  text = processed.join("");

  text = text.replace(/<span[^>]*>/g, "").replace(/<\/span>/g, "");

  return text;
}

export function cleanHtml(text, activeFormat) {
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/^\n+|\n+$/g, "")
    .replace(/\u00AD/g, "")
    .replace(/\u200b/g, "")
    .replace(/\[<br\s\S]*?>/g, "<br>");
  text = text
    .replace(/<meta[^>]*>/g, "")
    .replace(/<br class="Apple-interchange-newline">/g, "");

  text = text.replace(/\s+/g, " ");

  text = marker(text);

  // чистим b
  // ДОМ?
  text = text.replace(/<\/b>$/, "");
  text = text.replace(/<b [^>]*>/g, "");
  text = text.replace(/<b> ([\s\S]*?)<\/b>/g, " <b>$1</b>");
  text = text.replace(/<b>([\s\S]*?) <\/b>/g, "<b>$1</b> ");
  text = text.replace(/<b><\/b>|\n<\/b>/g, "");

  text = text.replace(/<br>/g, "\n");

  text = text.replace(/<(p|li|ol|ul)[^>]*>/g, "<$1>");

  text = text.replace(/<p>\s*<\/p>/g, "");

  // ДОМ?
  const list = /<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/g;
  text = text.replace(list, (match, content) => {
    return `<li>${content}</li>`;
  });

  text = text.replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, "<h2>$1</h2>");

  //двигаем лейбл из-за г-докс
  text = text.replace(/<\/label><label>/, "");
  text = text.replace(
    /<h2>((?:<label>[\s\S]*?<\/label>)+)((?:<a[\s\S]*?<\/a>))<\/h2>/,
    "$1\n<h2>$2</h2>",
  );

  text = text.replace(/<a([^>]*?)\s+href="([^"]+)".*?>/g, '<a href="$2">');

  text = text.replace(
    /<(h[1-3])>([\s\S]*?)<a href="([^"]+)">(.*?)<\/a>\s*<\/\1>/g,
    '<h2 href="$3">$2$4</h2>',
  );

  const findH = /<h[^>]*>([\s\S]*?)<\/h2>/g;

  text = text.replace(findH, (match) => {
    match = match.replace(/<b>|<\/b>/g, "");
    return match;
  });

  // делаем кнопки
  text = buttonCreator(text, activeFormat);

  text = emoji(text);

  text = text.replace(/(?<=\">)<b>(.*?)<\/b>/g, "$1");

  text = listNumeric(text);

  text = quoteMaker(text);

  text = emojiSize(text);

  return cleaner(text, ["\/label"]);
}

export function grabInside(tag) {
  return new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
}

export function listNumeric(text) {
  // const ol = /<ol>([\s\S]*?)<\/ol>/g;
  const ol = grabInside("ol");

  return text.replace(ol, (match, content) => {
    let num = 1;
    content = content.replace(/<li\b/g, (match) => {
      return `<li num="${num++}"`;
    });
    return `<ol>${content}</ol>`;
  });
}

export function emoji(text) {
  const emojiRegex =
    /(\p{Emoji}\u200D[\p{Emoji}\u200D]*(?:\p{Emoji_Presentation}|\p{Emoji})|[0-9#*]\uFE0F?\u20E3|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})/gu;
  text = text.replace(emojiRegex, (match) => `<em>${match}</em>`);

  const el = grabInside("el");
  const em = grabInside("em");

  text = text.replace(
    /(<p>\s*<em>[^<]*<\/em>[\s\S]*?<\/p>\s*){2,}/g,
    "<el>$&</el>",
  );
  text = text.replace(/<\/el><el>/g, "");
  text = text.replace(el, (match) => {
    return match.replace(/<p>/g, "<li>").replace(/<\/p>/g, "</li>");
  });
  text = text.replace(/<el>(.*?)<\/el>/gs, (elMatch) => {
    return elMatch.replace(/<li>(.*?)<\/li>/gs, (liMatch, liContent) => {
      const emMatch = liContent.match(/<em>(.*?)<\/em>/s);
      if (emMatch) {
        const emContent = emMatch[1];
        const newLiContent = liContent.replace(/<em>.*?<\/em>/s, "");
        return `<li em="${emContent}">${newLiContent}</li>`;
      } else {
        return liMatch;
      }
    });
  });

  return text;
}

export function emojiSize(text) {
  const insideP = /<p([\s\S]*?)<\/p>/g;
  const insideH = /<h2([\s\S]*?)<\/h2>/g;

  return text
    .replace(insideP, (match) => match.replace(/<em>/g, '<em size="15">'))
    .replace(insideH, (match) => match.replace(/<em>/g, '<em size="20">'));
}

export function quoteMaker(text) {
  const quote = /<p><i>([\s\S]*?)<\/i><\/p>/g;

  text = text.replace(quote, (match) => {
    match = match.replace(/<i>|<\/i>/g, "");

    return `<quote>${match}<\/quote>`;
  });

  text = text.replace(/<\/quote>\s*<quote>|<\/i><i>/g, "");

  text = text.replace(
    /<\/quote><(ol|ul|el)>([\s\S]*?)<\/\1><quote>/gi,
    "<$1>$2</$1>",
  );

  text = text.replace(/<quote>([\s\S]*?)<\/quote>/gi, (match) => {
    match = match.replace(/<i>|<\/i>/g, "");
    return match;
  });

  return text;
}

export function buttonCreator(text, activeFormat) {
  text = text
    .replace(
      /\[<a\s+href="([^"]+)">&yelloow;([^<]+)<\/a>\]/g,
      `<btn type="y" href="$1">$2</btn>`,
    )
    .replace(
      /\[<a\s+href="([^"]+)">&red;([^<]+)<\/a>\]/g,
      `<btn-r href="$1">$2</btn-r>`,
    )
    .replace(/\[<a\s+href="([^"]+)">([^<]+)<\/a>\]/g, `<btn href="$1">$2</btn>`)
    .replace(
      /<a\s+href="([^"]+)">&red;\[([^<]+)\]<\/a>/g,
      `</btn-r name="$2" href="$1">`,
    )
    .replace(/<a\s+href="([^"]+)">\[([^<]+)\]<\/a>/g, `<btn href="$1">$2</btn>`)
    .replace(/<a\s+href="([^"]+)">\[([^<]+)<\/a>\]/g, `<btn href="$1">$2</btn>`)
    .replace(/\[<a\s+href="([^"]+)">([^<]+)\]<\/a>/g, `<btn href="$1">$2</btn>`)
    .replace(
      /&grey;\[анкета\[<a href="([^"]+)">&grey;([^"]+)<\/a>&grey;\]\]/g,
      `<anketa-g href="$1">$2</anketa-g>`,
    );

  if (activeFormat === "bs") {
    text = text.replace(/<btn ([^<]+)<\/btn>/g, (match) => {
      if (!match.includes('type="y"')) {
        return match.replace("<btn ", '<btn type="t" ');
      } else {
        return match;
      }
    });
  }

  return cleaner(text, ["\/btn", "\/anketa"]);
}

export function cleaner(str, words) {
  return str.replace(/<p>([\s\S]*?)<\/p>/gi, (match, content) => {
    if (words.some((word) => content.includes(word))) {
      return `${content}`;
    }
    return match;
  });
}

export function bridge(text, activeFormat) {
  text = text.replace(/<br\s*\/?>/gi, "\n");

  const output = [];
  let state = "default";

  const stateRegex = new RegExp(
    `(<p>(${Object.keys(states).join("|")})</p>)`,
    "gi",
  );

  let lastIndex = 0;
  let match;

  while ((match = stateRegex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();

    if (before) {
      output.push(bridgeFormatter(before, state));
    }

    if (state !== "default") {
      output.push(`<!--${state}-end-->`);
    }

    const newStateKey = match[2];
    state = states[newStateKey] || "default";
    output.push(`<!--${state}-start-->`);

    lastIndex = stateRegex.lastIndex;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    output.push(bridgeFormatter(remaining, state, activeFormat));
  }

  if (state !== "default") {
    output.push(`<!--${state}-end-->`);
  }

  return output.join("");
}

export function bridgeFormatter(text, state, activeFormat) {
  let test = false;

  // проверим, в каком формате карточки в доке
  if (state === "card") {
    for (const match of text.matchAll(regex)) {
      if (match[2].includes("https://t-j.ru/")) {
        test = true;
        break;
      }
    }
  }

  if (
    state === "picList" ||
    state === "articleAuthor" ||
    state === "articleComments" ||
    state === "squareCoversSocial" ||
    state === "squareCoversDesc"
  ) {
    text = text.replace(regex, (match, href, linkText) => {
      return `<${shortcodes[state]} href="${href}">\n${linkText}\n<\/${shortcodes[state]}>`;
    });
  } else if (state === "card" && test) {
    text = text.replace(regex, (match, href, linkText) => {
      return `<h2 href="${href}">\n${linkText}\n</h2>`;
    });
  } else {
    text = linksCreator(text, activeFormat);
  }

  return cleaner(text, ["h2", `${shortcodes[state]}`]);
}

export function blockCreator(text, activeFormat) {
  const regexCard = /<!--card-start-->([\s\S]*?)<!--card-end-->/g;
  const regexBlock = /<!--block-start-->([\s\S]*?)<!--block-end-->/g;
  const regexPic = /<!--picList-start-->([\s\S]*?)<!--picList-end-->/g;

  text = text.replace(regexCard, (match, content) => {
    //здесь можно паддинги добавить
    content = addPadding(content, "card", activeFormat);
    return cardCreator(content);
  });

  text = text.replace(regexPic, (match, content) => {
    //здесь можно паддинги добавить
    content = addPadding(content, "default", activeFormat);
    return `<block class="pad-b-0 pad-t-20" pad="25,5">${content}<\/block>`;
  });

  text = text.replace(regexBlock, (match, content) => {
    //здесь можно паддинги добавить
    content = addPadding(content, "default", activeFormat);
    return `<block class="pad-b-20 pad-t-20" pad="25,25">${content}<\/block>`;
  });

  return text;
}

export function addPadding(text, state, activeFormat) {
  const tagRegex = /<(h2|p(?=\s|>)|ul|\/image|el|ol)([^>]*)>/g;
  const quoteRegex = /<quote[^>]*>([\s\S]*?)<\/quote>/g;

  let tags = [];
  let match;

  let quotedTexts = [];
  while ((match = quoteRegex.exec(text)) !== null) {
    quotedTexts.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }

  while ((match = tagRegex.exec(text)) !== null) {
    tags.push({
      tagName: match[1],
      fullTag: match[0],
      index: match.index,
    });
  }

  let result = text;

  tags.forEach((tag, i) => {
    let padValue = 0;

    const nextTag = tags[i + 1];
    const prevTag = tags[i - 1];

    const isInsideQuote = quotedTexts.some(
      (quote) => tag.index >= quote.start && tag.index <= quote.end,
    );

    if (activeFormat === "tj") {
      if (tag.tagName === "p") {
        if (isInsideQuote) {
          padValue = "15,0";
        } else if (nextTag?.tagName === "p") {
          padValue = "0,20";
        } else if (nextTag?.tagName === "ul") {
          padValue = "0,10";
        } else if (nextTag?.tagName === "el") {
          padValue = "0,10";
        } else if (nextTag?.tagName === "ol") {
          padValue = "0,10";
        } else if (nextTag?.tagName === "/image") {
          padValue = "0,30";
        } else {
          padValue = "0,0";
        }
      } else if (tag.tagName === "h2") {
        if (state === "card") {
          padValue = "0,10";
        } else {
          padValue = "0,20";
        }
      }
    } else if (activeFormat === "bs") {
      if (tag.tagName === "p") {
        if (prevTag?.tagName === "p") {
          padValue = "12,0";
        } else if (nextTag?.tagName === "ul") {
          padValue = "12,0";
        } else {
          padValue = "12,0";
        }
      } else if (tag.tagName === "h2") {
        if (prevTag?.tagName === "p") {
          padValue = "48,0";
        } else {
          padValue = "0,0";
        }
      }
    }
    if (padValue != 0) {
      const newTag = `<${tag.tagName} pad="${padValue}"${tag.fullTag.slice(tag.tagName.length + 1)}`;
      result = result.replace(tag.fullTag, newTag);
    } else return;
  });

  return result;
}

export function cardCreator(text) {
  const regexTag = /(<label>[\s\S]*?<\/label>\s*)?<(h2)[^>]*>[\s\S]*?<\/\2>/gi;

  let result = "";
  let lastIndex = 0;
  let openCard = false;
  let match;

  while ((match = regexTag.exec(text)) !== null) {
    if (openCard) {
      result += text.slice(lastIndex, match.index);
      result += `</card>`;
    } else {
      result += text.slice(lastIndex, match.index);
    }

    const hrefMatch = match[0].match(/href="([^"]+)"/i);
    const href = hrefMatch ? hrefMatch[1] : "#";

    result += `<card href="${href}">` + match[0];

    lastIndex = regexTag.lastIndex;
    openCard = true;
  }

  if (openCard) {
    result += text.slice(lastIndex);
    result += `</card>`;
  }

  return `${result}`;
}

export function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "=": "&#61;",
    "/": "&#47;",
  };

  return text.replace(/&(?=(nbsp|#8288))|[<>=/]/g, (match) => map[match]);
}

export function highlight(text) {
  const regex = /(&amp;nbsp;|&amp;#8288;|&amp;laquo;|&amp;raquo;)/g;
  return text.replace(regex, `<span style="color: #f22b71;">$1</span>`);
}
