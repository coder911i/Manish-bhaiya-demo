let selectedNeed="Love & Relationship", cart=[]; const modal=document.getElementById("modal"), panel=document.getElementById("modalPanel");

function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}
function selectNeed(el,need){document.querySelectorAll(".need-card").forEach(x=>x.classList.remove("active"));el.classList.add("active");selectedNeed=need;document.getElementById("selectedNeed").textContent=need}
function closeModal(){modal.classList.remove("open")}
function openDemo(title){panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">THE EXPERIENCE</div><h2>'+title+'</h2><p>Three simple steps. No clutter. Pick a need, compare verified experts, choose a slot and pay securely. This demo shows the intended production flow.</p><div class="pay-box"><div><span>01</span><strong>Choose your guidance</strong></div><div><span>02</span><strong>Choose your expert + slot</strong></div><div><span>03</span><strong>Confirm securely</strong></div></div>';modal.classList.add("open")}
function openBooking(expert="Recommended Expert"){panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">CONSULTATION / '+selectedNeed.toUpperCase()+'</div><h2>Book your session.</h2><p>Recommended expert: <b style="color:#fff">'+expert+'</b><br>30 minute private consultation.</p><div class="eyebrow" style="margin-top:28px">SELECT A SLOT</div><div class="slot-grid">'+["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"].map((x,i)=>'<button class="slot '+(i===2?"active":"")+'" onclick="this.parentElement.querySelectorAll(\'.slot\').forEach(s=>s.classList.remove(\'active\'));this.classList.add(\'active\')">'+x+"</button>").join("")+'</div><div class="pay-box"><div><span>Consultation</span><strong>₹899</strong></div><div><span>Prepaid benefit</span><strong style="color:#9f88ff">−₹100</strong></div><hr style="border-color:#22202d;border-width:1px 0 0;margin:10px 0"><div><span>Total</span><strong>₹799</strong></div><button class="pay-btn" onclick="demoPayment()">Pay ₹799 securely →</button></div><p style="font-size:9px;margin-top:18px">Demo checkout — connect Razorpay/your payment gateway keys for production payments.</p>';modal.classList.add("open")}
function demoPayment(){panel.innerHTML='<div class="success"><div class="check">✓</div><h2>Booking secured.</h2><p>Your demo consultation has been confirmed. In production, this step will trigger payment verification, WhatsApp confirmation and calendar/meeting details.</p><button class="primary" onclick="closeModal()" style="margin-top:20px">Done</button></div>'}
function quickAdd(name,price,img){cart.push({name,price,img});openCart()}
function openCart(){let body=cart.length?cart.map(x=>'<div class="cart-item"><img src="'+x.img+'"><div><b>'+x.name+'</b><small>'+x.price+' · Prepaid eligible</small></div></div>').join(""):'<p>Your cart is empty. Explore the curated collection and add something meaningful.</p>';panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">YOUR BAG</div><h2>Ready to check out.</h2>'+body+'<div class="pay-box"><div><span>Prepaid offer</span><strong>Save ₹100</strong></div><button class="pay-btn" onclick="demoPayment()">Continue to secure checkout →</button></div>';modal.classList.add("open")}
function init3D(){const host=document.getElementById("hero-canvas");if(!host||!window.THREE)return;const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(40,host.clientWidth/host.clientHeight,.1,100);camera.position.z=7;const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);host.appendChild(renderer.domElement);const group=new THREE.Group();scene.add(group);const geo=new THREE.IcosahedronGeometry(2.05,3);const mat=new THREE.MeshPhysicalMaterial({color:0x7254ff,metalness:.45,roughness:.16,transmission:.15,clearcoat:1,clearcoatRoughness:.1,wireframe:false});const orb=new THREE.Mesh(geo,mat);group.add(orb);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.65,.012,16,180),new THREE.MeshBasicMaterial({color:0x9b82ff,transparent:true,opacity:.55}));ring.rotation.x=.65;group.add(ring);const ring2=ring.clone();ring2.rotation.x=1.2;ring2.rotation.y=.6;ring2.scale.setScalar(.86);group.add(ring2);const pts=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xb9aaff,size:.018,transparent:true,opacity:.7}));const arr=[];for(let i=0;i<900;i++){const r=4.5;arr.push((Math.random()-.5)*r,(Math.random()-.5)*r,(Math.random()-.5)*r)}pts.geometry.setAttribute("position",new THREE.Float32BufferAttribute(arr,3));group.add(pts);const a=new THREE.AmbientLight(0x7777aa,1.8);scene.add(a);const l=new THREE.PointLight(0xa68bff,5,15);l.position.set(3,3,4);scene.add(l);let mx=0,my=0;host.addEventListener("pointermove",e=>{mx=(e.clientX/innerWidth-.5)*.5;my=(e.clientY/innerHeight-.5)*.3});function tick(){requestAnimationFrame(tick);group.rotation.y+=(mx-group.rotation.y)*.03;group.rotation.x+=(my-group.rotation.x)*.03;orb.rotation.x+=.002;orb.rotation.y+=.004;ring.rotation.z+=.003;ring2.rotation.z-=.002;pts.rotation.y-=.0005;renderer.render(scene,camera)}tick();window.addEventListener("resize",()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)})}init3D();

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
openBooking=async function(expert="Recommended Expert",consultantId="c1"){
  let experts=[];try{experts=await api("/api/consultants")}catch(e){}
  const c=experts.find(x=>x.name===expert)||experts.find(x=>x.id===consultantId)||experts[0];
  const price=c?.price||899;
  panel.innerHTML='<button class="modal-close" onclick="closeModal()">×</button><div class="eyebrow">CONSULTATION / '+selectedNeed.toUpperCase()+'</div><h2>Book your session.</h2><p>Expert: <b style="color:#fff">'+(c?.name||expert)+'</b><br>'+(c?.type||"Personal consultation")+' · 30 minutes.</p><div class="eyebrow" style="margin-top:28px">SELECT A SLOT</div><div class="slot-grid">'+["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"].map((x,i)=>'<button class="slot '+(i===2?"active":"")+'" data-slot="'+x+'" onclick="this.parentElement.querySelectorAll(\'.slot\').forEach(s=>s.classList.remove(\'active\'));this.classList.add(\'active\')">'+x+"</button>").join("")+'</div><div class="pay-box"><div><span>Consultation</span><strong>₹'+price+'</strong></div><div><span>Prepaid benefit</span><strong style="color:#9f88ff">−₹100</strong></div><hr style="border-color:#22202d;border-width:1px 0 0;margin:10px 0"><div><span>Total</span><strong>₹'+Math.max(0,price-100)+'</strong></div><button class="pay-btn" onclick="createBookingAndPay(\''+(c?.id||consultantId)+'\','+Math.max(0,price-100)+')">Continue to secure checkout →</button></div><p style="font-size:9px;margin-top:18px">Secure checkout foundation. Production mode uses Razorpay when server credentials are configured.</p>';modal.classList.add("open");
}
async function createBookingAndPay(consultantId,amount){
  try{
    const slot=document.querySelector(".slot.active")?.dataset.slot||"2:30 PM";
    const b=await api("/api/bookings",{method:"POST",body:JSON.stringify({customerName:"Demo Customer",customerPhone:"9999999999",customerEmail:"",concern:selectedNeed,consultantId,slot,amount})});
    const p=await api("/api/payment/create",{method:"POST",body:JSON.stringify({amount,bookingId:b.id})});
    panel.innerHTML='<div class="success"><div class="check">✓</div><h2>Checkout ready.</h2><p>Booking <b>'+b.id+'</b> is created. Payment gateway: <b>'+p.gateway+'</b>.</p><button class="primary" onclick="closeModal()" style="margin-top:20px">Back to experience</button></div>';
  }catch(e){panel.innerHTML='<div class="success"><h2>Something went wrong.</h2><p>'+e.message+'</p><button class="ghost" onclick="closeModal()">Close</button></div>'}
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
  const host=document.getElementById("solar-loader");
  const loader=document.getElementById("loader");
  if(!host||!loader)return;
  const hardStop=setTimeout(()=>{loader.style.opacity="0";loader.style.visibility="hidden"},7000);
  if(!window.THREE){clearTimeout(hardStop);return;}
  const W=()=>window.innerWidth,H=()=>window.innerHeight;
  try{\n  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,W()/H(),.1,220);
  camera.position.set(0,0,26);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.setSize(W(),H()); renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.innerHTML="";host.appendChild(renderer.domElement);

  const system=new THREE.Group();
  system.position.set(0,0,0);
  const scale=()=>W()<600?.62:W()<900?.78:1;
  system.scale.setScalar(scale());
  scene.add(system);

  // Procedural 3D sun — geometry/material only, no generated artwork.
  const sun=new THREE.Mesh(
    new THREE.SphereGeometry(2.05,64,64),
    new THREE.MeshStandardMaterial({color:0xffc83d,emissive:0xffa500,emissiveIntensity:1.8,roughness:.42,metalness:.02})
  ); system.add(sun);
  const sunGlow=new THREE.Mesh(new THREE.SphereGeometry(2.55,48,48),
    new THREE.MeshBasicMaterial({color:0xffd45a,transparent:true,opacity:.13,depthWrite:false}));
  system.add(sunGlow);

  const data=[
    {r:3.2,s:.27,c:0xb7aa8d,sp:.030},{r:4.3,s:.42,c:0xd2a36d,sp:.023},
    {r:5.6,s:.52,c:0x6f8b91,sp:.019},{r:7.0,s:.42,c:0xb86f4e,sp:.015},
    {r:8.8,s:.78,c:0xd1aa69,sp:.010,ring:true},{r:10.5,s:.66,c:0xbaa48c,sp:.007}
  ];
  const planets=[];
  data.forEach((p,i)=>{
    const orbit=new THREE.Mesh(new THREE.TorusGeometry(p.r,.012,8,192),
      new THREE.MeshBasicMaterial({color:0xc9ad63,transparent:true,opacity:.24,depthWrite:false}));
    orbit.rotation.x=Math.PI/2; system.add(orbit);
    const planet=new THREE.Mesh(new THREE.SphereGeometry(p.s,32,32),
      new THREE.MeshStandardMaterial({color:p.c,roughness:.72,metalness:.08}));
    planet.userData={r:p.r,a:i*1.05,sp:p.sp,y:(i-2.5)*.045};
    system.add(planet);planets.push(planet);
    if(p.ring){
      const rings=new THREE.Mesh(new THREE.RingGeometry(.95,1.42,96),
        new THREE.MeshStandardMaterial({color:0xb99a62,side:THREE.DoubleSide,transparent:true,opacity:.62,roughness:.8}));
      rings.rotation.x=.42;planet.add(rings);
    }
    if(i===2||i===5){
      const moon=new THREE.Mesh(new THREE.SphereGeometry(.11,16,16),new THREE.MeshStandardMaterial({color:0xc8c0ae,roughness:.9}));
      moon.userData={parent:planet,rad:p.s+.48,a:i,sp:.035}; system.add(moon);
      planet.userData.moon=moon;
    }
  });

  // Asteroid belt gives the scene physical depth.
  const belt=new THREE.Mesh(new THREE.TorusGeometry(7.9,.18,10,220),
    new THREE.MeshBasicMaterial({color:0xb99b5d,transparent:true,opacity:.22}));
  belt.rotation.x=Math.PI/2;system.add(belt);

  // Deep star field.
  const starGeo=new THREE.BufferGeometry(),pos=[];
  for(let i=0;i<2200;i++){const radius=65+Math.random()*80,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);pos.push(radius*Math.sin(ph)*Math.cos(th),radius*Math.sin(ph)*Math.sin(th),radius*Math.cos(ph))}
  starGeo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
  const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffedbd,size:.045,transparent:true,opacity:.9}));
  scene.add(stars);

  scene.add(new THREE.AmbientLight(0xffedc9,.28));
  const sunLight=new THREE.PointLight(0xffc44b,110,90);scene.add(sunLight);

  let t=0,done=false;
  function animate(){
    if(done)return;requestAnimationFrame(animate);t+=.008;
    sun.rotation.y+=.0035;sunGlow.scale.setScalar(1+Math.sin(t*2.2)*.035);
    planets.forEach(p=>{
      p.userData.a+=p.userData.sp;
      p.position.set(Math.cos(p.userData.a)*p.userData.r,Math.sin(p.userData.a*.65)*p.userData.y,Math.sin(p.userData.a)*p.userData.r);
      if(p.userData.moon){
        const m=p.userData.moon;m.userData.a+=m.userData.sp;
        m.position.set(Math.cos(m.userData.a)*m.userData.rad,0,Math.sin(m.userData.a)*m.userData.rad);
      }
    });
    belt.rotation.z+=.0015;system.rotation.y+=.0007;stars.rotation.y-=.00012;
    renderer.render(scene,camera);
  }
  animate();

  // Every fresh page load starts here. No localStorage/session gate.
  setTimeout(()=>{
    loader.classList.add("solar-exit");
    setTimeout(()=>{loader.style.opacity="0";loader.style.visibility="hidden";done=true;},1100);
  },4800);

  clearTimeout(hardStop);\n  window.addEventListener("resize",()=>{
    camera.aspect=W()/H();camera.updateProjectionMatrix();renderer.setSize(W(),H());
    system.scale.setScalar(scale());
  });
}
initSolarLoader();

async function loadSiteContent(){
  try{const x=await api("/api/admin/content");
    const h=document.querySelector(".hero h1"), p=document.querySelector(".hero-copy>p"), a=document.querySelector(".store-cta b");
    if(h&&x.heroTitle){const parts=x.heroTitle.split(" ");const cut=Math.max(1,Math.floor(parts.length*.55));h.innerHTML=parts.slice(0,cut).join(" ")+"<br><em>"+parts.slice(cut).join(" ")+"</em>"}
    if(p&&x.heroSubtitle)p.textContent=x.heroSubtitle;
    if(a&&x.announcement)a.textContent=x.announcement;
    if(x.seoTitle)document.title=x.seoTitle;
    const md=document.querySelector('meta[name="description"]');if(md&&x.seoDescription)md.content=x.seoDescription;
  }catch(e){console.warn("CMS content fallback",e)}
}
loadSiteContent();
