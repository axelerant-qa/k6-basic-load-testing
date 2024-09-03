
const reporter = require('k6-html-reporter');

const options = {
        jsonFile: './scripts/test_results.json',
        output: 'report',
    };

reporter.generateSummaryReport(options);
    