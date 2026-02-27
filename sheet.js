const MM_TO_PX = 96 / 25.4;

const GUIDE_LINES = [
  { name: 'ascender',   color: '#B8D4F0', position: 1.5 },
  { name: 'cap-height', color: '#C8E6C9', position: 1.3 },
  { name: 'x-height',   color: '#FFE0B2', position: 1.0 },
  { name: 'baseline',   color: '#EF9A9A', position: 0 },
  { name: 'descender',  color: '#E1BEE7', position: -0.5 },
];

const ALPHABET_ROWS = [
  { text: 'a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9', font: 'primary', label: 'Lowercase & Numbers' },
  { text: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 0 1 2 3 4 5 6 7 8 9', font: 'primary', label: 'Uppercase & Numbers' },
  { text: 'a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9', font: 'secondary', label: 'Lowercase & Numbers' },
  { text: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 0 1 2 3 4 5 6 7 8 9', font: 'secondary', label: 'Uppercase & Numbers' },
];

function createRow(xHeightPx, showGuideLines, fontFamily, text, isAlphabet = false) {
  // Row spans from ascender (+150%) to descender (-50%) = 200% of x-height
  const rowHeight = 2.0 * xHeightPx;
  // Baseline sits at 150% from the top (ascender is at top)
  const baselineFromTop = 1.5 * xHeightPx;

  const row = document.createElement('div');
  row.className = 'practice-row';
  row.style.height = `${rowHeight}px`;
  row.style.position = 'relative';

  if (showGuideLines) {
    for (const line of GUIDE_LINES) {
      const el = document.createElement('div');
      el.className = `guide-line guide-${line.name}`;
      // position from top: ascender is at 0, baseline is at 1.5*xHeight
      // line.position is relative to baseline, so top = baselineFromTop - line.position * xHeightPx
      const top = baselineFromTop - line.position * xHeightPx;
      el.style.cssText = `
        position: absolute;
        left: 0; right: 0;
        top: ${top}px;
        height: 1px;
        background: ${line.color};
      `;
      row.appendChild(el);
    }
  }

  if (text !== null) {
    const span = document.createElement('div');
    span.className = 'row-text';
    span.style.cssText = `
      position: absolute;
      left: 0; right: 0;
      bottom: ${0.5 * xHeightPx}px;
      font-family: '${fontFamily}', sans-serif;
      font-size: ${xHeightPx * 1.6}px;
      line-height: 1;
      color: #444;
      white-space: nowrap;
    `;

    if (isAlphabet) {
      span.style.display = 'flex';
      span.style.justifyContent = 'space-between';
      const chars = text.replace(/ /g, '').split('');
      for (const char of chars) {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        span.appendChild(charSpan);
      }
    } else {
      span.textContent = text;
    }

    row.appendChild(span);
  }

  return row;
}

function createBlock(config, text, fontType, labelStr = null) {
  const { primaryFont, secondaryFont, xHeightMm, practiceRows, showGuideLines } = config;
  const xHeightPx = xHeightMm * MM_TO_PX;
  const fontFamily = fontType === 'secondary' ? secondaryFont : primaryFont;

  const block = document.createElement('div');
  block.className = 'practice-block';

  if (labelStr) {
    const labelEl = document.createElement('div');
    const baseStr = fontType === 'secondary' ? 'Secondary Font' : 'Primary Font';
    labelEl.textContent = `${baseStr}: ${fontFamily}`;
    
    // Create a smaller span for the case label
    const subLabel = document.createElement('span');
    subLabel.textContent = ` — ${labelStr}`;
    subLabel.style.cssText = `
      font-weight: 400;
      color: #888;
    `;
    labelEl.appendChild(subLabel);

    labelEl.style.cssText = `
      font-size: 0.75rem;
      color: #444;
      margin-bottom: 6px;
      margin-top: 10px;
      font-family: sans-serif;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `;
    block.appendChild(labelEl);
  }

  // Reference row with text
  if (text !== null) {
    const refRow = createRow(xHeightPx, showGuideLines, fontFamily, text, config.sheetType === 'alphabet');
    refRow.classList.add('reference-row');
    block.appendChild(refRow);
  }

  // Empty practice rows
  for (let i = 0; i < practiceRows; i++) {
    const pRow = createRow(xHeightPx, showGuideLines, fontFamily, null);
    block.appendChild(pRow);
  }

  return block;
}

export function generateSheet(config) {
  const preview = document.getElementById('preview');
  preview.innerHTML = '';

  const { sheetType, customWords } = config;

  if (sheetType === 'alphabet') {
    for (const row of ALPHABET_ROWS) {
      preview.appendChild(createBlock(config, row.text, row.font, row.label));
    }
  } else if (sheetType === 'words') {
    const lines = customWords.split('\n').filter(l => l.trim());
    for (const line of lines) {
      preview.appendChild(createBlock(config, line, 'primary'));
    }
  } else if (sheetType === 'free') {
    // Free composition: just ruled rows, no reference text
    // Fill roughly an A4 page worth of rows
    const xHeightPx = config.xHeightMm * MM_TO_PX;
    const rowHeight = 2.0 * xHeightPx;
    const pageContentHeight = (config.paperSize === 'a4' ? 267 : 249.4) * MM_TO_PX; // page minus 2*15mm margins
    const rowCount = Math.floor(pageContentHeight / rowHeight);

    for (let i = 0; i < rowCount; i++) {
      const row = createRow(xHeightPx, config.showGuideLines, config.primaryFont, null);
      row.classList.add('practice-block');
      preview.appendChild(row);
    }
  }
}
