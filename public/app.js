let selectedNeed="Love & Relationship", cart=[]; const modal=document.getElementById("modal"), panel=document.getElementById("modalPanel");

function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}
function selectNeed(el,need){document.querySelectorAll(".need-card").forEach(x=>x.classList.remove("active"));el.classList.add("active");selectedNeed=need;document.getElementById("selectedNeed").textContent=need}
function closeModal(){modal.classList.remove("open")}
function openDemo(title){panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">THE EXPERIENCE</div><h2>'+title+'</h2><p>Three simple steps. No clutter. Pick a need, compare verified experts, choose a slot and pay securely. This demo shows the intended production flow.</p><div class="pay-box"><div><span>01</span><strong>Choose your guidance</strong></div><div><span>02</span><strong>Choose your expert + slot</strong></div><div><span>03</span><strong>Confirm securely</strong></div></div>';modal.classList.add("open")}
function openBooking(expert="Recommended Expert"){panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">CONSULTATION / '+selectedNeed.toUpperCase()+'</div><h2>Book your session.</h2><p>Recommended expert: <b style="color:#fff">'+expert+'</b><br>30 minute private consultation.</p><div class="eyebrow" style="margin-top:28px">SELECT A SLOT</div><div class="slot-grid">'+["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"].map((x,i)=>'<button class="slot '+(i===2?"active":"")+'" onclick="this.parentElement.querySelectorAll(\'.slot\').forEach(s=>s.classList.remove(\'active\'));this.classList.add(\'active\')">'+x+"</button>").join("")+'</div><div class="pay-box"><div><span>Consultation</span><strong>₹899</strong></div><div><span>Prepaid benefit</span><strong style="color:#9f88ff">−₹100</strong></div><hr style="border-color:#22202d;border-width:1px 0 0;margin:10px 0"><div><span>Total</span><strong>₹799</strong></div><button class="pay-btn" onclick="demoPayment()">Pay ₹799 securely →</button></div><p style="font-size:9px;margin-top:18px">Demo checkout — connect Razorpay/your payment gateway keys for production payments.</p>';modal.classList.add("open")}
function demoPayment(){panel.innerHTML='<div class="success"><div class="check">✓</div><h2>Booking secured.</h2><p>Your demo consultation has been confirmed. In production, this step will trigger payment verification, WhatsApp confirmation and calendar/meeting details.</p><button class="primary" onclick="closeModal()" style="margin-top:20px">Done</button></div>'}
function quickAdd(name,price,img,id=""){cart.push({name,price,img,id});openCart()}
function openCart(){
  let body=cart.length?cart.map(x=>'<div class="cart-item"><img src="'+(x.img||"")+'"><div><b>'+safeText(x.name)+'</b><small>'+safeText(x.price)+' · Prepaid eligible</small></div></div>').join(""):'<p>Your cart is empty. Explore the curated collection and add something meaningful.</p>';
  panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">YOUR BAG</div><h2>Ready to check out.</h2>'+body+(cart.length?'<div class="checkout-fields"><input id="shopName" placeholder="Full name" autocomplete="name"><input id="shopPhone" placeholder="Mobile number" inputmode="tel" maxlength="10" autocomplete="tel"><input id="shopEmail" placeholder="Email address" type="email" autocomplete="email"><input id="shopAddress" placeholder="Delivery address" autocomplete="street-address"></div><div class="pay-box"><div><span>Prepaid offer</span><strong>Save ₹100</strong></div><button class="pay-btn" onclick="startProductPayU()">Continue with PayU →</button></div>':'');
  modal.classList.add("open");
}
function init3D(){
  const host=document.getElementById("hero-canvas");
  if(!host||!window.THREE)return;
  try{
    const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(42,Math.max(host.clientWidth,1)/Math.max(host.clientHeight,1),.1,200);
    camera.position.set(0,2.2,15);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8)); renderer.setSize(host.clientWidth,host.clientHeight);
    if("outputColorSpace" in renderer&&THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;
    else if("outputEncoding" in renderer&&THREE.sRGBEncoding)renderer.outputEncoding=THREE.sRGBEncoding;
    host.innerHTML="";host.appendChild(renderer.domElement);
    const system=new THREE.Group();scene.add(system);
    const sun=new THREE.Mesh(new THREE.SphereGeometry(2.0,64,64),new THREE.MeshStandardMaterial({color:0xffc73a,emissive:0xffa300,emissiveIntensity:1.7,roughness:.4}));
    system.add(sun);
    system.add(new THREE.Mesh(new THREE.SphereGeometry(2.45,48,48),new THREE.MeshBasicMaterial({color:0xffd65a,transparent:true,opacity:.12,depthWrite:false})));
    const data=[{r:3.1,s:.24,c:0xb7aa8d,sp:.024},{r:4.2,s:.36,c:0xd2a36d,sp:.019},{r:5.4,s:.46,c:0x718e91,sp:.015},{r:6.8,s:.39,c:0xb86f4e,sp:.012},{r:8.4,s:.7,c:0xd1aa69,sp:.008,ring:true}];
    const planets=[];
    data.forEach((p,i)=>{
      const o=new THREE.Mesh(new THREE.TorusGeometry(p.r,.012,8,180),new THREE.MeshBasicMaterial({color:0xb89438,transparent:true,opacity:.25}));o.rotation.x=Math.PI/2;system.add(o);
      const m=new THREE.Mesh(new THREE.SphereGeometry(p.s,28,28),new THREE.MeshStandardMaterial({color:p.c,roughness:.72}));m.userData={r:p.r,a:i*1.2,sp:p.sp};system.add(m);planets.push(m);
      if(p.ring){const rr=new THREE.Mesh(new THREE.RingGeometry(.8,1.2,72),new THREE.MeshStandardMaterial({color:0xb99a62,side:THREE.DoubleSide,transparent:true,opacity:.6}));rr.rotation.x=.5;m.add(rr)}
    });
    scene.add(new THREE.AmbientLight(0xffe9bf,.4));const light=new THREE.PointLight(0xffc44b,100,80);scene.add(light);
    const starsGeo=new THREE.BufferGeometry(),pos=[];for(let i=0;i<1600;i++){const r=45+Math.random()*60,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);pos.push(r*Math.sin(p)*Math.cos(t),r*Math.sin(p)*Math.sin(t),r*Math.cos(p))}starsGeo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x8f7332,size:.045,transparent:true,opacity:.55}));scene.add(stars);
    let mx=0,my=0;host.addEventListener("pointermove",e=>{const r=host.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5});
    function tick(){requestAnimationFrame(tick);system.rotation.y+=.001;stars.rotation.y-=.0001;planets.forEach(p=>{p.userData.a+=p.userData.sp;p.position.set(Math.cos(p.userData.a)*p.userData.r,Math.sin(p.userData.a)*.22,Math.sin(p.userData.a)*p.userData.r)});system.rotation.x+=(my*.12-system.rotation.x)*.03;system.rotation.z+=(mx*.08-system.rotation.z)*.03;sun.rotation.y+=.0025;renderer.render(scene,camera)}tick();
    addEventListener("resize",()=>{camera.aspect=Math.max(host.clientWidth,1)/Math.max(host.clientHeight,1);camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)});
  }catch(e){console.warn("3D hero fallback",e)}
}
init3D();

