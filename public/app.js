"use strict";
let selectedNeed = "प्यार और रिश्ते", cart = [], catalog = [], consultants = [];
const modal = document.getElementById("modal"), panel = document.getElementById("modalPanel");
try { cart = JSON.parse(localStorage.getItem("as-cart-v2") || "[]"); if (!Array.isArray(cart)) cart = []; } catch (_) { cart = []; }

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
async function loadLiveCatalog() {
 const pg=document.querySelector(".product-grid"), eg=document.querySelector(".expert-grid");
 try {
  const result=await Promise.all([api("/api/products"),api("/api/consultants")]);
  catalog=Array.isArray(result[0])?result[0]:[];consultants=Array.isArray(result[1])?result[1]:[];
  if(pg)pg.innerHTML=catalog.length?catalog.map(p=>{
   const img=productImage(p);
   return '<article class="product-card"><div class="product-img"><img src="'+safeText(img)+'" alt="'+safeText(p.name)+'" loading="lazy"><span>'+safeText(p.category||"दुकान")+'</span><button type="button" data-configure="'+safeText(p.id)+'" aria-label="कार्ट में जोड़ें">+</button></div><div class="product-meta"><small>'+safeText(p.category||"आध्यात्मिक उत्पाद")+'</small><h3>'+safeText(p.name)+'</h3><div><b>'+money(p.price)+'</b>'+(p.compareAt?' <del>'+money(p.compareAt)+'</del>':'')+'</div><button type="button" class="customize-btn" data-configure="'+safeText(p.id)+'">विकल्प चुनें · कार्ट में जोड़ें</button></div></article>';
  }).join(""):'<p class="catalog-empty">फिलहाल कोई उत्पाद उपलब्ध नहीं है।</p>';
  pg?.querySelectorAll("[data-configure]").forEach(b=>b.addEventListener("click",()=>configureProduct(b.dataset.configure)));
  if(eg)eg.querySelectorAll(".service-choice").forEach((b,i)=>b.addEventListener("click",()=>openBooking(null,consultants[i]?.id||consultants[0]?.id)));
 } catch(e) {
  console.error("Catalog could not be loaded",e);
  if(pg)pg.innerHTML='<p class="catalog-empty">उत्पाद लोड नहीं हो पाए। कनेक्शन जाँचकर पेज दोबारा खोलें।</p>';
 }
}
async function openBooking(expertName=null,consultantId=null) {
 try {
  if(!consultants.length)consultants=await api("/api/consultants");
  const chosen=consultants.find(c=>c.id===consultantId)||consultants.find(c=>c.name===expertName)||consultants[0];
  if(!chosen)throw new Error("अभी कोई सलाहकार उपलब्ध नहीं है।");
  panel.innerHTML='<button class="modal-close" aria-label="बंद करें">×</button><div class="eyebrow">ऑनलाइन परामर्श</div><h2>अपनी सलाह बुक करें</h2><p>विषय: <b>'+safeText(selectedNeed)+'</b></p><label class="booking-label">सलाहकार<select id="bookingConsultant">'+consultants.map(c=>'<option value="'+safeText(c.id)+'" data-price="'+numericPrice(c.price)+'" '+(c.id===chosen.id?"selected":"")+'>'+safeText(c.type||c.name)+' · '+money(c.price)+'</option>').join("")+'</select></label><div class="checkout-fields"><input id="payName" placeholder="पूरा नाम" autocomplete="name"><input id="payPhone" placeholder="10 अंकों का मोबाइल नंबर" inputmode="tel" maxlength="10" autocomplete="tel"><input id="payEmail" placeholder="ईमेल" type="email" autocomplete="email"></div><label class="booking-label">समय चुनें<select id="bookingSlot">'+["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"].map((s,i)=>'<option '+(i===2?"selected":"")+'>'+s+'</option>').join("")+'</select></label><div class="pay-box"><div><span>परामर्श शुल्क</span><strong id="consultPrice">'+money(chosen.price)+'</strong></div><div><span>ऑफ़र</span><strong>₹100</strong></div><div class="cart-grand"><span>देय राशि</span><strong id="consultTotal">'+money(Math.max(0,numericPrice(chosen.price)-100))+'</strong></div><button class="pay-btn" id="consultPayBtn">PayU से सुरक्षित भुगतान करें →</button></div>';
  panel.querySelector(".modal-close").addEventListener("click",closeModal);
  const updateAmount=()=>{const o=panel.querySelector("#bookingConsultant").selectedOptions[0],price=numericPrice(o.dataset.price);panel.querySelector("#consultPrice").textContent=money(price);panel.querySelector("#consultTotal").textContent=money(Math.max(0,price-100));};
  panel.querySelector("#bookingConsultant").addEventListener("change",updateAmount);
  panel.querySelector("#consultPayBtn").addEventListener("click",()=>{const o=panel.querySelector("#bookingConsultant").selectedOptions[0];createBookingAndPay(panel.querySelector("#bookingConsultant").value,Math.max(0,numericPrice(o.dataset.price)-100));});
  modal.classList.add("open");
 } catch(e) {
  panel.innerHTML='<button class="modal-close" aria-label="बंद करें">×</button><h2>अभी बुकिंग शुरू नहीं हो पाई</h2><p>'+safeText(e.message)+'</p>';
  panel.querySelector(".modal-close").addEventListener("click",closeModal);modal.classList.add("open");
 }
}
async function createBookingAndPay(consultantId,amount) {
 try {
  const name=panel.querySelector("#payName")?.value.trim(),phone=panel.querySelector("#payPhone")?.value.trim(),email=panel.querySelector("#payEmail")?.value.trim();
  if(!name||!/^\d{10}$/.test(phone||"")||!email)return alert("कृपया नाम, 10 अंकों का मोबाइल नंबर और ईमेल भरें।");
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
  if(!name||!/^\d{10}$/.test(phone||"")||!address)return alert("कृपया नाम, 10 अंकों का मोबाइल नंबर और पूरा पता भरें।");
  const items=cart.map(x=>({productId:x.id,quantity:Number(x.qty||1),variant:x.variant||"Standard",customization:Array.isArray(x.custom)?x.custom:[]}));
  if(items.some(x=>!x.productId||!catalog.some(p=>p.id===x.productId)))return alert("कार्ट में कोई उत्पाद उपलब्ध नहीं है। पेज रिफ्रेश करके फिर कोशिश करें।");
  const order=await api("/api/orders",{method:"POST",body:JSON.stringify({customerName:name,phone,email:email||"",address:{line1:address,country:"India"},items,fulfillment:"PREPAID"})});
  const payment=await api("/api/payu/create",{method:"POST",body:JSON.stringify({orderId:order.id,amount:order.total,productinfo:"Astrological Solutions Store Order",firstname:name,phone,email:email||"",udf1:"store",udf2:order.id})});
  submitPayU(payment.endpoint,payment.params);
 } catch(e) { alert(e.message||"ऑर्डर पूरा नहीं हो पाया।"); }
}
async function loadSiteContent() {
 try {
  const x=await api("/api/site-content"),a=document.querySelector(".store-cta b");
  if(a&&x.announcement)a.textContent=x.announcement;
  if(x.seoTitle)document.title=x.seoTitle;
  const md=document.querySelector('meta[name="description"]');if(md&&x.seoDescription)md.content=x.seoDescription;
 } catch(e) { console.warn("CMS content unavailable",e); }
}
document.querySelectorAll(".need-card").forEach(card=>card.addEventListener("click",()=>{const title=card.querySelector("b")?.textContent.trim();if(title)selectNeed(card,title);}));
document.querySelectorAll(".modal-backdrop").forEach(el=>el.addEventListener("click",closeModal));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
updateCartBadge();loadLiveCatalog();loadSiteContent();
