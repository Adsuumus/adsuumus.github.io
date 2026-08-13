export function minify(html) {
  html = html
    .replace(/[\r\n\s]+/g, " ")
    .replace(/ >/g, ">")
    .replace(/ ">/g, '">')
    .replace(/ \/>/g, "/>")
    .replace(/(?<!^)<!--/g, "\n\n<!--");
  return html;
}

export function deminify(html) {
  html = html
    .replace(/<tr>/g, "\n<tr>")
    .replace(/<tr/g, "\n<tr")
    .replace(/<\/tr>/g, "\n</tr>")
    .replace(/<td>/g, "\n<td>")
    .replace(/<td/g, "\n<td")
    .replace(/<table/g, "\n<table")
    .replace(/<\/td>/g, "\n</td>")
    .replace(/<div>/g, "\n<div>")
    .replace(/<\/div>/g, "\n</div>")
    .replace(/<\/table>/g, "\n</table>");
  return html;
}