// Production-ready demo integration layer
async function api(path, options={}){const res=await fetch(path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});const data=await res.json();if(!res.ok)throw new Error(data.error||"Request failed");return data}
async function loadLiveCatalog(){
  try{
    const [experts,products]=await Promise.all([api("/api/consultants"),api("/api/products")]);
    const grid=document.querySelector(".expert-grid");
    if(grid&&experts.length) grid.innerHTML=experts.map((x,i)=>'<article class="expert-card" onclick="openBooking(\''+x.name.replace(/'/g,"\\'")+'\',\''+x.id+'\')"><div class="expert-photo" style="background-image:url(\''+["https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=85"][i%3]+'\')"><span class="online">● AVAILABLE</span><span class="float-num">0'+(i+1)+'</span></div><div class="expert-info"><div><h3>'+x.name+'</h3><p>'+x.type+' · '+x.experience+'</p></div><span class="rating">★ '+x.rating+'</span></div><div class="expert-bottom"><b>₹'+x.price+' <small>/ 30 min</small></b><button>View & book ↗</button></div></article>').join("");
    const pg=document.querySelector(".product-grid");
    if(pg&&products.length) pg.innerHTML=products.map((x,i)=>'<article class="product-card"><div class="product-img" style="background-image:url(\''+["https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1604608672516-f1b4b5a4f4a0?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=900&q=85","https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=85"][i%4]+'\')"><span>PREPAID</span><button onclick="quickAdd(\''+x.name.replace(/'/g,"\\'")+'\',\''+x.price+'\',\'\')">+</button></div><div class="product-meta"><small>'+x.category+'</small><h3>'+x.name+'</h3><div><b>₹'+x.price+'</b>'+(x.compareAt?' <del>₹'+x.compareAt+'</del>':'')+'</div></div></article>').join("");
  }catch(e){console.warn("Demo catalog fallback",e)}
}
const oldOpenBooking=openBooking;
function safeText(v){return String(v??"").replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"}[c]))}
openBooking=async function(expert="Recommended Expert",consultantId="c1"){
  let experts=[];try{experts=await api("/api/consultants")}catch(e){}
  const c=experts.find(x=>x.name===expert)||experts.find(x=>x.id===consultantId)||experts[0];
  const price=c?.price||899, payable=Math.max(0,price-100);
  panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">CONSULTATION / '+safeText(selectedNeed.toUpperCase())+'</div><h2>Book your session.</h2><p>Expert: <b style="color:#fff">'+safeText(c?.name||expert)+'</b><br>'+safeText(c?.type||"Personal consultation")+' · 30 minutes.</p><div class="checkout-fields"><input id="payName" placeholder="Full name" autocomplete="name"><input id="payPhone" placeholder="Mobile number" inputmode="tel" maxlength="10" autocomplete="tel"><input id="payEmail" placeholder="Email address" type="email" autocomplete="email"></div><div class="eyebrow" style="margin-top:22px">SELECT A SLOT</div><div class="slot-grid">'+["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"].map((x,i)=>'<button class="slot '+(i===2?"active":"")+'" data-slot="'+x+'" onclick="this.parentElement.querySelectorAll(\'.slot\').forEach(s=>s.classList.remove(\'active\'));this.classList.add(\'active\')">'+x+"</button>").join("")+'</div><div class="pay-box"><div><span>Consultation</span><strong>₹'+price+'</strong></div><div><span>Prepaid benefit</span><strong style="color:#9f88ff">−₹100</strong></div><hr style="border-color:#22202d;border-width:1px 0 0;margin:10px 0"><div><span>Total</span><strong>₹'+payable+'</strong></div><button class="pay-btn" id="consultPayBtn">Pay ₹'+payable+' securely with PayU →</button></div><p style="font-size:9px;margin-top:18px">Secure PayU hosted checkout. Your card/UPI details are entered only on PayU.</p>';
  document.getElementById("consultPayBtn").onclick=()=>createBookingAndPay(c?.id||consultantId,payable);
  modal.classList.add("open");
}
async function createBookingAndPay(consultantId,amount){
  try{
    const name=document.getElementById("payName")?.value.trim(),phone=document.getElementById("payPhone")?.value.trim(),email=document.getElementById("payEmail")?.value.trim();
    if(!name||phone.length!==10||!email)return alert("Please enter valid name, 10-digit mobile and email.");
    const slot=document.querySelector(".slot.active")?.dataset.slot||"2:30 PM";
    const b=await api("/api/bookings",{method:"POST",body:JSON.stringify({customerName:name,customerPhone:phone,customerEmail:email,concern:selectedNeed,consultantId,slot,amount})});
    const p=await api("/api/payu/create",{method:"POST",body:JSON.stringify({bookingId:b.id,amount,productinfo:"Astrological Solutions Consultation",firstname:name,phone,email,udf1:"consultation",udf2:b.id})});
    submitPayU(p.endpoint,p.params);
  }catch(e){panel.innerHTML='<div class="success"><h2>Unable to start payment.</h2><p>'+safeText(e.message)+'</p><button class="ghost" onclick="closeModal()">Close</button></div>'}
}
function submitPayU(endpoint,params){
  const form=document.createElement("form");form.method="POST";form.action=endpoint;form.style.display="none";
  Object.entries(params||{}).forEach(([k,v])=>{const input=document.createElement("input");input.type="hidden";input.name=k;input.value=v??"";form.appendChild(input)});
  document.body.appendChild(form);form.submit();
}
async function startProductPayU(){
  try{
    if(!cart.length)return;
    const name=document.getElementById("shopName")?.value.trim(),phone=document.getElementById("shopPhone")?.value.trim(),email=document.getElementById("shopEmail")?.value.trim(),address=document.getElementById("shopAddress")?.value.trim();
    if(!name||phone.length!==10||!email||!address)return alert("Please complete name, 10-digit mobile, email and delivery address.");
    const catalog=await api("/api/products");
    const items=cart.map(x=>{const p=catalog.find(v=>v.name===x.name);return {productId:p?.id,quantity:1}});
    if(items.some(x=>!x.productId))return alert("One product is no longer available. Please refresh the collection.");
    const o=await api("/api/orders",{method:"POST",body:JSON.stringify({customerName:name,phone,email,address:{line1:address,country:"India"},items,fulfillment:"PREPAID"})});
    const p=await api("/api/payu/create",{method:"POST",body:JSON.stringify({orderId:o.id,amount:o.total,productinfo:"Astrological Solutions Store Order",firstname:name,phone,email,udf1:"store",udf2:o.id})});
    submitPayU(p.endpoint,p.params);
  }catch(e){alert(e.message)}
}
loadLiveCatalog();

/* Premium pointer-driven 3D card depth */
function enable3DCardDepth(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  document.querySelectorAll(".need-card,.expert-card,.product-card,.how-card").forEach(card=>{
    card.addEventListener("pointermove",e=>{
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform="perspective(900px) rotateX("+(-y*5)+"deg) rotateY("+(x*6)+"deg) translateY(-7px) translateZ(8px)";
    });
    card.addEventListener("pointerleave",()=>card.style.transform="");
  });
}
setTimeout(enable3DCardDepth,600);

function initSolarLoader(){
  const host=document.getElementById("solar-loader"),loader=document.getElementById("loader");
  if(!host||!loader)return;
  const hardStop=setTimeout(()=>{loader.classList.add("solar-exit");setTimeout(()=>{loader.style.opacity="0";loader.style.visibility="hidden"},900)},7000);
  try{
    if(window.THREE){
      const W=()=>Math.max(window.innerWidth,320),H=()=>Math.max(window.innerHeight,500);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,W()/H(),.1,220);
      camera.position.set(0,0,26);
      const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(W(),H());renderer.setClearColor(0x000000,0);
      if("outputColorSpace" in renderer&&THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;else if("outputEncoding" in renderer&&THREE.sRGBEncoding)renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.domElement.style.position="absolute";renderer.domElement.style.inset="0";renderer.domElement.style.zIndex="3";renderer.domElement.style.opacity="1";host.appendChild(renderer.domElement);
      const system=new THREE.Group();scene.add(system);
      const sun=new THREE.Mesh(new THREE.SphereGeometry(2,32,32),new THREE.MeshBasicMaterial({color:0xffc52e}));system.add(sun);
      const data=[3.2,4.3,5.6,7,8.8,10.5];
      data.forEach((r,i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.014,6,128),new THREE.MeshBasicMaterial({color:0xd6b25e,transparent:true,opacity:.35}));ring.rotation.x=Math.PI/2;system.add(ring);const p=new THREE.Mesh(new THREE.SphereGeometry(.25+i*.07,16,16),new THREE.MeshBasicMaterial({color:[0xb8ae9c,0xd49563,0x78989d,0xbd7352,0xd0aa6d,0xb7a48d][i]}));p.userData={r,a:i,sp:.012+i*.003};system.add(p)});
      scene.add(new THREE.AmbientLight(0xffffff,.8));
      const starsGeo=new THREE.BufferGeometry(),pos=[];for(let i=0;i<900;i++){const r=55+Math.random()*60,t=Math.random()*6.28,u=Math.random()*2-1,s=Math.sqrt(1-u*u);pos.push(r*s*Math.cos(t),r*s*Math.sin(t),r*u)}starsGeo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xffe9ad,size:.055,opacity:.7,transparent:true})));
      loader.classList.add("webgl-ready");
      function draw(){requestAnimationFrame(draw);system.rotation.y+=.001;system.children.forEach(x=>{if(x.userData.r){x.userData.a+=x.userData.sp;x.position.set(Math.cos(x.userData.a)*x.userData.r,0,Math.sin(x.userData.a)*x.userData.r)}});renderer.render(scene,camera)}draw();
      addEventListener("resize",()=>{camera.aspect=W()/H();camera.updateProjectionMatrix();renderer.setSize(W(),H())});
    }
  }catch(e){loader.classList.remove("webgl-ready");console.warn("3D solar enhancement fallback",e)}
  setTimeout(()=>{loader.classList.add("solar-exit");setTimeout(()=>{loader.style.opacity="0";loader.style.visibility="hidden";clearTimeout(hardStop)},900)},4800);
}
initSolarLoader();

async function loadSiteContent(){
  try{const x=await api("/api/site-content");
    const h=document.querySelector(".hero h1"), p=document.querySelector(".hero-copy>p"), a=document.querySelector(".store-cta b");
    if(h&&x.heroTitle){const parts=x.heroTitle.split(" ");const cut=Math.max(1,Math.floor(parts.length*.55));h.innerHTML=parts.slice(0,cut).join(" ")+"<br><em>"+parts.slice(cut).join(" ")+"</em>"}
    if(p&&x.heroSubtitle)p.textContent=x.heroSubtitle;
    if(a&&x.announcement)a.textContent=x.announcement;
    if(x.seoTitle)document.title=x.seoTitle;
    const md=document.querySelector('meta[name="description"]');if(md&&x.seoDescription)md.content=x.seoDescription;
  }catch(e){console.warn("CMS content fallback",e)}
}
loadSiteContent();
