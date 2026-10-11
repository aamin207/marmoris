const fs = require('fs');
const code = fs.readFileSync('src/lib/api.ts', 'utf-8');
const newCode = code.replace(
  "throw new Error(errorBody.message || `API error returned status code ${response.status}`);",
  "throw new Error(errorBody.message || `API error returned status code ${response.status}: ${JSON.stringify(errorBody)}`);"
);
fs.writeFileSync('src/lib/api.ts', newCode);
