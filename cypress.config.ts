import { defineConfig } from 'cypress';
import getCompareSnapshotsPlugin from 'cypress-visual-regression/dist/plugin';

export default defineConfig({
    screenshotsFolder: './cypress/snapshots',
    trashAssetsBeforeRuns: true,
    video: false,
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
            getCompareSnapshotsPlugin(on, config);
        },
    },
});
