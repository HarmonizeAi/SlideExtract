/*
This file is a daemon that watches a specific directory for changes. When a new MP4 and SRT (subtitle) file is added to the directory, it triggers the execution of a main script. The main script is responsible for processing the new file and performing any necessary operations.
*/

import { exec } from 'child_process';
import { watch } from 'chokidar';

const directoryToWatch = 'in';

function startWatcher() {
  watch(directoryToWatch, { persistent: true })
    .on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
      // Here you can trigger the main script to process the new file

      // Execute the main script
      exec(`npx tsx main.ts ${filePath}`);
    })
    .on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      // Handle file changes if necessary
    })
    .on('unlink', (filePath) => {
      console.log(`File removed: ${filePath}`);
      // Handle file removal if necessary
    });
}

// Start the watcher
startWatcher();
