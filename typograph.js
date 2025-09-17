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


function updateTypograph() {
    const editableDiv = document.getElementById("typograph-container");
    const clipboardData = window.savedDirtyData;

    if (clipboardData) {
        const cleanData = main(clipboardData);
        editableDiv.innerHTML = cleanData;
    }
}

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

// document
//     .getElementById("downloadButton")
//     .addEventListener("click", () => {
//         const text = document.getElementById("typograph-container").textContent;
//         const blob = new Blob([text], {type: "text/html"});
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "document.html";
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//     });

function main(text) {
    text = decodeHtml(text);

    text = saveTags(text);

    text = removeTags(text);

    // экранируем содержимое тегов от типографа
    const tags = [];
    text = text.replace(/<[^>]*>/g, (match) => {
        tags.push(match);
        return `__TAG_${tags.length - 1}__`;
    });

    // типографика
    text = highlightDashes(text);

    text = typography(text);

    text = formattingDate(text);

    // возвращаем содержимое тегов
    text = text.replace(/__TAG_(\d+)__/g, (match, index) => {
        return tags[parseInt(index, 10)];
    });

    text = links(text);
    text = addPaddingToTags(text);

    if (activeFormat === 'easy') {
        text = cleaner(text);
    }

    text = escapeHtml(text);
    text = highlight(text);

    return text;
}

function decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.innerHTML;
}

function saveTags(text) {
    const regex = /<span[^>]*style="[^"]*font-weight:700;[^"]*">(.*?)<\/span>/g;

    text = text.replace(regex, (match, content) => {
        return `<b>${content}</b>`;
    });

    const quote = /<span[^>]*font-style:italic;[^>]*>(.*?)<\/span>/g;

    text = text.replace(quote, (match, content) => {
        return `<q1>${content}</q1>`;
    });

    const yellow = /(?<=<a[^>]*?>)<span[^>]*style="[^"]*background-color:#ffff00;[^"]*"[^>]*>(.*?)<\/span>/g;

    text = text.replace(yellow, (match, content) => {
        return `<yellow>${content}`;
    });

    const list = /<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/g;
    text = text.replace(list, (match, content) => {
        return `<li>${content}</li>`;
    });

    const test = /<p[^>]*><span[^>]*>\/Карточка:<\/span><\/p>/g;
    text = text.replace(test, `<isee>Карточка статьи:</isee>`);

    text = text.replace(/<h(\d)[^>]*>/g, `<h$1>`);
    text = text.replace(/<p[^>]*>/g, `<p>`);
    text = text.replace(/<li[^>]*>/g, `<li>`);
    text = text.replace(/<ol[^>]*>/g, `<ol>`);
    text = text.replace(/<ul[^>]*>/g, `<ul>`);

    text = text.replace(/<h1/g, `<h2`).replace(/<\/h1/g, `</h2`);

    return text;
}

function cleaner(text) {
    return text.replace(/<p>|<\/p>\n\n/g, '').replace(/<b>|<\/b>/g, '')
}

