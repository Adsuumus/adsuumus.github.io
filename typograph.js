let activeFormat = "tj";

window.addEventListener("load", () => {
    const savedFormat = localStorage.getItem("activeFormat");
    if (savedFormat) {
        activeFormat = savedFormat;
    }

    document.querySelectorAll(".radio-button").forEach((btn) =>
        btn.classList.remove("active")
    );

    const activeBtn = document.querySelector(`.radio-button[data-value="${activeFormat}"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }

    document.getElementById("typograph-container").focus();
});

document.querySelectorAll(".radio-button").forEach((button) => {
    button.addEventListener("click", function () {
        document
            .querySelectorAll(".radio-button")
            .forEach((btn) => btn.classList.remove("active"));

        this.classList.add("active");

        activeFormat = this.getAttribute("data-value");

        localStorage.setItem("activeFormat", activeFormat);

        updateTypograph();
        document.getElementById("typograph-container").focus();
    });
});

document
    .getElementById("typograph-container")
    .addEventListener("paste", (event) => {
        event.preventDefault();

        let clipboardData = (event.clipboardData || window.clipboardData).getData("text/html");

        if (!clipboardData) {
            clipboardData = (event.clipboardData || window.clipboardData).getData("text/plain");
        }

        if (clipboardData) {
            window.savedDirtyData = clipboardData;
            updateTypograph();
        }
    });

function updateTypograph() {
    const editableDiv = document.getElementById("typograph-container");
    const clipboardData = window.savedDirtyData;

    if (clipboardData) {
        editableDiv.innerHTML = main(clipboardData);
    }
}

const statecode = [
    {doc: 'Карточка статьи:', state: 'card', shortcode: 'card'},
    {doc: 'Карточки статьи:', state: 'card', shortcode: 'card'},
    {doc: 'Квадратные обложки:', state: 'picList', shortcode: 'pic-list'},
    {doc: 'Блок:', state: 'block', shortcode: 'block'},
    {doc: 'Статьи с комментами:', state: 'articleComments', shortcode: 'article-comments'},
    {doc: 'Блок с картинкой:', state: 'blockImage', shortcode: 'block-img'},
];

const states = Object.fromEntries(statecode.map(el => [el.doc, el.state]));
const shortcodes = Object.fromEntries(statecode.map(el => [el.state, el.shortcode]));

function main(text) {
    text = decodeHtml(text);
    text = cleanHtml(text);

    const tags = [];
    text = text.replace(/<[^>]*>/g, (match) => {
        tags.push(match);
        return `__TAG_${tags.length - 1}__`;
    });

    text = highlightDashes(text);

    text = typography(text);

    text = formattingDate(text);

    text = text.replace(/__TAG_(\d+)__/g, (match, index) => {
        return tags[parseInt(index, 10)];
    });

    if (activeFormat === 'tj') {
        text = bridge(text);
        text = blockCreator(text);
    }

    if (activeFormat === 'easy') {
        text = clean(text);
    }

    if (activeFormat === 'bs') {
        text = addPadding(text);
    }

    text = presentation(text);

    text = escapeHtml(text);

    text = highlight(text);

    return text;
}

const regex = /<a\s+href="([^"]+)">([^<]+)<\/a>/g;

function linksCreator(text) {
    text = text.replace(regex, (match, href, linkText) => {
        if (activeFormat === "tj" || activeFormat === "easy") {
            return `<a href="${href}" target="_blank" style="text-decoration: none; color: #1414cc"><span class="dm_col-B2BDFF link2-und-hov" style="color: #1414cc">${linkText}</span></a>`;
        } else if (activeFormat === "bs") {
            return `<a href="${href}" target="_blank" style="text-decoration: none; color: #0068ff"><span class="dm-col-66A3FF" style="color: #0068ff">${linkText}</span></a>`;
        } else {
            return `<a class="link-interactive" href="${href}" target="_blank">${linkText}</a>`;
        }
    });
    return text;
}

function clean(text) {
    const cleaner = /\n\n\n/g;

    text = linksCreator(text)

    text = text.replace(/<\/p>/g, '\n\n').replace(/<p>|<\/p>/g, '').replace(/<b>|<\/b>/g, '').replace(cleaner, '\n')
    return text;
}

function decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.innerHTML;
}

const styleMap = [
    { regex: /font-weight:700/i, type: 'tag', value: 'b' },
    { regex: /font-style:italic/i, type: 'tag', value: 'i' },
    { regex: /font-size:10pt/i, type: 'tag', value: 'label' },
    { regex: /background-color:#ffff00/i, type: 'mark', value: '&yelloow;' },
    { regex: /background-color:#efefef/i, type: 'mark', value: '&grey;' },
    { regex: /background-color:#d9ead3/i, type: 'mark', value: '&green;' },
    { regex: /background-color:#e6b8af/i, type: 'mark', value: '&red;' },
    { regex: /background-color:#0000ff/i, type: 'mark', value: '&blue;' }
];

function marker(text) {
    const parts = text.split("<p");

    const processed = parts.map((part, index) => {
        if (index === 0) return part;

        const hasAll =
            part.includes("background-color") &&
            part.includes("[") &&
            part.includes("]") &&
            part.includes("href");

        part = part.replace(/<span[^>]*style="([^"]*)"[^>]*>(.*?)<\/span>/gi, (_, style, content) => {
            style = style.toLowerCase();
            for (const map of styleMap) {
                if (map.regex.test(style)) {
                    if (map.type === 'tag') {
                        return `<${map.value}>${content}</${map.value}>`;
                    }
                    if (map.type === 'mark' && hasAll) {
                        return `${map.value}${content}`;
                    }
                }
            }
            return content;
        });

        return "<p" + part;
    });

    text = processed.join("");

    text = text.replace(/<span[^>]*>/g, '')
        .replace(/<\/span>/g, '');

    return text;
}

function cleanHtml(text) {
    text = text
        .replace(/&nbsp;/g, " ")
        .replace(/^\n+|\n+$/g, "")
        .replace(/\u00AD/g, "")
        .replace(/\u200b/g, "")
        .replace(/\[<br\s\S]*?>/g, "<br>");

    text = text.replace(/<meta[^>]*>/g, "");
    text = text.replace(/<br class="Apple-interchange-newline">/g, "");

    text = marker(text);

    // чистим b
    text = text.replace(/(?<=\">)<b>(.*?)<\/b>/g, "$1");
    text = text.replace(/<b><\/b>|\n<\/b>/g, "");
    text = text.replace(/<\/b>$/, "");
    text = text.replace(/<b [^>]*>/g, "");
    text = text.replace(/<b> ([\s\S]*?)<\/b>/g, " <b>$1</b>");
    text = text.replace(/<b>([\s\S]*?) <\/b>/g, "<b>$1</b> ");
    text = text.replace(/<b><\/b>/g, "");


    text = text.replace(/<(p|li|ol|ul)[^>]*>/g, '<$1>');

    const list = /<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/g;
    text = text.replace(list, (match, content) => {
        return `<li>${content}</li>`;
    });

    text = text.replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, '<h2>$1</h2>');

    //двигаем лейбл из-за г-докс
    text = text.replace(
        /<\/label><label>/,
        ''
    );
    text = text.replace(
        /<h2>((?:<label>[\s\S]*?<\/label>)+)((?:<a[\s\S]*?<\/a>))<\/h2>/,
        '$1\n<h2>$2</h2>'
    );


    text = text.replace(/<a([^>]*?)\s+href="([^"]+)".*?>/g, '<a href="$2">');
    //text = text.replace(/<h1/g, `<h2`).replace(/<\/h1/g, `</h2`);
    // text = text.replace(/<(h[1-3])>\s*<a href="([^"]+)">(.*?)<\/a>\s*<\/\1>/g, '<$1 href="$2">\n$3\n</$1>');
    text = text.replace(/<(h[1-3])>\s*<a href="([^"]+)">(.*?)<\/a>\s*<\/\1>/g, '<h2 href="$2">\n$3\n</h2>');

    // делаем кнопки
    text = buttonCreator(text);

    // сделать это в конце
    // text = text.replace(/(<\/h2>)|(<\/p>)|(<br \/>)/g, "$&\n");

    const emojiRegex = /(\p{Emoji}\u200D[\p{Emoji}\u200D]*(?:\p{Emoji_Presentation}|\p{Emoji})|[0-9#*]\uFE0F?\u20E3|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})/gu;
    text = text.replace(emojiRegex, (match) => `<em>${match}</em>`);

    //работаем с эмоджи
    text = text.replace(/(<p>\s*<em>[^<]*<\/em>[\s\S]*?<\/p>\s*){2,}/g, "<el>$&</el>");
    text = text.replace(/<\/el><el>/g, "");
    text = text.replace(/<el>(.*?)<\/el>/g, (match) => {
        return match.replace(/<p>/g, "<li>").replace(/<\/p>/g, "</li>");
    });


    return cleaner(text, ['\/label']);
}

function buttonCreator(text) {

    text = text.replace(/\[<a\s+href="([^"]+)">&yelloow;([^<]+)<\/a>\]/g, `</btn-y name="$2" href="$1">`)
        .replace(/\[<a\s+href="([^"]+)">&red;([^<]+)<\/a>\]/g, `</btn-r name="$2" href="$1">`)
        .replace(/\[<a\s+href="([^"]+)">([^<]+)<\/a>\]/g, `</btn name="$2" href="$1">`)
        .replace(/<a\s+href="([^"]+)">&red;\[([^<]+)\]<\/a>/g, `</btn-r name="$2" href="$1">`)
        .replace(/<a\s+href="([^"]+)">\[([^<]+)\]<\/a>/g, `</btn name="$2" href="$1">`)
        .replace(/<a\s+href="([^"]+)">\[([^<]+)<\/a>\]/g, `</btn name="$2" href="$1">`)
        .replace(/\[<a\s+href="([^"]+)">([^<]+)\]<\/a>/g, `</btn name="$2" href="$1">`)
        .replace(/&grey;\[анкета\[<a href="([^"]+)">&grey;([^"]+)<\/a>&grey;\]\]/g, `</anketa-grey name="$2" href="$1">`);

    return cleaner(text, ['\/btn', '\/anketa']);
}

function cleaner(str, words) {
    return str.replace(/<p>([\s\S]*?)<\/p>/gi, (match, content) => {
        if (words.some(word => content.includes(word))) {
            return `${content}`;
        }
        return match;
    });
}

function bridge(text) {
    text = text.replace(/<br\s*\/?>/gi, "\n");

    const output = [];
    let state = "default";

    const stateRegex = new RegExp(`(<p>(${Object.keys(states).join("|")})</p>)`, "gi");

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
        output.push(bridgeFormatter(remaining, state));
    }

    if (state !== "default") {
        output.push(`<!--${state}-end-->`);
    }

    return output.join("");
}

function bridgeFormatter(text, state) {
    let test = false;

// проверим, в каком формате карточки в доке
    if (state === 'card') {
        for (const match of text.matchAll(regex)) {
            if (match[2].includes('https://t-j.ru/')) {
                test = true;
                break;
            }
        }
    }

    if (state === 'picList' || state === 'articleAuthor' || state === 'articleComments' || state === 'squareCoversSocial' || state === 'squareCoversDesc' ) {
        text = text.replace(regex, (match, href, linkText) => {
            return `<${shortcodes[state]} href="${href}">\n${linkText}\n<\/${shortcodes[state]}>`;
        });
    } else if (state === 'card' && test) {
        text = text.replace(regex, (match, href, linkText) => {
            return `<h2 href="${href}">\n${linkText}\n</h2>`;
        });
    } else {
        text = linksCreator(text);
    }

    return cleaner(text, ['h2', `${shortcodes[state]}`]);
}

function blockCreator(text) {
    const regexCard = /<!--card-start-->([\s\S]*?)<!--card-end-->/g;
    const regexBlock = /<!--block-start-->([\s\S]*?)<!--block-end-->/g;
    const regexPic = /<!--picList-start-->([\s\S]*?)<!--picList-end-->/g;

    text = text.replace(regexCard, (match, content) => {
        //здесь можно паддинги добавить
        content = addPadding(content, 'card');
        return cardCreator(content);
    });

    text = text.replace(regexPic, (match, content) => {
        //здесь можно паддинги добавить
        content = addPadding(content, 'default');
        return `<block class="pad-b-0 pad-t-25" pad="25,5">${content}<\/block>`;
    });

    text = text.replace(regexBlock, (match, content) => {
        //здесь можно паддинги добавить
        content = addPadding(content, 'default');
        return `<block class="pad-b-20 pad-t-20" pad="25,25">${content}<\/block>`;
    });


    return text;
}

function addPadding(text, state) {
    const tagRegex = /<(h2|p(?=\s|>)|ul|\/image|el|ol)([^>]*)>/g;
    const quoteRegex = /<quote[^>]*>([\s\S]*?)<\/quote>/g;

    let tags = [];
    let match;

    let quotedTexts = [];
    while ((match = quoteRegex.exec(text)) !== null) {
        quotedTexts.push({
            start: match.index, end: match.index + match[0].length, content: match[1],
        });
    }

    while ((match = tagRegex.exec(text)) !== null) {
        tags.push({
            tagName: match[1], fullTag: match[0], index: match.index,
        });
    }

    let result = text;

    tags.forEach((tag, i) => {
        let padValue = 0;

        const nextTag = tags[i + 1];
        const prevTag = tags[i - 1];

        const isInsideQuote = quotedTexts.some((quote) => tag.index >= quote.start && tag.index <= quote.end);

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
                if (state === 'card') {
                    padValue = "0,10";
                }
                else {
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

function cardCreator(text) {
    const regexTag = /(<label>[\s\S]*?<\/label>\s*)?<(h2)[^>]*>[\s\S]*?<\/\2>/gi;

    let result = '';
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
        const href = hrefMatch ? hrefMatch[1] : '#';

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

function formattingDate(text) {
    const months = /(^|\s|&nbsp;)(январ[яеь][,.]?|феврал[яеь][,.]?|март[ае]?[,.]?|апрел[ьяе][,.]?|ма[ейя][,.]?|июн[ьяе][,.]?|июл[ьяе][,.]?|август[ае]?[,.]?|сентябр[яеь][,.]?|октябр[яеь][,.]?|ноябр[яеь][,.]?|декабр[яеь][,.]?|понедельник[ау][,.]?|вторник[ау]?[,.]?|сред[ау][,.]?|четверг[ау][,.]?|пятниц[ауе][,.]?|суббот[ауе][,.]?|воскресень[ея][,.]?|завтра[,.]?|послезавтра[,.]?|неделе[,.]?)()(?=\s|&nbsp;|$)/gi;

    text = text.replace(months, (match, p1, month) => {
        const prefix = p1 || "";
        return `${prefix}${month.slice(0, 2)}&#8288;${month.slice(2)}`;
    });

    text = text.replace(/(?<=\.)(ru|рф|com|online)/g, "&#8288;$1");

    return text;
}

