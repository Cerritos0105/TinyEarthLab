const fs = require('fs');
const content = fs.readFileSync('d:/TEL/src/Dashboard.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let startIndex = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('import { useState, useEffect, useRef } from "react";') && i > 0) {
    startIndex = i;
    break;
  }
}

if (startIndex > 0) {
  const fixedContent = lines.slice(startIndex).join('\n');
  fs.writeFileSync('d:/TEL/src/Dashboard.jsx', fixedContent);
  console.log('Removed duplicated header, file starts from original import now.');
} else {
  console.log('Could not find duplicated import.');
}
