const fs = require('fs');
let code = fs.readFileSync('src/lib/apiClient.ts', 'utf8');

// Also need to import Banner from '@/types'
if (!code.includes('Banner')) {
    code = code.replace("Slider, Decoration, BlogPost, ShippingMethod } from '@/types';", "Slider, Decoration, BlogPost, ShippingMethod, Banner } from '@/types';");
}

const getBannersCode = `
export async function getBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(\`\${API_BASE}/banners\`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت بنرها.');
    const body = await res.json();
    return body.data || body;
  } catch (err: any) {
    return [];
  }
}
`;

if (!code.includes('getBanners()')) {
    code = code.replace(
        "export async function getSliders()",
        getBannersCode + "\nexport async function getSliders()"
    );
    fs.writeFileSync('src/lib/apiClient.ts', code);
}
