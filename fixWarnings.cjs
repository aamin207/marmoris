const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');
code = code.replace(
  "const remoteCart = res.data || res;",
  "const remoteCart = res.data || res;\n          if (res.warnings && Array.isArray(res.warnings) && res.warnings.length > 0) {\n            alert(res.warnings.join('\\n'));\n          }"
);
fs.writeFileSync('src/context/AppContext.tsx', code);
