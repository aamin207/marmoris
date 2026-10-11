const fs = require('fs');
let code = fs.readFileSync('src/app/order-tracking/page.tsx', 'utf-8');
code = code.replace("import clsx from 'clsx';", "");
code = code.replace(
  "className={clsx(\"font-bold\", {",
  "className={`font-bold ${"
);
code = code.replace(
  "'text-blue-600': result.status_color === 'blue',\n                  'text-green-600': result.status_color === 'green',\n                  'text-yellow-600': result.status_color === 'yellow',\n                  'text-orange-600': result.status_color === 'orange',\n                  'text-rose-600': result.status_color === 'red',\n                  'text-brand-charcoal': !result.status_color\n                })}>",
  "result.status_color === 'blue' ? 'text-blue-600' : result.status_color === 'green' ? 'text-green-600' : result.status_color === 'yellow' ? 'text-yellow-600' : result.status_color === 'orange' ? 'text-orange-600' : result.status_color === 'red' ? 'text-rose-600' : 'text-brand-charcoal'}`}>"
);
code = code.replace(
  "className={clsx(\"font-medium\", result.is_paid ? \"text-green-600\" : \"text-amber-600\")}",
  "className={`font-medium ${result.is_paid ? 'text-green-600' : 'text-amber-600'}`}"
);
fs.writeFileSync('src/app/order-tracking/page.tsx', code);
