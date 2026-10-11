const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf-8');
const newFunc = `
export async function checkOrderStatus(trackingCode: string): Promise<any> {
  const res = await request<any>(\`/orders/check-status/\${trackingCode}\`, { method: 'GET' });
  return res.data || res;
}
`;
code = code.replace("export async function getTrackingStatus", newFunc + "\nexport async function getTrackingStatus");
code = code.replace("static getTrackingStatus = getTrackingStatus;", "static getTrackingStatus = getTrackingStatus;\n  static checkOrderStatus = checkOrderStatus;");
fs.writeFileSync('src/lib/api.ts', code);
