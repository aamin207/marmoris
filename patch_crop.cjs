const fs = require('fs');
let code = fs.readFileSync('src/app/HomeClient.tsx', 'utf8');

const heroOrig = `{/* Backing fashion image - clean, full brightness, sharp */}
                <Image
                  src={currentSlide.image || currentSlide.featured_image || currentSlide.url || '/images/banner-bag.jpg'}
                  alt={currentSlide.title || "اسلاید شو مرموریس"}
                  fill
                  sizes="100vw"
                  priority
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />`;

const heroNew = `{/* Blurred background to prevent empty spaces when containing */}
                <Image
                  src={currentSlide.image || currentSlide.featured_image || currentSlide.url || '/images/banner-bag.jpg'}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover blur-3xl opacity-40 scale-110"
                />
                {/* Main fashion image - contained so product isn't cut off */}
                <Image
                  src={currentSlide.image || currentSlide.featured_image || currentSlide.url || '/images/banner-bag.jpg'}
                  alt={currentSlide.title || "اسلاید شو مرموریس"}
                  fill
                  sizes="100vw"
                  priority
                  referrerPolicy="no-referrer"
                  className="object-contain"
                />`;

const banner1Orig = `<Image
          src={bagBanner.image}
          alt={bagBanner.title || "کیف پارچه‌ای دست‌دوز مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />`;

const banner1New = `{/* Blurred background to prevent empty spaces when containing */}
        <Image
          src={bagBanner.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover blur-3xl opacity-40 scale-110"
        />
        {/* Main fashion image - contained so product isn't cut off */}
        <Image
          src={bagBanner.image}
          alt={bagBanner.title || "کیف پارچه‌ای دست‌دوز مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-contain transition-transform duration-[1200ms] group-hover:scale-105"
        />`;

const banner2Orig = `<Image
          src={jewelryBanner.image}
          alt={jewelryBanner.title || "مجموعه اکسسوری و زیورآلات مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />`;

const banner2New = `{/* Blurred background to prevent empty spaces when containing */}
        <Image
          src={jewelryBanner.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover blur-3xl opacity-40 scale-110"
        />
        {/* Main fashion image - contained so product isn't cut off */}
        <Image
          src={jewelryBanner.image}
          alt={jewelryBanner.title || "مجموعه اکسسوری و زیورآلات مرموریس"}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          referrerPolicy="no-referrer"
          className="object-contain transition-transform duration-[1200ms] group-hover:scale-105"
        />`;

code = code.replace(heroOrig, heroNew);
code = code.replace(banner1Orig, banner1New);
code = code.replace(banner2Orig, banner2New);

fs.writeFileSync('src/app/HomeClient.tsx', code);
