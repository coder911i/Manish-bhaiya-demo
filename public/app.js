"use strict";
let selectedNeed = "Love & Relationships", cart = [], catalog = [], consultants = [];
const modal = document.getElementById("modal"), panel = document.getElementById("modalPanel");
try { cart = JSON.parse(localStorage.getItem("as-cart-v2") || "[]"); if (!Array.isArray(cart)) cart = []; } catch (_) { cart = []; }


function initializePreferences(){
 const body=document.body,themeButton=document.getElementById("themeToggle"),langButton=document.getElementById("languageToggle");
 let theme="light",language="en";
 try{theme=localStorage.getItem("as-theme")||"light";language=localStorage.getItem("as-language")||"en";}catch(_){}
 function setTheme(next){theme=next;body.classList.toggle("theme-dark",theme==="dark");if(themeButton)themeButton.textContent=theme==="dark"?"Light mode":"Dark mode";try{localStorage.setItem("as-theme",theme);}catch(_){}}
 function setLanguage(next){language=next;document.documentElement.lang=language;document.querySelectorAll("[data-en][data-hi]").forEach(el=>{const value=el.dataset[language];if(value!==undefined)el.textContent=value;});if(langButton)langButton.textContent=language==="en"?"हिन्दी":"English";try{localStorage.setItem("as-language",language);}catch(_){}}
 themeButton?.addEventListener("click",()=>setTheme(theme==="dark"?"light":"dark"));
 langButton?.addEventListener("click",()=>setLanguage(language==="en"?"hi":"en"));
 setTheme(theme);setLanguage(language);
}

