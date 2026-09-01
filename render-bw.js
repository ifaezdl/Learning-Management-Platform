const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');

const html = fs.readFileSync('activity-diagram-bw.html', 'utf8');
const match = html.match(/<svg[\s\S]*?<\/svg>/);
let svg = match[0];
if (!svg.includes('xmlns=')) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');

const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 2480 },
    font: { loadSystemFonts: true },
    logLevel: 'off',
});
const pngData = resvg.render();
const buf = pngData.asPng();
fs.writeFileSync('educore-activity-diagram-bw.png', buf);
console.log('B&W PNG: ' + buf.length + ' bytes');