function removeTags(text) {
    text = text
        .replace(/&nbsp;/g, " ")
        .replace(/^\n+|\n+$/g, "")
        .replace(/\u00AD/g, "")
        .replace(/\u200b/g, "");

    const allowedTags = ["a", "b", "li", "ol", "ul", "isee", "q1", "img", "p", "h1", "h2", "h3", "h4", "h5", "h6", "br",];

    text = text.replace(/<\/?([a-zA-Z0-9-]+)[^>]*>/g, (match, tag) => {
        return allowedTags.includes(tag) ? match : "";
    });
    text = text.replace(/<br class="Apple-interchange-newline">/g, "");

    const emojiRegex = /(\p{Emoji}\u200D[\p{Emoji}\u200D]*(?:\p{Emoji_Presentation}|\p{Emoji})|[0-9#*]\uFE0F?\u20E3|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})/gu;
    text = text.replace(emojiRegex, (match) => `<em>${match}</em>`);

    text = text.replace(/<\/em><em>/g, "");

    text = text.replace(/<b><em>([\s\S]*?)<\/em>/g, "<em>$1<\/em><b>");

    text = text.replace(/<p><q1>([\s\S]*?)<\/q1><\/p>/g, "<q>$1</q>");
    text = text.replace(/<p><q1>([\s\S]*?)<\/q1><\/a><\/p>/g, "<q>$1</a></q>");

    text = text.replace(/<q1>|<\/q1>/g, "");

    text = text.replace(/<a([^>]*?)\s+href="([^"]+)".*?>/g, '<a href="$2">');

    text = text.replace(/<p><a href="([^"]+)"><b>(.*?)<\/b><\/a><\/p>/g, '<h2 href="$1">$2</h2>');

    text = text.replace(/<(h[1-3])>\s*<a href="([^"]+)">(.*?)<\/a>\s*<\/\1>/g, '<$1 href="$2">\n$3\n</$1>');

    // чистим b
    text = text.replace(/(?<=\">)<b>(.*?)<\/b>/g, "$1");
    text = text.replace(/<b><\/b>|\n<\/b>/g, "");
    text = text.replace(/<\/b>$/, "");
    text = text.replace(/<b [^>]*>/g, "");

    text = text.replace(/<b> ([\s\S]*?)<\/b>/g, " <b>$1</b>");
    text = text.replace(/<b>([\s\S]*?) <\/b>/g, "<b>$1</b> ");

    text = text.replace(/(<p>\s*<em>[^<]*<\/em>[\s\S]*?<\/p>\s*){2,}/g, "<el>$&</el>");

    text = text.replace(/<\/el><el>/g, "");
    text = text.replace(/<el>(.*?)<\/el>/g, (match) => {
        return match.replace(/<p>/g, "<li>").replace(/<\/p>/g, "</li>");
    });

    //цитаты

    text = text
        .replace(/<p><a href="([^"]+)">([^<]*)<\/a><\/p><p>([^<]*)<\/p>((<q>.*?<\/q>\s*)+)/g, '<quote name="$2" desc="$3" src="https://static2.tinkoffjournal.ru/fama/tj_prod/static/default_avatars/default_avatar_1.png" href="$1">\n$4</quote>')
        .replace(/<p><a href="([^"]+)">([^<]*)<\/a><\/p>((<q>.*?<\/q>\s*)+)/g, '<quote name="$2" src="https://static2.tinkoffjournal.ru/fama/tj_prod/static/default_avatars/default_avatar_1.png" href="$1">\n$3</quote>');

    //картинки

    text = text.replace(/<p>(<img[^>]*>)<\/p>/g, "$1");

    text = text.replace(/<img([^>]*?)\s+src="([^"]+)".*?>/g, '<img src="$2">');

    text = text
        .replace(/<p><a([^>]*?)><img([^>]*?)><\/a><\/p>/g, '</imgage border="0"$1$2>')
        .replace(/<img([^>]*?)>/g, '</image border="0"$1>');

    return text;
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

function links(text) {
    const sq = /<p>Картинка квадратная:(.*?)<br>/gs;
    text = text.replace(sq, (match) => match
        .replace(/\<a\s+href="([^"]+)">([^<]+)<\/a>/g, (match, href, linkText) => {
            return `\n</pic-list title="${linkText}" href="${href}">\n`;
        })
        .replace(/<p>|<\/p>|Картинка квадратная:/g, ""));

    text = text.replace(/\[<a\s+href="([^"]+)">([^<]+)<\/a>\]/g, (match, href, linkText) => {
        return `</btn name="${linkText}" href="${href}">`;
    });

    text = text.replace(/<a\s+href="([^"]+)">\[([^<]+)\]<\/a>/g, (match, href, linkText) => {
        return `</btn name="${linkText}" href="${href}">`;
    });

    text = text.replace(/<p><\/btn([^>]*)><\/p>/g, "</btn$1>\n\n");

    text = text.replace(/<a\s+href="([^"]+)">([^<]+)<\/a>/g, (match, href, linkText) => {
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

function addPaddingToTags(text) {
    text = text.replace(/<q>/g, "<p>").replace(/<\/q>/g, "</p>");
    text = text.replace(/<(p)>/g, "<$1>\n");

    text = text.replace(/<(\/p)>/g, "\n<$1>\n\n");
    text = text.replace(/<\/p>\s*<\/quote>/g, "</p>\n</quote>\n\n");
    text = text.replace(/<(\/h(\d))>/g, "<$1>\n\n");

    text = text.replace(/<li><em>([^<]*)<\/em>/g, "<em>\n$1\n<\/em>\n<li>");
    text = text.replace(/<(\/li)>/g, "\n<$1>\n");
    text = text.replace(/<(li)>/g, "<$1>\n");
    text = text.replace(/<(el|ul|ol)>/g, "<$1>\n");
    text = text.replace(/<(\/ul|\/ol|\/el)>/g, "<$1>\n\n");

    text = text.replace(/<img([^>]*?)>/g, "<img $1>\n\n");

    const tagRegex = /<(h2|p|ul|\/image|el|ol)([^>]*)>/g;
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
                if (nextTag?.tagName === "p") {
                    padValue = "0,20";
                } else {
                    padValue = "0,0";
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

function escapeHtml(text) {
    text = text.replace(/<br>/g, "");
    const map = {
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "=": "&#61;", "/": "&#47;",
    };

    return text.replace(/&(?=(nbsp|#8288))|[<>=/]/g, (match) => map[match]);
}

function highlight(text) {
    const regex1 = /(&amp;nbsp;)/g;
    const regex2 = /(&amp;#8288;)/g;
    return text
        .replace(regex1, `<span style="color: #f22b71">$1</span>`)
        .replace(regex2, `<span style="color: #f22b71;">$1</span>`);
}
