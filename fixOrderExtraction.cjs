const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');
code = code.replace(
  "const placedOrder = orderRes.data?.order || orderRes.order || orderRes;",
  "const placedOrder = orderRes.data || orderRes.order || orderRes;"
);
fs.writeFileSync('src/context/AppContext.tsx', code);
