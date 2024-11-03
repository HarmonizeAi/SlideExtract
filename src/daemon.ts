/*
This file is a daemon that watches a specific directory for changes. When a new mp4 and SRT (subtitle) file is added to the directory, it triggers the execution of a main script.  The main script is responsible for processing the new file and performing any necessary operations.
*/

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Directory to watch (set to 'in' directory)
const directoryToWatch = 'in';

// Function to execute the main script
function runMainScript() {
  const mainScriptPath = path.join(__dirname, 'main.ts');
  exec(`node ${mainScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing main script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error in main script: ${stderr}`);
      return;
    }
    console.log(`Output from main script: ${stdout}`);
  });
}

// Watch the directory for changes
fs.watch(directoryToWatch, (eventType, filename) => {
  if (eventType === 'rename' && filename) {
    const filePath = path.join(directoryToWatch, filename);
    // Check if the file exists (indicating it was added)
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        console.log(`File added: ${filename}`);
        runMainScript();
      }
    });
  }
});

// ... existing code ...
