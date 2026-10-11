const fs = require('fs');
let code = fs.readFileSync('src/app/HomeClient.tsx', 'utf8');

// remove from inside useEffect
code = code.replace(`    const bagBanner = banners.find(b => b.key === 'bag_banner') || {
    key: 'bag_banner',
    image: '/images/banner-bag.jpg',
    title: 'دقت مینی‌مالیستی در جزئیات دوخت',
    subtitle: 'طراحی سبک و اصیل با پارچه‌های مقاوم طبیعی و دوخت ظریف دست‌ساز که ماندگاری و زیبایی کیف‌های پارچه‌ای مرموریس را تضمین می‌کند.',
    button_text: 'مشاهده کالکشن کیف',
    link: '/products?category=bags',
    is_active: true
  };

  const jewelryBanner = banners.find(b => b.key === 'jewelry_banner') || {
    key: 'jewelry_banner',
    image: '/images/banner-jewelry.jpg',
    title: 'زیبایی طبیعی اکسسوری thetwozza',
    subtitle: 'مهره مروارید و عناصر طبیعی در ترکیب با طراحی دست‌ساز، اصیل و منحصربه‌فرد برای جلوه ماندگار استایل شما.',
    button_text: 'مشاهده اکسسوری‌ها',
    link: '/products?category=jewelry',
    is_active: true
  };
`, "");

// put right after slideDesc declaration
const target = `  const slideDesc = currentSlide?.subtitle || 'هر قطعه از کالکشن مرموریس داستانی از صبوری، دقت و اصالت هنر دست استادکاران ماست که با بالاترین کیفیت آماده شده است.';`;

const insertion = `
  const bagBanner = banners.find(b => b.key === 'bag_banner') || {
    key: 'bag_banner',
    image: '/images/banner-bag.jpg',
    title: 'دقت مینی‌مالیستی در جزئیات دوخت',
    subtitle: 'طراحی سبک و اصیل با پارچه‌های مقاوم طبیعی و دوخت ظریف دست‌ساز که ماندگاری و زیبایی کیف‌های پارچه‌ای مرموریس را تضمین می‌کند.',
    button_text: 'مشاهده کالکشن کیف',
    link: '/products?category=bags',
    is_active: true
  };

  const jewelryBanner = banners.find(b => b.key === 'jewelry_banner') || {
    key: 'jewelry_banner',
    image: '/images/banner-jewelry.jpg',
    title: 'زیبایی طبیعی اکسسوری thetwozza',
    subtitle: 'مهره مروارید و عناصر طبیعی در ترکیب با طراحی دست‌ساز، اصیل و منحصربه‌فرد برای جلوه ماندگار استایل شما.',
    button_text: 'مشاهده اکسسوری‌ها',
    link: '/products?category=jewelry',
    is_active: true
  };
`;

code = code.replace(target, target + "\n" + insertion);
fs.writeFileSync('src/app/HomeClient.tsx', code);
