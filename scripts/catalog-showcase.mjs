// Photo-card structure adapted from LeSauteur/Malinovskogo (with user permission).
// These are selection formats, never listings with invented prices or addresses.
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
export const formats = [
 ['flat','Квартиры','apartments.html','Квартира под ваш ритм жизни','Сравним планировку, состояние и район. Найдём точку, в которой сходятся ваш бюджет и повседневный комфорт.','stock/stock-apartment-interior.jpg',1800,1532],
 ['house','Дома','houses.html','Свой дом. Свои правила.','Пространство внутри и снаружи. Сопоставим дом, участок, коммуникации и ваши ежедневные маршруты.','stock/stock-house-yard.jpg',1800,1201],
 ['land','Участки','lands.html','Место для большого начала','Участок под ваш будущий дом или долгосрочный план. Начнём с назначения земли, подъезда и коммуникаций.','borrowed/land.jpg',1680,1260],
 ['new','Новостройки','newbuilds.html','Новый дом для нового этапа','Двор, планировка, готовность и будущие расходы. Сравните форматы до выбора конкретного жилого комплекса.','borrowed/courtyard.webp',1920,1080],
 ['commercial','Коммерция','commercial.html','Пространство для вашего дела','Офис, помещение под услуги или торговлю. Оцениваем адрес вместе с задачами вашего бизнеса.','local/pexels-323705.jpg',1200,800],
 ['rent','Аренда','rent.html','Жить там, где удобно сейчас','Квартира, дом или временный адрес на период переезда. Обсудим срок, бюджет и важные условия аренды.','stock/stock-premium-living.jpg',1800,1207],
 ['room','Комнаты','rooms.html','Первое личное пространство','Компактный формат с вниманием к документам, общим помещениям и реальным условиям проживания.','local/pexels-1571471.jpg',1200,801]
].map(([id,name,page,title,lead,image,width,height])=>({id,name,page,title,lead,image,width,height}));
const rows = [
 ['first-apartment','flat','Первый объект','Первая квартира в своём городе','Баланс бюджета, состояния, транспорта и понятных расходов после покупки.',['бюджет','состояние','маршруты'],'stock/stock-apartment-interior.jpg',1800,1532],
 ['family-apartment','flat','Для семьи','Квартира для семейного переезда','Планировка, хранение, инфраструктура и удобство повседневных маршрутов.',['планировка','инфраструктура','парковка'],'local/pexels-1643383.jpg',1200,790],
 ['apartment-exchange','flat','Новый этап','Продать текущую. Купить следующую.','Свяжем подготовку к продаже, поиск нового жилья и сроки двух частей сделки.',['сроки','продажа','документы'],'local/pexels-1918291.jpg',1800,1013],
 ['city-house','house','Городской дом','Дом в городском ритме','Свой двор и привычная городская жизнь: подъезд, парковка и инфраструктура рядом.',['маршруты','подъезд','гараж'],'local/pexels-106399.jpg',1200,800],
 ['family-house','house','Для семьи','Больше пространства для своих','Планировка для семьи, приватность, зелёный двор и место для новых планов.',['участок','планировка','окружение'],'stock/stock-house-yard.jpg',1800,1201],
 ['house-renovation','house','С перспективой','Дом под ваши идеи','Оценим состояние, коммуникации и объём будущих работ до решения о покупке.',['состояние','коммуникации','расходы'],'local/pexels-259588.jpg',1200,799],
 ['building-plot','land','Под строительство','Участок под собственный дом','Размер, форма, подъезд и окружение — в связи с вашим будущим проектом.',['границы','подъезд','назначение'],'borrowed/land.jpg',1680,1260],
 ['private-plot','land','Ближе к природе','Баланс города и приватности','Подберём направление с учётом ежедневных поездок и желаемого пространства.',['маршруты','окружение','приватность'],'local/pexels-280229.jpg',1200,797],
 ['future-plot','land','Долгий горизонт','Земля для будущих планов','Назначение, ограничения и расходы на обустройство под ваш сценарий использования.',['назначение','ограничения','коммуникации'],'local/pexels-1643389.jpg',1200,801],
 ['new-courtyard','new','Среда для жизни','Дом начинается с хорошего двора','Маршруты, озеленение, приватность и удобство пространства вокруг дома.',['двор','маршруты','инфраструктура'],'borrowed/courtyard.webp',1920,1080],
 ['new-family','new','Планировка','Новая квартира под состав семьи','Полезная площадь, хранение, этаж и возможность адаптировать жильё под себя.',['площадь','хранение','этаж'],'borrowed/newbuild.jpg',1200,1800],
 ['new-ready','new','Готовность','От ключей — к вашей жизни','Учтём отделку, сроки получения квартиры и расходы на обустройство и переезд.',['отделка','сроки','переезд'],'stock/stock-premium-living.jpg',1800,1207],
 ['business-office','commercial','Для команды','Офис, в котором удобно работать','Расположение, доступ, рабочие зоны и парковка под формат вашей команды.',['доступ','планировка','парковка'],'local/pexels-323705.jpg',1200,800],
 ['business-services','commercial','Для клиентов','Место для услуг и встреч','Оценим вход, окружение, инженерные возможности и требования вашего дела.',['вход','коммуникации','назначение'],'stock/stock-office-meeting.jpg',1800,1200],
 ['business-retail','commercial','Для бизнеса','Адрес для торгового проекта','Видимость, подходы, разгрузка и возможность разместить нужный вам формат.',['локация','витрина','подъезд'],'local/pexels-302769.jpg',1800,1200],
 ['rent-apartment','rent','На каждый день','Квартира под ваш ритм','Срок аренды, привычный маршрут, мебель и полный ежемесячный бюджет.',['срок','мебель','бюджет'],'local/pexels-1643383.jpg',1200,790],
 ['rent-house','rent','Больше свободы','Дом с личным пространством','Планировка, участок и условия содержания дома на весь период аренды.',['двор','условия','коммуникации'],'local/pexels-106399.jpg',1200,800],
 ['rent-moving','rent','На время перемен','Удобный адрес на период переезда','Временное жильё, когда важно спокойно связать продажу, покупку и переезд.',['сроки','заезд','договор'],'local/pexels-1918291.jpg',1800,1013],
 ['first-room','room','Своё пространство','Комната для первого самостоятельного шага','Сравним бюджет, дорогу до работы или учёбы и условия использования общих зон.',['бюджет','маршрут','общие зоны'],'local/pexels-1571471.jpg',1200,801],
 ['compact-room','room','Компактный формат','Небольшое жильё с понятными условиями','Посмотрим на состояние, расходы и фактическое устройство пространства.',['состояние','расходы','формат'],'local/pexels-1643384.jpg',1200,801],
 ['room-documents','room','Внимание к деталям','Комната: сначала разобраться в важном','Уточним статус помещения, документы, состав имущества и порядок пользования.',['статус','документы','общие помещения'],'stock/stock-apartment-interior.jpg',1800,1532]
];
export const showcases=rows.map(([id,type,label,title,lead,traits,image,width,height])=>({id,type,label,title,lead,traits,image,width,height}));
const group=id=>formats.find(f=>f.id===id);
const featured = new Set(formats.filter(f=>f.id!=='room').map(f=>showcases.find(s=>s.type===f.id).id));
const photo=(s,prefix='',loading='lazy')=>`<img src="${prefix}assets/images/${s.image}" alt="Иллюстрация: ${esc(s.title)}" width="${s.width}" height="${s.height}" ${loading==='eager'?'fetchpriority="high"':'loading="lazy"'}>`;
export function showcaseCard(s,{prefix='',hidden=false}={}){
 const href=`${prefix}objects/format-${s.id}.html`;
 return `<article class="format-card" data-showcase-card data-showcase-type="${s.type}" data-featured="${featured.has(s.id)}" ${hidden?'hidden':''}>
 <a class="format-card__media" href="${href}" aria-label="${esc(s.title)} — подробнее">${photo(s,prefix)}<span class="format-card__category">${esc(s.label)}</span><span class="format-card__open" aria-hidden="true">↗</span></a>
 <div class="format-card__body"><span class="format-card__location">${group(s.type).name} · Новочеркасск и рядом</span><h3><a href="${href}">${esc(s.title)}</a></h3><p>${esc(s.lead)}</p><ul class="format-card__traits">${s.traits.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><a class="format-card__link" href="${href}">Подробнее о подборе ${arrow}</a></div></article>`;
}
export function showcaseSection({type='',home=false,prefix=''}={}){
 const selected=home?'flat':type;
 const items=type?showcases.filter(s=>s.type===type):showcases;
 const visible=s=>selected?s.type===selected:featured.has(s.id);
 return `<section class="section-p format-section" id="property-formats"><div class="wrap" data-vitrine data-default-showcase="${selected}"><div class="section-head"><div><span class="eyebrow">${home?'01 / Недвижимость для ваших планов':'Ваш сценарий подбора'}</span><h2>${home?'Каким будет<br><em>ваше новое место?</em>':type?'Разные планы.<br><em>Свой подход к каждому.</em>':'Выбирайте формат.<br><em>Остальное обсудим вместе.</em>'}</h2></div><p>Начните с того, что важно вам.<br>Район, пространство и следующий шаг — вместе с офисом.</p></div>
 ${!type?`<div class="format-tabs" role="group" aria-label="Направления недвижимости">${[['','Все направления'],...formats.map(f=>[f.id,f.name])].map(([id,label])=>`<button type="button" data-showcase-filter="${id}" data-showcase-url="${prefix}${group(id)?.page||'contacts.html'}" aria-pressed="${id===selected}">${label}</button>`).join('')}</div>`:''}
 <div class="format-grid">${items.map(s=>showcaseCard(s,{prefix,hidden:!visible(s)})).join('')}</div>
 <div class="format-section__foot"><p>Фотографии иллюстрируют форматы подбора. Конкретные предложения, цены и наличие уточняются в офисе.</p><a class="text-link" data-format-category href="${prefix}${group(selected)?.page||'catalog.html'}">${selected?'Все направления раздела':'Обсудить мою задачу'} ${arrow}</a></div></div></section>`;
}
export function categoryContent(type,title,lead,oldContent,hasListings){
 const f=group(type);
 const intro=f?`<section class="format-hero"><div class="wrap format-hero__grid"><div><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="index.html">Главная</a><a href="catalog.html">Недвижимость</a><span>${f.name}</span></nav><span class="eyebrow">Домиан · Новочеркасск · ${f.name}</span><h1>${f.title}</h1><p>${f.lead}</p><div class="brief-buttons"><a class="p-button" href="#property-formats">Выбрать свой формат ${arrow}</a><a class="text-link" href="tel:+79381545915">Обсудить лично ${arrow}</a></div></div><figure>${photo(f,'','eager')}<figcaption>${f.name} / Новочеркасск и рядом</figcaption></figure></div></section>`:oldContent.slice(0,oldContent.indexOf('</section>')+10);
 const source=oldContent.slice(oldContent.indexOf('</section>')+10);
 const checklist=`<section class="section-p format-check-section"><div class="wrap format-check"><div><span class="eyebrow">От вашего плана — к решению</span><h2>За красивой картинкой —<br><em>важные детали.</em></h2></div><ol><li><span>01</span><div><h3>Критерии и бюджет</h3><p>Определим задачу, подходящие районы, сроки и расходы.</p></div></li><li><span>02</span><div><h3>Сравнение и просмотр</h3><p>Обсудим актуальные предложения и вопросы к каждому варианту.</p></div></li><li><span>03</span><div><h3>Документы и условия</h3><p>Уточним параметры объекта, ограничения и порядок работы до решения.</p></div></li></ol></div></section>`;
 return (intro+showcaseSection({type})+(hasListings?`<div class="wrap source-heading"><span class="eyebrow">Конкретные адреса</span><h2>Из публичных<br><em>объявлений офиса.</em></h2></div>`+source:checklist+source.slice(source.lastIndexOf('<section class="contact-strip"')))).replace(/[ \t]+$/gm,'');
}
const questions={
 flat:['Планировка, полезная площадь и хранение','Состояние дома, квартиры и инженерных систем','Маршруты до работы, школы и повседневных мест','Документы, ограничения и условия расчёта'],
 house:['Состояние дома, кровли и основных конструкций','Документы на дом и земельный участок','Коммуникации, подъезд и содержание территории','Ежедневные маршруты и расходы на обустройство'],
 land:['Назначение земли и ограничения использования','Границы, межевание и фактический подъезд','Возможность и стоимость подключения коммуникаций','Соответствие участка вашему будущему проекту'],
 new:['Планировка, полезная площадь и этаж','Готовность дома и условия передачи квартиры','Двор, окружение и привычные маршруты','Отделка, расходы и документы по выбранному комплексу'],
 commercial:['Соответствие помещения вашему виду деятельности','Назначение, документы и ограничения использования','Вход, доступ, инженерные мощности и разгрузка','Расходы на адаптацию, содержание и обслуживание'],
 rent:['Срок аренды, дата заезда и условия продления','Мебель, техника и состояние при передаче','Платёж, обеспечительный платёж и дополнительные расходы','Договор, опись имущества и порядок возврата'],
 room:['Юридический статус и состав продаваемого имущества','Документы и порядок пользования общими помещениями','Состояние комнаты, здания и коммуникаций','Обязательные платежи и условия проживания']
};
export function showcaseDetail(s){
 const f=group(s.type),start=['rent','commercial'].includes(s.type)?'../contacts.html#request':`../index.html?type=${s.type}#personal-selection`;
 return `<section class="format-detail-hero"><div class="wrap"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="../index.html">Главная</a><a href="../${f.page}">${f.name}</a><span>${esc(s.label)}</span></nav><div class="format-detail-hero__grid"><div><span class="eyebrow">${f.name} / ${esc(s.label)}</span><h1>${esc(s.title)}</h1><p>${esc(s.lead)}</p><ul class="format-card__traits">${s.traits.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><a class="p-button" href="${start}">Задать мои критерии ${arrow}</a></div><figure>${photo(s,'../','eager')}<figcaption>Иллюстрация формата подбора</figcaption></figure></div></div></section>
 <section class="section-p"><div class="wrap format-detail-layout"><div><span class="eyebrow">До выбора конкретного адреса</span><h2>На что посмотрим<br><em>вместе с вами.</em></h2><p class="format-detail-lead">${f.lead} Отметим обязательные критерии и то, где возможен компромисс. Затем обсудим подходящие предложения и следующий шаг.</p><ul class="format-check-list">${questions[s.type].map((q,i)=>`<li><span>0${i+1}</span>${q}</li>`).join('')}</ul></div><aside class="format-detail-aside"><span class="eyebrow">Ваш следующий шаг</span><h3>Расскажите,<br>что важно вам.</h3><p>Район, бюджет, сроки и несколько обязательных пожеланий помогут начать предметный разговор.</p><a class="p-button" href="${start}">Обсудить подбор ${arrow}</a><a class="text-link" href="tel:+79381545915">+7 938 154-59-15 ${arrow}</a><p class="format-detail-note">Это сценарий подбора, а не объявление о конкретном объекте. Актуальные адреса, характеристики и условия уточняются при обращении.</p></aside></div></section>
 <section class="section-p format-related"><div class="wrap"><div class="section-head"><div><span class="eyebrow">Посмотрите и другие форматы</span><h2>Один раздел.<br><em>Разные возможности.</em></h2></div><a class="text-link" href="../${f.page}">В раздел «${f.name}» ${arrow}</a></div><div class="format-grid">${showcases.filter(item=>item.type===s.type&&item.id!==s.id).map(item=>showcaseCard(item,{prefix:'../'})).join('')}</div></div></section>`;
}
