import { FONTS } from './fonts.js';
import { generateSheet } from './sheet.js';

const loadedFonts = new Set();

function loadGoogleFont(googleFamily) {
  if (!googleFamily || loadedFonts.has(googleFamily)) return;
  loadedFonts.add(googleFamily);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${googleFamily}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

function populateSelect(selectEl, fontList) {
  for (const font of fontList) {
    const opt = document.createElement('option');
    opt.value = font.name;
    opt.textContent = font.name;
    opt.title = font.notes;
    selectEl.appendChild(opt);
  }
}

function findFont(name) {
  const all = [...FONTS.sans, ...FONTS.mono];
  return all.find(f => f.name === name);
}

function init() {
  const primarySelect = document.getElementById('primary-font');
  const secondarySelect = document.getElementById('secondary-font');
  const xHeightInput = document.getElementById('x-height');
  const practiceRowsInput = document.getElementById('practice-rows');
  const paperSizeSelect = document.getElementById('paper-size');
  const sheetTypeSelect = document.getElementById('sheet-type');
  const showGuidesCheckbox = document.getElementById('show-guides');
  const customWordsSection = document.getElementById('custom-words-section');
  const customWordsTextarea = document.getElementById('custom-words');
  const printBtn = document.getElementById('print-btn');
  const page = document.getElementById('preview');

  // Populate font selects
  populateSelect(primarySelect, FONTS.sans);
  populateSelect(secondarySelect, FONTS.mono);

  // Load initial fonts
  loadGoogleFont(findFont(primarySelect.value)?.googleFamily);
  loadGoogleFont(findFont(secondarySelect.value)?.googleFamily);

  // Load font on selection change
  primarySelect.addEventListener('change', () => {
    loadGoogleFont(findFont(primarySelect.value)?.googleFamily);
  });
  secondarySelect.addEventListener('change', () => {
    loadGoogleFont(findFont(secondarySelect.value)?.googleFamily);
  });

  // Toggle custom words visibility based on sheet type
  sheetTypeSelect.addEventListener('change', () => {
    customWordsSection.hidden = sheetTypeSelect.value !== 'words';
  });

  // Paper size class toggle (preview + body class for @page rule)
  function updatePaperSize() {
    page.classList.remove('a4', 'letter');
    page.classList.add(paperSizeSelect.value);
    document.body.classList.toggle('letter-page', paperSizeSelect.value === 'letter');
  }
  paperSizeSelect.addEventListener('change', updatePaperSize);
  updatePaperSize();

  // Print button
  printBtn.addEventListener('click', () => window.print());

  // Re-render on any control change
  const controls = [primarySelect, secondarySelect, xHeightInput, practiceRowsInput,
    paperSizeSelect, sheetTypeSelect, showGuidesCheckbox, customWordsTextarea];

  for (const el of controls) {
    el.addEventListener('change', render);
    el.addEventListener('input', render);
  }

  function render() {
    generateSheet({
      primaryFont: primarySelect.value,
      secondaryFont: secondarySelect.value,
      xHeightMm: parseFloat(xHeightInput.value),
      practiceRows: parseInt(practiceRowsInput.value, 10),
      paperSize: paperSizeSelect.value,
      sheetType: sheetTypeSelect.value,
      showGuideLines: showGuidesCheckbox.checked,
      customWords: customWordsTextarea.value,
    });
  }

  // Initial render
  render();
}

document.addEventListener('DOMContentLoaded', init);
