const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');

const svg = fs.readFileSync('educore-quiz-sequence-diagram.svg', 'utf8');

const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 2480 },
    font: { loadSystemFonts: true },
    logLevel: 'off',
});

const pngData = resvg.render();
const buf = pngData.asPng();
fs.writeFileSync('educore-quiz-sequence-diagram.png', buf);
console.log('Sequence Diagram PNG: ' + buf.length + ' bytes');
console.log('Dimensions: 2480 x ~3380 (A4 Portrait @ ~300dpi)');