function typography(text) {
    const dash = /(>)([а-яА-Яa-zA-Z0-9]{1,4})([-–—−])([а-яА-Яa-zA-Z0-9]{1,4})/g;
    text = text.replace(dash, (match, p1, p2, p3, p4) => {
        if (/\d([-–—−]\d)/.test(match)) {
            return match;
        }
        return `${p1}${p2}&#8288;${p3}&#8288;${p4}`;
    });

    const period = /(\s)([0-9]+(?:,[0-9]+)?[-–—−][0-9]+(?:,[0-9]+)?)(?:\s([А-ЯЁа-яё&#8288;]+[.,!]?))?/g;
    if (activeFormat !== "easy") {
        text = text.replace(period, (match, p1, p2, p3) => `${p1}<span style="white-space: nowrap;">${p2}${p3 ? ` ${p3}` : ""}</span>`);

        const iz_za = /([Ии]з&#8288;[-–—−]&#8288;за)\s+([А-ЯЁа-яё]+)/g;
        text = text.replace(iz_za, (match, p1, p2) => `<span style="white-space: nowrap;">${match}</span>`);
    }
    /*    const IZ_ZA = /(^|\s)(из-за)(\s|$)/g;
    text = text.replace(
      IZ_ZA,
      (match, p1, p2, p3) => `${p1}${p2}&nbsp;${p3}`
    ); */

    const NBSP_CELSIUS = /(^|\d+)([ ])°C/g;
    text = text.replace(NBSP_CELSIUS, (match, p1, p2) => `${p1}&nbsp;°C`);

    const NBSP_LIZHEBI = /([А-ЯЁа-яё])([ ])(ли|ль|же|ж|бы|б)([^А-ЯЁа-яё])/g;
    text = text.replace(NBSP_LIZHEBI, (match, p1, p2, p3, p4) => `${p1}&nbsp;${p3}${p4}`);

    const NBSP_MLN = /(^|[^0-9—])(\d+,?\d*)([ ])(тыс|млн|млрд|трлн)/g;
    text = text.replace(NBSP_MLN, (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`);

    const NBSP_STR = /(^|[^А-ЯЁа-яё—\-])стр\.([ ])\d+/g;
    text = text.replace(NBSP_STR, (match, p1, p2) => `${p1}стр.&nbsp;`);

    const NBSP_ANY_NUMBER = /(^|[^—0-9<])(\d+,?\d*)([ ])([A-Za-zА-Яа-я<]+)/g;
    text = text.replace(NBSP_ANY_NUMBER, (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`);

    const NBSP_COMP_NUMBER = /(^|[^—0-9])(\d+,?\d*)([ ])(\d+)/g;
    text = text.replace(NBSP_COMP_NUMBER, (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`);

    const NBSP_THREE_NUMBERS = /(^|[^—0-9])(\d{2,},?\d+)([ ])([A-Za-zА-Яа-я]+)/g;
    text = text.replace(NBSP_THREE_NUMBERS, (match, p1, p2, p3, p4) => `${p1}${p2}&nbsp;${p4}`);

    const NBSP_ONE_TWO_LETTERS = /(^|[^А-ЯЁа-яё—&#8288;\-])([Уу]л\.|[Нн]о|[Ее]е|[Сс]о(,)?|[Нн]а(,)?|[Ии]х(,)?|[Ии]м(,)?|[Тт]ы(,)?|[Тт]о(,)?|[Нн]и(,)?|[Вв]ы(,)?|[Зз]а(,)?|[Нн]у(,)?|[Нн]е(,)?|[Вв]о|[Пп]о|[Нн]е(,)?|[Оо]т(,)?|[Оо]б(,)?|[Оо]н(,)?|[Кк]о(,)?|[Мм]ы(,)?|[Дд]а(,)?|[Дд]о(,)?|[Ии]з|[Ее]й|[Ее]ю(,)?|[Яя](,)?|[Аа](,)?|[Ии](,)?|[Оо](,)?|[Уу](,)?|[Вв](,)?|[Сс](,)?|[Кк](,)?)(?= )/g;

    text = text.replace(NBSP_ONE_TWO_LETTERS, "$1$2&nbsp;");

    // неразрыв перед тире, удаление пробела перед тире
    text = text.replace(/\s*—(?=\s|$)/g, "&nbsp;—");

    const NBSP_RUB = /(^|\d+)([ ])₽/g;
    text = text.replace(NBSP_RUB, (match, p1, p2) => `${p1}&nbsp;₽`);

    text = text.replace(/(?<=[А-ЯЁа-яё]) (РФ|РФ.)/g, "&nbsp;$1");

    text = text.replace(/([А-ЯЁа-яё]) (\d+%)/g, "$1&nbsp;$2");

    const pretex = /(^|[^А-ЯЁа-яё—\-])([Ff]or|[Aa]nd|[Tt]he|[Уу]л\.|[Бб]ез|[Пп]ри|[Нн]ад|[Пп]од|[Пп]ро|[Дд]ля|[Оо]бо|[Ии]ли)([ ])(?=[^ \xa0])/g;
    text = text.replace(pretex, (match, p1, p2, p3) => `${p1}${p2}&nbsp;`);

    const exclusion = /(?<=^|[^А-ЯЁа-яё])([Пп]отому что|[Тт]ак как|[Оо]бо мне|[Вв]не контекста|[Вв]се равно|[Кк]роме того|[Тт]ак и|[Кк]ак и)(?=[^А-ЯЁа-яё]|$)/g;
    text = text.replace(exclusion, (match) => match.replace(" ", "&nbsp;"));

    text = text.replace(/&nbsp;\s+/g, "&nbsp;");

    text = text.replace(/&nbsp;по /g, "&nbsp;по&nbsp;").replace(/&nbsp;до /g, "&nbsp;до&nbsp;");

    text = text.replace(/&nbsp;&nbsp;/g, "&nbsp;");

    return text;
}

function highlightDashes(text) {
    const words = text.split(" ");
    const result = words.map((word, index, array) => {

        if (activeFormat !== "easy" && /\d([-–—−]\d)/.test(word)) {
            return word;
        }

        const parts = word.split(/([-–—−])/);

        return parts
            .map((part, index) => {
                if (index % 2 === 1 && parts[index - 1] && parts[index + 1] && !(parts[index - 1].endsWith(" ") || parts[index + 1].startsWith(" ")) && (parts[index + 1].replace(/[«».,!?;</p></a>]|__TAG_\d+__/g, "").length < 5 || parts[index - 1].replace(/[«».,!?;</p></a>]|__TAG_\d+__/g, "").length < 5 || parts[index + 1]
                    .replace(/[«».,!?;</p>]]/g, "")
                    .toLowerCase() === "нибудь")) {
                    return `&#8288;${part}&#8288;`;
                }
                return part;
            })
            .join("");
    });

    return result.join(" ");
}

function escapeHtml(text) {
    text = text.replace(/<br>/g, "");
    const map = {
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "=": "&#61;", "/": "&#47;",
    };

    return text.replace(/&(?=(nbsp|#8288))|[<>=/]/g, (match) => map[match]);
}

function highlight(text) {
    // const regex = /&[a-zA-Z0-9#]+;/g;
    const regex1 = /(&amp;nbsp;)/g;
    const regex2 = /(&amp;#8288;)/g;

    return text
        .replace(regex1, `<span style="color: #f22b71">$1</span>`)
        .replace(regex2, `<span style="color: #f22b71;">$1</span>`);
}

function presentation(text) {
    const cleaner = /\n\n\n/g;
    const listEnd = /(<\/ul[\s\S]*?>|<\/ol[\s\S]*?>|<\/el[\s\S]*?>|<\/btn[\s\S]*?>)/g;
    const listStart = /(<ul[\s\S]*?>|<ol[\s\S]*?>|<el[\s\S]*?>|<li[\s\S]*?>|<em[\s\S]*?>|<card[\s\S]*?>|<block[\s\S]*?>|<p[\s\S]*?>|<h2[\s\S]*?>)/g;
    const listInner = /(<\/li[\s\S]*?>|<\/em[\s\S]*?>|<\/h2[\s\S]*?>)/g;

    const base = /(<\/p[\s\S]*?>|<\/card>|<\/block>)/g;

    return text.replace(listEnd, `$1\n\n`).replace(listStart, `$1\n`).replace(listInner, `\n$1\n`)
        .replace(base, `\n$1\n\n`)
        .replace(cleaner, `\n`)
}