function scrollToId(id) { document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}); }
function safeText(v="") { return String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function numericPrice(v) { const n=Number(String(v??"").replace(/[₹,\s]/g,"")); return Number.isFinite(n)?n:0; }
function money(v) { return "₹"+Math.round(numericPrice(v)).toLocaleString("en-IN"); }
function persistCart() { try { localStorage.setItem("as-cart-v2",JSON.stringify(cart)); } catch (_) {} updateCartBadge(); }
function updateCartBadge() { document.querySelectorAll(".cart-count").forEach(el=>el.textContent=cart.reduce((s,x)=>s+Number(x.qty||0),0)); }
function closeModal() { modal?.classList.remove("open"); }
function selectNeed(el,need) { document.querySelectorAll(".need-card").forEach(x=>x.classList.remove("active")); if(el?.classList?.contains("need-card"))el.classList.add("active"); selectedNeed=need; const label=document.getElementById("selectedNeed"); if(label)label.textContent=need; }
function openDemo() { scrollToId("how"); }

const imageByCategory = {
 "Rudraksha":"https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=900&q=85",
 "Shaligram":"https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=900&q=85",
 "Gemstones":"https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=900&q=85",
 "Crystals":"https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=900&q=85",
 "Vastu Products":"https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=85",
 "Pooja":"https://images.unsplash.com/photo-1507643179773-3e975d7ac515?auto=format&fit=crop&w=900&q=85",
 "Shankh Sea Shells":"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
 "Perfumes":"https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85"
};
function productImage(p) { return p.image || imageByCategory[p.category] || imageByCategory["Crystals"]; }

function configureProduct(id) {
 const p=catalog.find(x=>x.id===id);
 if(!p)return alert("यह उत्पाद अभी उपलब्ध नहीं है। पेज रिफ्रेश करके दोबारा कोशिश करें।");
 const opts=p.variants||p.options||["Standard","Premium"], customs=p.customOptions||p.custom||["Gift wrap","Personal intention card"], img=productImage(p);
 panel.innerHTML='<button class="modal-close" aria-label="बंद करें">×</button><div class="eyebrow">आध्यात्मिक दुकान</div><h2>'+safeText(p.name)+'</h2><div class="product-config"><img class="config-image" src="'+safeText(img)+'" alt="'+safeText(p.name)+'"><div class="config-info"><small>'+safeText(p.category||"आध्यात्मिक उत्पाद")+'</small><p>अपना विकल्प चुनें और चाहें तो कस्टमाइज़ करें।</p><label>विकल्प<select id="productVariant">'+opts.map(v=>'<option value="'+safeText(v)+'">'+safeText(v)+'</option>').join("")+'</select></label><div class="custom-options"><span>कस्टमाइज़ करें</span>'+customs.map(v=>'<label><input type="checkbox" data-custom value="'+safeText(v)+'"> '+safeText(v)+'</label>').join("")+'</div><div class="config-price">'+money(p.price)+'</div><button class="pay-btn" id="addConfigBtn">कार्ट में जोड़ें</button></div></div>';
 panel.querySelector(".modal-close").addEventListener("click",closeModal);
 panel.querySelector("#addConfigBtn").addEventListener("click",()=>{
  const variant=panel.querySelector("#productVariant").value, custom=[...panel.querySelectorAll("[data-custom]:checked")].map(x=>x.value), key=p.id+"|"+variant+"|"+custom.join(",");
  const found=cart.find(x=>x.key===key);
  if(found)found.qty++;else cart.push({key,id:p.id,name:p.name,price:numericPrice(p.price),img,variant,custom,qty:1});
  persistCart();openCart();
 });
 modal.classList.add("open");
}
function quickAdd(name,price,img,id="",meta={}) {
 const p=catalog.find(x=>x.id===id||x.name===name);
 if(p)return configureProduct(p.id);
 const key=(id||name)+"|Standard|", found=cart.find(x=>x.key===key);
 if(found)found.qty++;else cart.push({key,id,name,price:numericPrice(price),img,variant:"Standard",custom:[],qty:1});
 persistCart();openCart();
}
function changeQty(key,delta) { const x=cart.find(i=>i.key===key);if(!x)return;x.qty=Number(x.qty||1)+delta;if(x.qty<=0)cart=cart.filter(i=>i.key!==key);persistCart();openCart(); }
function removeCartItem(key) { cart=cart.filter(x=>x.key!==key);persistCart();openCart(); }

function openCart() {
 const total=cart.reduce((s,x)=>s+numericPrice(x.price)*Number(x.qty||1),0);
 const body=cart.length?cart.map((x,i)=>'<div class="cart-item premium-cart-item"><img src="'+safeText(x.img)+'" alt="'+safeText(x.name)+'"><div class="cart-main"><b>'+safeText(x.name)+'</b><small>'+safeText(x.variant||"Standard")+(x.custom?.length?" · "+safeText(x.custom.join(" · ")):"")+'</small><div class="qty-row"><button type="button" data-qty="-1" data-index="'+i+'">−</button><strong>'+Number(x.qty||1)+'</strong><button type="button" data-qty="1" data-index="'+i+'">+</button><button type="button" class="remove-line" data-remove="'+i+'">हटाएँ</button><b class="line-total">'+money(numericPrice(x.price)*Number(x.qty||1))+'</b></div></div></div>').join(""):'<div class="empty-cart"><div>◇</div><h3>आपका कार्ट खाली है</h3><p>दुकान से कोई उत्पाद चुनकर कार्ट में जोड़ें।</p><button class="primary" id="exploreProducts">उत्पाद देखें</button></div>';
 panel.innerHTML='<button class="modal-close" aria-label="बंद करें">×</button><div class="eyebrow">आपका कार्ट · '+cart.reduce((s,x)=>s+Number(x.qty||0),0)+' आइटम</div><h2>आपके चुने हुए उत्पाद</h2><div class="cart-list">'+body+'</div>'+(cart.length?'<div class="cart-summary"><div><span>कुल कीमत</span><b>'+money(total)+'</b></div><div><span>शिपिंग</span><b>'+(total>=1000?"मुफ़्त":money(99))+'</b></div><div class="cart-grand"><span>अनुमानित कुल</span><b>'+money(total+(total>=1000?0:99))+'</b></div></div><div class="checkout-fields"><input id="shopName" placeholder="पूरा नाम" autocomplete="name"><input id="shopPhone" placeholder="10 अंकों का मोबाइल नंबर" inputmode="tel" maxlength="10" autocomplete="tel"><input id="shopEmail" placeholder="ईमेल (वैकल्पिक)" type="email" autocomplete="email"><input id="shopAddress" placeholder="पूरा डिलीवरी पता" autocomplete="street-address"></div><button class="pay-btn" id="checkoutBtn">ऑर्डर करें और भुगतान करें →</button><p class="checkout-note">भुगतान PayU के सुरक्षित पेज पर होगा।</p>':"");
 panel.querySelector(".modal-close").addEventListener("click",closeModal);
 panel.querySelectorAll("[data-qty]").forEach(b=>b.addEventListener("click",()=>changeQty(cart[Number(b.dataset.index)].key,Number(b.dataset.qty))));
 panel.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>removeCartItem(cart[Number(b.dataset.remove)].key)));
 panel.querySelector("#exploreProducts")?.addEventListener("click",()=>{closeModal();scrollToId("store");});
 panel.querySelector("#checkoutBtn")?.addEventListener("click",startProductPayU);
 modal.classList.add("open");
}
async function api(path,options={}) {
 const response=await fetch(path,{...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||"Request failed");
 return data;
}
function renderExperts() {
 const grid=document.getElementById("expertGrid"); if(!grid)return;
 if(!consultants.length){grid.innerHTML='<article class="expert-loading">Expert profiles are temporarily unavailable. Please try again shortly.</article>';return;}
 grid.innerHTML=consultants.map(c=>'<button type="button" class="expert-card" data-expert="'+safeText(c.id)+'"><div class="expert-photo-wrap"><img class="expert-photo-real" src="'+safeText(c.photo||"")+'" alt="'+safeText(c.name)+'" loading="lazy"><span class="expert-online"><i></i> Available for booking</span></div><div class="expert-content"><span class="expert-type">'+safeText(c.type)+'</span><h3 class="expert-name">'+safeText(c.name)+'</h3><div class="expert-rating"><strong>★ '+safeText(c.rating||"4.8")+'</strong> · '+safeText(c.experience||"Experienced")+' · English / Hindi</div><p class="expert-bio">'+safeText(c.bio||"Personalised consultation for your questions.")+'</p><div class="expert-specialty">'+safeText(c.specialty||"Personal guidance")+'</div><div class="expert-card-bottom"><span class="expert-price">'+money(c.pricePerMinute||c.price)+' <small>/ min</small></span><span class="expert-book">Book a call ↗</span></div></div></button>').join("");
 grid.querySelectorAll("[data-expert]").forEach(card=>card.addEventListener("click",()=>{selectedNeed=selectedNeed||"General guidance";openBooking(null,card.dataset.expert);}));
}
async function loadLiveCatalog() {
 const pg=document.querySelector(".product-grid");
 try {
  const result=await Promise.all([api("/api/products"),api("/api/consultants")]);
  catalog=Array.isArray(result[0])?result[0]:[];consultants=Array.isArray(result[1])?result[1]:[];
  if(pg)pg.innerHTML=catalog.length?catalog.map(p=>{
   const img=productImage(p);
   return '<article class="product-card"><div class="product-img"><img src="'+safeText(img)+'" alt="'+safeText(p.name)+'" loading="lazy"><span>'+safeText(p.category||"Store")+'</span><button type="button" data-configure="'+safeText(p.id)+'" aria-label="Add to bag">+</button></div><div class="product-meta"><small>'+safeText(p.category||"Spiritual essentials")+'</small><h3>'+safeText(p.name)+'</h3><div><b>'+money(p.price)+'</b>'+(p.compareAt?' <del>'+money(p.compareAt)+'</del>':'')+'</div><button type="button" class="customize-btn" data-configure="'+safeText(p.id)+'">Choose options · Add to bag</button></div></article>';
  }).join(""):'<p class="catalog-empty">No products are available right now.</p>';
  pg?.querySelectorAll("[data-configure]").forEach(b=>b.addEventListener("click",()=>configureProduct(b.dataset.configure)));
  renderExperts();
 } catch(e) {
  console.error("Catalog could not be loaded",e);
  if(pg)pg.innerHTML='<p class="catalog-empty">Products could not be loaded. Check your connection and try again.</p>';
  const eg=document.getElementById("expertGrid");if(eg)eg.innerHTML='<article class="expert-loading">Expert profiles could not be loaded. Please refresh to try again.</article>';
 }
}
async function openBooking(expertName=null,consultantId=null) {
 try {
  if(!consultants.length)consultants=await api("/api/consultants");
  const chosen=consultants.find(c=>c.id===consultantId)||consultants.find(c=>c.name===expertName)||consultants.find(c=>selectedNeed.toLowerCase().includes("numer")&&/numerolog/i.test(c.type||""))||consultants.find(c=>selectedNeed.toLowerCase().includes("vastu")&&/vastu/i.test(c.type||""))||consultants[0];
  if(!chosen)throw new Error("No experts are available right now.");
  const rate=numericPrice(chosen.pricePerMinute||chosen.price);
  panel.innerHTML='<button class="modal-close" aria-label="Close">×</button><div class="eyebrow">PRIVATE CONSULTATION</div><h2>Book your consultation</h2><p>Topic: <b>'+safeText(selectedNeed)+'</b></p><label class="booking-label">Choose your expert<select id="bookingConsultant">'+consultants.map(c=>'<option value="'+safeText(c.id)+'" data-rate="'+numericPrice(c.pricePerMinute||c.price)+'" '+(c.id===chosen.id?"selected":"")+'>'+safeText(c.name)+' · '+money(c.pricePerMinute||c.price)+'/min</option>').join("")+'</select></label><div class="checkout-fields"><input id="payName" placeholder="Full name" autocomplete="name"><input id="payPhone" placeholder="10-digit mobile number" inputmode="tel" maxlength="10" autocomplete="tel"><input id="payEmail" placeholder="Email address" type="email" autocomplete="email"></div><label class="booking-label">Consultation duration<select id="bookingDuration"><option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="15">15 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option></select></label><label class="booking-label">Preferred time<select id="bookingSlot">'+["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"].map((s,i)=>'<option '+(i===2?"selected":"")+'>'+s+'</option>').join("")+'</select></label><div class="pay-box consultation-total"><div><span>Rate per minute</span><strong id="consultRate">'+money(rate)+'</strong></div><div><span>Duration</span><strong id="consultDurationText">10 minutes</strong></div><div class="cart-grand"><span>Total consultation fee</span><strong id="consultTotal">'+money(rate*10)+'</strong></div><button class="pay-btn" id="consultPayBtn">Continue to secure payment →</button><p class="checkout-note">You will be redirected to PayU for payment. Live checkout requires server credentials.</p></div>';
  panel.querySelector(".modal-close").addEventListener("click",closeModal);
  const updateAmount=()=>{const o=panel.querySelector("#bookingConsultant").selectedOptions[0],duration=Number(panel.querySelector("#bookingDuration").value),perMinute=numericPrice(o.dataset.rate);panel.querySelector("#consultRate").textContent=money(perMinute);panel.querySelector("#consultDurationText").textContent=duration+" minutes";panel.querySelector("#consultTotal").textContent=money(perMinute*duration);};
  panel.querySelector("#bookingConsultant").addEventListener("change",updateAmount);panel.querySelector("#bookingDuration").addEventListener("change",updateAmount);
  panel.querySelector("#consultPayBtn").addEventListener("click",()=>{const duration=Number(panel.querySelector("#bookingDuration").value),o=panel.querySelector("#bookingConsultant").selectedOptions[0];createBookingAndPay(panel.querySelector("#bookingConsultant").value,numericPrice(o.dataset.rate)*duration,duration);});
  modal.classList.add("open");
 } catch(e) {
  panel.innerHTML='<button class="modal-close" aria-label="Close">×</button><h2>Booking is temporarily unavailable</h2><p>'+safeText(e.message)+'</p>';
  panel.querySelector(".modal-close").addEventListener("click",closeModal);modal.classList.add("open");
 }
}
async function createBookingAndPay(consultantId,amount,duration=10) {
 try {
  const name=panel.querySelector("#payName")?.value.trim(),phone=panel.querySelector("#payPhone")?.value.trim(),email=panel.querySelector("#payEmail")?.value.trim();
  if(!name||!/^\d{10}$/.test(phone||"")||!email)return alert("Please enter your name, 10-digit mobile number and email.");
  const slot=panel.querySelector("#bookingSlot")?.value||"2:30 PM";
  const booking=await api("/api/bookings",{method:"POST",body:JSON.stringify({customerName:name,customerPhone:phone,customerEmail:email,concern:selectedNeed,consultantId,slot,amount})});
  const payment=await api("/api/payu/create",{method:"POST",body:JSON.stringify({bookingId:booking.id,amount,productinfo:"Astrological Solutions Consultation",firstname:name,phone,email,udf1:"consultation",udf2:booking.id})});
  submitPayU(payment.endpoint,payment.params);
 } catch(e) { alert(e.message); }
}
function submitPayU(endpoint,params) {
 if(!endpoint||!params)throw new Error("PayU अभी कॉन्फ़िगर नहीं है।");
 const form=document.createElement("form");form.method="POST";form.action=endpoint;form.style.display="none";
 Object.entries(params).forEach(([k,v])=>{const input=document.createElement("input");input.type="hidden";input.name=k;input.value=v??"";form.appendChild(input);});
 document.body.appendChild(form);form.submit();
}
async function startProductPayU() {
 try {
  if(!cart.length)return;
  const name=panel.querySelector("#shopName")?.value.trim(),phone=panel.querySelector("#shopPhone")?.value.trim(),email=panel.querySelector("#shopEmail")?.value.trim(),address=panel.querySelector("#shopAddress")?.value.trim();
  if(!name||!/^\d{10}$/.test(phone||"")||!address)return alert("Please enter your name, 10-digit mobile number and full address.");
  const items=cart.map(x=>({productId:x.id,quantity:Number(x.qty||1),variant:x.variant||"Standard",customization:Array.isArray(x.custom)?x.custom:[]}));
  if(items.some(x=>!x.productId||!catalog.some(p=>p.id===x.productId)))return alert("A product in your bag is unavailable. Refresh and try again.");
  const order=await api("/api/orders",{method:"POST",body:JSON.stringify({customerName:name,phone,email:email||"",address:{line1:address,country:"India"},items,fulfillment:"PREPAID"})});
  const payment=await api("/api/payu/create",{method:"POST",body:JSON.stringify({orderId:order.id,amount:order.total,productinfo:"Astrological Solutions Store Order",firstname:name,phone,email:email||"",udf1:"store",udf2:order.id})});
  submitPayU(payment.endpoint,payment.params);
 } catch(e) { alert(e.message||"ऑर्डर पूरा नहीं हो पाया।"); }
}
async function loadSiteContent() {
 try {
  const x=await api("/api/site-content"),a=document.querySelector(".store-cta b");
  if(a&&x.announcement)a.textContent=x.announcement;
  const heroTitle=document.querySelector(".hero h1"),heroSubtitle=document.querySelector(".hero-copy>p");
  if(heroTitle&&x.heroTitle){const words=String(x.heroTitle).split(/\s+/),cut=Math.max(1,Math.ceil(words.length/2));heroTitle.innerHTML=safeText(words.slice(0,cut).join(" "))+"<br><em>"+safeText(words.slice(cut).join(" "))+"</em>";}
  if(heroSubtitle&&x.heroSubtitle)heroSubtitle.textContent=x.heroSubtitle;
  if(x.seoTitle)document.title=x.seoTitle;
  const md=document.querySelector('meta[name="description"]');if(md&&x.seoDescription)md.content=x.seoDescription;
 } catch(e) { console.warn("CMS content unavailable",e); }
}

document.querySelectorAll(".modal-backdrop").forEach(el=>el.addEventListener("click",closeModal));
const menuButton=document.querySelector(".menu"),mainNav=document.querySelector(".nav-left nav");
menuButton?.addEventListener("click",()=>{const opened=mainNav?.classList.toggle("is-open");menuButton.setAttribute("aria-expanded",String(Boolean(opened)));});
mainNav?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{mainNav.classList.remove("is-open");menuButton?.setAttribute("aria-expanded","false");}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
updateCartBadge();loadLiveCatalog();loadSiteContent();initializePreferences();
const entryLoader=document.getElementById("loader");
if(entryLoader){window.setTimeout(()=>entryLoader.classList.add("solar-exit"),2100);window.setTimeout(()=>entryLoader.remove(),2850);}
