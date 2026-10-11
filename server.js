const express=require("express"),cors=require("cors"),path=require("path"),helmet=require("helmet"),rateLimit=require("express-rate-limit"),{z}=require("zod");
const app=express();
const crypto=require("crypto");
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:process.env.CORS_ORIGIN||true}));
app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({extended:true,limit:"1mb"}));
app.use(rateLimit({windowMs:60*1000,max:120,standardHeaders:true,legacyHeaders:false}));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.static(__dirname));

// Explicit HTML entrypoint for the Vercel Express function.
// Vercel may hand "/" to the function instead of serving public/index.html directly.
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

const consultants=[
{id:"c1",name:"Ananya Sharma",type:"Vedic Astrologer",experience:"18 years",rating:4.9,price:32,pricePerMinute:32,available:true,languages:["English","Hindi"],specialty:"Relationships · Marriage · Birth charts",photo:"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=85",bio:"Vedic astrology focused on relationships, career and life timing."},
{id:"c2",name:"Raghav Mehta",type:"Numerologist",experience:"12 years",rating:4.8,price:25,pricePerMinute:25,available:true,languages:["English","Hindi"],specialty:"Name analysis · Career · Business",photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85",bio:"Numerology guidance for names, business decisions and personal cycles."},
{id:"c3",name:"Meera Kapoor",type:"Vastu Consultant",experience:"15 years",rating:4.9,price:40,pricePerMinute:40,available:true,languages:["English","Hindi"],specialty:"Home · Office · Commercial spaces",photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85",bio:"Practical vastu consultations for homes, offices and commercial spaces."}];
const products=[
{id:"p1",name:"1 मुखी रुद्राक्ष",slug:"1-mukhi-rudraksha",price:2345,compareAt:null,category:"Rudraksha",stock:20,image:"https://srimandir.store/cdn/shop/files/Rudraksha_Mala_7_Mukhi.jpg?v=1771228064&width=1500",variants:["एक दाना","प्रमाणपत्र सहित"],customOptions:["गिफ्ट पैक"]},
{id:"p2",name:"5 मुखी रुद्राक्ष माला",slug:"5-mukhi-rudraksha-mala",price:699,compareAt:1199,category:"Rudraksha",stock:40,image:"https://srimandir.store/cdn/shop/files/Rudraksha_Mala_7_Mukhi.jpg?v=1771228064&width=1500",variants:["54 दाने","108 दाने"],customOptions:["गिफ्ट पैक"]},
{id:"p3",name:"शालिग्राम शिला",slug:"sudarshan-shaligram",price:400,compareAt:null,category:"Shaligram",stock:25,image:"https://cdn.shopify.com/s/files/1/0756/9398/2016/files/02-12-2022-05-58-12s2.webp?v=1715691070",variants:["स्टैंडर्ड"],customOptions:["पूजा पैक"]},
{id:"p4",name:"अमेथिस्ट रत्न ब्रेसलेट",slug:"amethyst-gemstone-bracelet",price:2000,compareAt:null,category:"Gemstones",stock:15,image:"https://jaipurcrystalgems.com/cdn/shop/files/DSC_0788.jpg?crop=center&height=1200&v=1758362499&width=1200",variants:["स्टैंडर्ड","प्रीमियम"],customOptions:["गिफ्ट पैक"]},
{id:"p5",name:"रत्न ब्रेसलेट",slug:"gemstone-bracelet",price:299,compareAt:null,category:"Gemstones",stock:35,image:"https://premokshi.com/cdn/shop/files/DhanYog_Bracelet.png?v=1777801541",variants:["6 mm","8 mm","10 mm"],customOptions:["गिफ्ट पैक"]},
{id:"p6",name:"क्रिस्टल पिरामिड",slug:"crystal-pyramid",price:799,compareAt:null,category:"Crystals",stock:30,image:"https://gosimplyvedic.com/cdn/shop/files/11_chakra_bracelet.jpg?v=1724400572",variants:["छोटा","बड़ा"],customOptions:["गिफ्ट पैक"]},
{id:"p7",name:"वास्तु पिरामिड सेट",slug:"vastu-pyramid-set",price:2345,compareAt:null,category:"Vastu Products",stock:12,image:"https://zenvedas.com/cdn/shop/files/Untitled-18_jpg_6535befa-6589-433e-83b3-8895607bf9a0.jpg?v=1769520316",variants:["ब्रास","कॉपर"],customOptions:["पूजा पैक"]},
{id:"p8",name:"क्रिस्टल वास्तु पिरामिड",slug:"crystal-vastu-pyramid",price:344,compareAt:null,category:"Vastu Products",stock:30,image:"https://shop.apnisanskriti.com/cdn/shop/collections/vastu_pyramid.png?v=1768846537",variants:["स्टैंडर्ड"],customOptions:["गिफ्ट पैक"]},
{id:"p9",name:"सॉलिड परफ्यूम",slug:"solid-perfume",price:322,compareAt:null,category:"Perfumes",stock:30,image:"https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85",variants:["स्टैंडर्ड"],customOptions:["गिफ्ट पैक"]},
{id:"p10",name:"पुरुषों का परफ्यूम",slug:"fragrance-for-men",price:569,compareAt:null,category:"Perfumes",stock:25,image:"https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85",variants:["50 ml","100 ml"],customOptions:["गिफ्ट पैक"]},
{id:"p11",name:"शंख एवं सीप",slug:"shankh-sea-shells",price:1299,compareAt:null,category:"Shankh Sea Shells",stock:20,image:"https://cdn.vedicvaani.in/products/extra_large/s/sacred_mantra_aum_conch_blowing_shankha_vishnu_shell_17543061471.webp",variants:["स्टैंडर्ड"],customOptions:["पूजा पैक"]},
{id:"p12",name:"पीतल के दीये",slug:"brass-diyas",price:499,compareAt:null,category:"Pooja",stock:40,image:"https://cdn.shopify.com/s/files/1/0632/2526/6422/files/BGGDB146_other_2.jpg?v=1752867396",variants:["2 का सेट","5 का सेट"],customOptions:["गिफ्ट पैक"]}];
let bookings=[],orders=[];
let offers=[{id:"o1",code:"PREPAID100",title:"₹100 off on prepaid",type:"FIXED",value:100,active:true},{id:"o2",code:"FIRSTCONSULT",title:"10% off first consultation",type:"PERCENT",value:10,active:true}];
let siteContent={heroTitle:"Guidance for every chapter.",heroSubtitle:"Relationships, career, marriage or your birth chart — talk to an expert who understands your questions.",announcement:"Free shipping on orders over ₹1,000.",seoTitle:"Astrological Solutions | Astrology, Horoscope & Vastu",seoDescription:"Book astrology, horoscope, numerology and vastu consultations. Explore spiritual essentials online."};

const bookingSchema=z.object({customerName:z.string().min(2).max(100),customerPhone:z.string().min(10).max(15),customerEmail:z.string().email().optional().or(z.literal("")),concern:z.string().min(2).max(100),consultantId:z.string(),slot:z.string(),amount:z.number().int().positive(),duration:z.number().int().positive().optional()});
const orderSchema=z.object({customerName:z.string().min(2),phone:z.string().min(10).max(15),email:z.string().email().optional().or(z.literal("")),address:z.record(z.any()),items:z.array(z.object({productId:z.string(),quantity:z.number().int().positive(),variant:z.string().optional(),customization:z.array(z.string()).optional()})).min(1),fulfillment:z.enum(["PREPAID","COD"]),couponCode:z.string().optional()});

app.get("/api/health",(q,r)=>r.json({ok:true,service:"Astrological Solutions",mode:"in-memory-demo",payment:process.env.PAYU_KEY&&process.env.PAYU_SALT?"payu-configured":"not-configured",spreadsheet:process.env.GOOGLE_SHEETS_WEBHOOK_URL&&process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?"configured":"not-configured",admin:process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD_HASH&&process.env.ADMIN_SESSION_SECRET?"configured":"not-configured"}));
app.get("/api/consultants",(q,r)=>r.json(consultants.filter(x=>x.available)));
app.get("/api/consultants/:id",(q,r)=>{const x=consultants.find(x=>x.id===q.params.id);x?r.json(x):r.status(404).json({error:"Not found"})});
app.get("/api/products",(q,r)=>r.json(products.filter(x=>x.stock>0&&x.active!==false)));
app.get("/api/products/:id",(q,r)=>{const x=products.find(x=>x.id===q.params.id&&x.stock>0&&x.active!==false);x?r.json(x):r.status(404).json({error:"Not found"})});
app.get("/api/slots",(q,r)=>r.json(["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"]));


// -------------------- Public CMS / commerce APIs --------------------
app.get("/api/site-content",(q,r)=>r.json(siteContent));

app.post("/api/orders",(q,r)=>{
  const parsed=orderSchema.safeParse(q.body);
  if(!parsed.success)return r.status(400).json({error:"Invalid order data",details:parsed.error.flatten()});
  const data=parsed.data;
  const lineItems=[];
  for(const item of data.items){
    const p=products.find(x=>x.id===item.productId && x.stock>=item.quantity);
    if(!p)return r.status(409).json({error:"Product unavailable or insufficient stock"});
    lineItems.push({productId:p.id,quantity:item.quantity,unitPrice:Math.round(Number(p.price)),variant:item.variant||"Standard",customization:item.customization||[]});
  }
  const subtotal=lineItems.reduce((s,i)=>s+i.unitPrice*i.quantity,0);
  const offer=data.couponCode?offers.find(x=>x.active&&x.code.toLowerCase()===data.couponCode.toLowerCase()):null;
  let discount=0;
  if(offer && subtotal>=Number(offer.minOrder||0)){
    discount=offer.type==="PERCENT"?Math.round(subtotal*offer.value/100):Math.min(subtotal,Number(offer.value));
  }
  const shipping=subtotal-discount>=1000?0:99;
  const total=Math.max(0,subtotal-discount+shipping);
  const o={id:"ASO-"+(10000+orders.length+1),...data,items:lineItems,subtotal,discount,shipping,total,status:"PAYMENT_PENDING",paymentStatus:"PENDING",createdAt:new Date().toISOString()};
  orders.push(o);

  // Best-effort spreadsheet sync. The order is accepted independently so a temporary
  // Google Sheets outage never loses the customer's checkout response.
  void syncOrderToSpreadsheet(o).catch((err)=>{
    console.error("Order spreadsheet sync failed", {orderId:o.id, error:err.message});
  });
  r.status(201).json(o);
});


// -------------------- Order spreadsheet export --------------------
// Configure a deployed Google Apps Script Web App URL and a shared secret
// on the server. Never put these values in frontend JavaScript.
async function syncOrderToSpreadsheet(order){
  const endpoint=String(process.env.GOOGLE_SHEETS_WEBHOOK_URL||"").trim();
  const secret=String(process.env.GOOGLE_SHEETS_WEBHOOK_SECRET||"");
  if(!endpoint || !secret) return; // Integration intentionally disabled until configured.
  const payload={
    secret,
    orderId:order.id,
    createdAt:order.createdAt,
    customerName:order.customerName,
    phone:order.phone,
    email:order.email||"",
    address:order.address,
    fulfillment:order.fulfillment,
    items:order.items.map(item=>{
      const product=products.find(p=>p.id===item.productId);
      return {productId:item.productId, name:product?.name||item.productId, quantity:item.quantity, unitPrice:item.unitPrice, lineTotal:item.quantity*item.unitPrice, variant:item.variant||"Standard", customization:item.customization||[]};
    }),
    subtotal:order.subtotal,
    discount:order.discount,
    shipping:order.shipping,
    total:order.total,
    couponCode:order.couponCode||"",
    paymentStatus:order.paymentStatus,
    status:order.status
  };
  const response=await fetch(endpoint,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(payload),
    signal:AbortSignal.timeout(8000)
  });
  if(!response.ok) throw new Error("Sheets webhook returned HTTP "+response.status);
  const result=await response.json().catch(()=>({}));
  if(result.ok!==true) throw new Error(result.error||"Sheets webhook rejected the order");
}

// -------------------- Admin authentication --------------------
function parseCookies(req){
  return String(req.headers.cookie||"").split(";").reduce((out,p)=>{
    const i=p.indexOf("="); if(i<0)return out;
    out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim()); return out;
  },{});
}
function adminToken(){
  // No fallback secret: admin sessions must use a strong server-side secret.
  const secret=String(process.env.ADMIN_SESSION_SECRET||"");
  if(secret.length<32 || secret==="long-random-server-secret") return "";
  return secret;
}
function makeAdminSession(email){
  const payload=Buffer.from(JSON.stringify({email,exp:Date.now()+12*60*60*1000})).toString("base64url");
  const sig=crypto.createHmac("sha256",adminToken()).update(payload).digest("base64url");
  return payload+"."+sig;
}
function validAdminSession(req){
  const secret=adminToken(); if(!secret)return false;
  const token=parseCookies(req).as_admin; if(!token)return false;
  const [payload,sig]=token.split("."); if(!payload||!sig)return false;
  const expected=crypto.createHmac("sha256",secret).update(payload).digest("base64url");
  if(!safeEqual(sig,expected))return false;
  try{return JSON.parse(Buffer.from(payload,"base64url").toString("utf8")).exp>Date.now()}catch{return false}
}
function adminGuard(req,res,next){
  if(!validAdminSession(req))return res.status(401).json({error:"Admin authentication required"});
  next();
}
async function passwordMatches(password){
  const hash=process.env.ADMIN_PASSWORD_HASH||"";
  if(!hash)return false;
  const bcrypt=require("bcryptjs");
  return bcrypt.compare(String(password||""),hash);
}
app.post("/api/admin/login",rateLimit({windowMs:15*60*1000,max:10,standardHeaders:true,legacyHeaders:false}),async(q,r)=>{
  try{
    const email=String(q.body?.email||"").trim().toLowerCase();
    const password=String(q.body?.password||"");
    const configuredEmail=String(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
    if(!adminToken()||!configuredEmail||!process.env.ADMIN_PASSWORD_HASH)
      return r.status(503).json({error:"Admin authentication is not configured on the server"});
    if(!email||!password||email!==configuredEmail||!(await passwordMatches(password)))
      return r.status(401).json({error:"Invalid email or password"});
    const token=makeAdminSession(email);
    r.setHeader("Set-Cookie","as_admin="+encodeURIComponent(token)+"; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200"+(process.env.NODE_ENV==="production"?"; Secure":""));
    r.json({ok:true});
  }catch(e){r.status(500).json({error:"Unable to sign in"})}
});
app.post("/api/admin/logout",(q,r)=>{
  r.setHeader("Set-Cookie","as_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"+(process.env.NODE_ENV==="production"?"; Secure":""));
  r.json({ok:true});
});

function adminConsultant(x){return {...x,experience:x.experience||String(x.experienceYears||0)+" years"}}
function adminProduct(x){return {...x,price:Number(x.price),compareAt:x.compareAt==null?null:Number(x.compareAt),active:x.active!==false}}
function slugify(x){return String(x||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}

app.get("/api/admin/stats",adminGuard,(q,r)=>{
  const paid=bookings.filter(x=>x.paymentStatus==="PAID").length+orders.filter(x=>x.paymentStatus==="PAID").length;
  const total=bookings.length+orders.length;
  const revenue=bookings.filter(x=>x.paymentStatus==="PAID").reduce((s,x)=>s+Number(x.amount||0),0)+orders.filter(x=>x.paymentStatus==="PAID").reduce((s,x)=>s+Number(x.total||0),0);
  const prepaid=orders.length?Math.round(orders.filter(x=>x.fulfillment==="PREPAID").length/orders.length*100):0;
  const conversion=total?Math.round(paid/total*100):0;
  r.json({revenue,consultations:bookings.length,prepaidRate:prepaid,conversion});
});
app.get("/api/admin/consultants",adminGuard,(q,r)=>r.json(consultants.map(adminConsultant)));
app.post("/api/admin/consultants",adminGuard,(q,r)=>{
  const v=q.body||{}; if(!v.name)return r.status(400).json({error:"Name is required"});
  const x={id:"c"+Date.now(),name:String(v.name),type:String(v.type||"Vedic Astrologer"),experience:String(v.experience||"0 years"),rating:Number(v.rating||0),price:Math.max(1,Math.round(Number(v.price||0))),pricePerMinute:Math.max(1,Math.round(Number(v.price||0))),available:v.available!=="false"&&v.available!==false,bio:String(v.bio||""),languages:["English","Hindi"],specialty:String(v.specialty||v.type||"Personal guidance"),photo:String(v.photo||"")};
  consultants.push(x);r.status(201).json(x);
});
app.patch("/api/admin/consultants/:id",adminGuard,(q,r)=>{
  const x=consultants.find(v=>v.id===q.params.id);if(!x)return r.status(404).json({error:"Consultant not found"});
  const nextPrice=Math.max(1,Math.round(Number(q.body.price??x.pricePerMinute??x.price)));Object.assign(x,{...q.body,id:x.id,price:nextPrice,pricePerMinute:nextPrice,rating:Number(q.body.rating??x.rating),available:q.body.available==="false"?false:q.body.available===false?false:true});
  r.json(x);
});
app.delete("/api/admin/consultants/:id",adminGuard,(q,r)=>{
  const i=consultants.findIndex(v=>v.id===q.params.id);if(i<0)return r.status(404).json({error:"Consultant not found"});
  consultants.splice(i,1);r.json({ok:true});
});

app.get("/api/admin/products",adminGuard,(q,r)=>r.json(products.map(adminProduct)));
app.post("/api/admin/products",adminGuard,(q,r)=>{
  const v=q.body||{};if(!v.name)return r.status(400).json({error:"Product name is required"});
  const slug=slugify(v.slug||v.name);if(products.some(x=>x.slug===slug))return r.status(409).json({error:"Product slug already exists"});
  const x={id:"p"+Date.now(),name:String(v.name),slug,category:String(v.category||"General"),description:String(v.description||""),price:Math.max(1,Math.round(Number(v.price||0))),compareAt:Number(v.compareAt||0)||null,stock:Math.max(0,Math.round(Number(v.stock||0))),active:v.active!=="false"&&v.active!==false,image:String(v.image||""),badge:String(v.badge||"PREPAID"),variants:Array.isArray(v.variants)?v.variants:String(v.variants||"Standard").split(",").map(s=>s.trim()).filter(Boolean),customOptions:Array.isArray(v.customOptions)?v.customOptions:String(v.customOptions||"Gift wrap").split(",").map(s=>s.trim()).filter(Boolean)};
  products.push(x);r.status(201).json(x);
});
app.patch("/api/admin/products/:id",adminGuard,(q,r)=>{
  const x=products.find(v=>v.id===q.params.id);if(!x)return r.status(404).json({error:"Product not found"});
  const slug=slugify(q.body.slug||x.slug);if(products.some(v=>v.id!==x.id&&v.slug===slug))return r.status(409).json({error:"Product slug already exists"});
  Object.assign(x,{...q.body,id:x.id,slug,price:Math.max(1,Math.round(Number(q.body.price??x.price))),compareAt:Number(q.body.compareAt??x.compareAt)||null,stock:Math.max(0,Math.round(Number(q.body.stock??x.stock))),active:q.body.active==="false"?false:q.body.active===false?false:true,image:String(q.body.image??x.image??""),badge:String(q.body.badge??x.badge??"PREPAID"),variants:Array.isArray(q.body.variants)?q.body.variants:String(q.body.variants??(x.variants||["Standard"])).split(",").map(s=>s.trim()).filter(Boolean),customOptions:Array.isArray(q.body.customOptions)?q.body.customOptions:String(q.body.customOptions??(x.customOptions||[])).split(",").map(s=>s.trim()).filter(Boolean)});
  r.json(x);
});
app.delete("/api/admin/products/:id",adminGuard,(q,r)=>{
  const i=products.findIndex(v=>v.id===q.params.id);if(i<0)return r.status(404).json({error:"Product not found"});
  products.splice(i,1);r.json({ok:true});
});

app.get("/api/admin/bookings",adminGuard,(q,r)=>r.json(bookings));
app.get("/api/admin/orders",adminGuard,(q,r)=>r.json(orders));
app.patch("/api/admin/bookings/:id",adminGuard,(q,r)=>{
  const x=bookings.find(v=>v.id===q.params.id);if(!x)return r.status(404).json({error:"Booking not found"});
  if(!["PENDING_PAYMENT","CONFIRMED","COMPLETED","CANCELLED"].includes(q.body?.status))return r.status(400).json({error:"Invalid booking status"});
  x.status=q.body.status;r.json(x);
});
app.patch("/api/admin/orders/:id",adminGuard,(q,r)=>{
  const x=orders.find(v=>v.id===q.params.id);if(!x)return r.status(404).json({error:"Order not found"});
  if(!["PAYMENT_PENDING","CONFIRMATION_PENDING","CONFIRMED","PACKED","SHIPPED","DELIVERED","RTO","CANCELLED"].includes(q.body?.status))return r.status(400).json({error:"Invalid order status"});
  x.status=q.body.status;r.json(x);
});

app.get("/api/admin/offers",adminGuard,(q,r)=>r.json(offers));
app.post("/api/admin/offers",adminGuard,(q,r)=>{
  const v=q.body||{},code=String(v.code||"").trim().toUpperCase();
  if(!code)return r.status(400).json({error:"Offer code is required"});
  if(offers.some(x=>x.code===code))return r.status(409).json({error:"Offer code already exists"});
  const x={id:"o"+Date.now(),code,title:String(v.title||code),type:v.type==="PERCENT"?"PERCENT":"FIXED",value:Math.max(0,Math.round(Number(v.value||0))),active:v.active!==false&&v.active!=="false",minOrder:Math.max(0,Math.round(Number(v.minOrder||0)))};
  offers.push(x);r.status(201).json(x);
});
app.patch("/api/admin/offers/:id",adminGuard,(q,r)=>{
  const x=offers.find(v=>v.id===q.params.id);if(!x)return r.status(404).json({error:"Offer not found"});
  Object.assign(x,{...q.body,id:x.id,code:String(q.body.code||x.code).toUpperCase(),value:Math.max(0,Math.round(Number(q.body.value??x.value))),active:q.body.active==="false"?false:q.body.active===false?false:true});
  r.json(x);
});
app.delete("/api/admin/offers/:id",adminGuard,(q,r)=>{
  const i=offers.findIndex(v=>v.id===q.params.id);if(i<0)return r.status(404).json({error:"Offer not found"});
  offers.splice(i,1);r.json({ok:true});
});

app.get("/api/admin/content",adminGuard,(q,r)=>r.json(siteContent));
app.patch("/api/admin/content",adminGuard,(q,r)=>{
  siteContent={...siteContent,...q.body};
  r.json(siteContent);
});

app.post("/api/bookings",(q,r)=>{const parsed=bookingSchema.safeParse(q.body);if(!parsed.success)return r.status(400).json({error:"Invalid booking data",details:parsed.error.flatten()});const c=consultants.find(x=>x.id===parsed.data.consultantId);if(!c)return r.status(404).json({error:"Consultant not found"});const duration=parsed.data.duration||10,rate=Number(c.pricePerMinute||c.price);if(!Number.isFinite(rate)||rate<=0)return r.status(400).json({error:"Consultation rate is not configured"});const amount=rate*duration;const b={id:"AS-"+(10000+bookings.length+1),...parsed.data,duration,ratePerMinute:rate,amount,status:"PENDING_PAYMENT",paymentStatus:"PENDING",createdAt:new Date().toISOString()};bookings.push(b);r.status(201).json(b)});

function sha512(value){return require("crypto").createHash("sha512").update(value,"utf8").digest("hex")}
function safeEqual(a,b){const crypto=require("crypto");const aa=Buffer.from(String(a||"").toLowerCase());const bb=Buffer.from(String(b||"").toLowerCase());return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
function payuRequestHash(p,salt){
  const hashString=[p.key,p.txnid,p.amount,p.productinfo,p.firstname,p.email,p.udf1||"",p.udf2||"",p.udf3||"",p.udf4||"",p.udf5||""].join("|")+"||||||"+salt;
  return sha512(hashString);
}
function payuResponseHash(p,salt){
  const hashString=[salt,p.status].join("|")+"||||||"+[p.udf5||"",p.udf4||"",p.udf3||"",p.udf2||"",p.udf1||"",p.email||"",p.firstname||"",p.productinfo||"",p.amount||"",p.txnid||"",p.key||""].join("|");
  return sha512(hashString);
}
function publicBaseUrl(req){return (process.env.PUBLIC_URL||(`${req.protocol}://${req.get("host")}`)).replace(/\/$/,"")}
function markPayment(txnid,payload){
  const b=bookings.find(x=>x.id===txnid); const o=orders.find(x=>x.id===txnid);
  const target=b||o; if(!target)return false;
  if(target.paymentStatus==="PAID" && payload.status==="success")return true;
  target.paymentStatus=payload.status==="success"?"PAID":"FAILED";
  target.status=payload.status==="success"?(b?"CONFIRMED":"CONFIRMED"):(b?"PENDING_PAYMENT":"PAYMENT_PENDING");
  target.payuTxnId=payload.txnid; target.payuId=payload.mihpayid||null; target.paymentMode=payload.mode||null;
  if(o&&payload.status==="success"&&Array.isArray(o.items)){o.items.forEach(i=>{const p=products.find(x=>x.id===i.productId);if(p)p.stock=Math.max(0,p.stock-i.quantity)})}
  target.paymentUpdatedAt=new Date().toISOString(); return true;
}

app.post("/api/payu/create",(q,r)=>{
  if(!process.env.PAYU_KEY||!process.env.PAYU_SALT)return r.status(503).json({error:"PayU is not configured. Add PAYU_KEY and PAYU_SALT on the server."});
  const body=q.body||{}, amount=Number(body.amount);
  const name=String(body.firstname||body.customerName||"").trim(), email=String(body.email||"").trim(), phone=String(body.phone||body.customerPhone||"").replace(/\D/g,"");
  if(!Number.isFinite(amount)||amount<=0||!name||phone.length<10||!email)return r.status(400).json({error:"Valid name, email, phone and amount are required"});
  const txnid=String(body.txnid||body.bookingId||body.orderId||("AS"+Date.now()+Math.random().toString(36).slice(2,7))).replace(/[^A-Za-z0-9_-]/g,"").slice(0,40);
  const params={key:process.env.PAYU_KEY,txnid,amount:amount.toFixed(2),productinfo:String(body.productinfo||"Astrological Solutions"),firstname:name,lastname:String(body.lastname||""),email,phone,udf1:String(body.udf1||""),udf2:String(body.udf2||""),udf3:String(body.udf3||""),udf4:String(body.udf4||""),udf5:String(body.udf5||"")};
  const base=publicBaseUrl(q), hash=payuRequestHash(params,process.env.PAYU_SALT);
  params.hash=hash; params.surl=base+"/api/payu/callback"; params.furl=base+"/api/payu/callback"; params.curl=base+"/api/payu/callback";
  params.pg=""; params.enforce_paymethod=""; params.api_version="6";
  r.json({gateway:"PAYU",endpoint:process.env.PAYU_ENV==="test"?"https://test.payu.in/_payment":"https://secure.payu.in/_payment",params});
});

app.post("/api/payu/callback",(q,r)=>{
  const p=q.body||{}; 
  if(!process.env.PAYU_SALT)return r.status(503).send("Payment configuration missing");
  if(!p.hash||!p.txnid||!p.status||!safeEqual(p.hash,payuResponseHash(p,process.env.PAYU_SALT)))return r.status(400).send("Invalid PayU response");
  const accepted=markPayment(p.txnid,p);if(!accepted)return r.status(400).send("Payment details did not match a pending booking or order");
  const success=p.status==="success";
  r.status(200).send(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment ${success?"Successful":"Failed"}</title></head><body style="font-family:Arial;text-align:center;padding:60px;background:#fffaf0;color:#10243b"><h1>${success?"Payment successful":"Payment not completed"}</h1><p>Transaction: ${String(p.txnid).replace(/[<>]/g,"")}</p><p>You can close this page.</p><script>setTimeout(()=>location.href="/payment-result.html?status=${success?"success":"failed"}&txnid=${encodeURIComponent(p.txnid)}",1200)</script></body></html>`);
});

app.post("/api/payu/webhook",(q,r)=>{
  const p=q.body||{};
  if(!process.env.PAYU_SALT||!p.hash)return r.status(400).json({ok:false});
  if(!safeEqual(p.hash,payuResponseHash(p,process.env.PAYU_SALT)))return r.status(401).json({ok:false,error:"Invalid hash"});
  const accepted=markPayment(p.txnid,p);if(!accepted)return r.status(400).json({ok:false,error:"Transaction not found or amount mismatch"});r.json({ok:true});
});

app.post("/api/payment/verify",(q,r)=>{
  const {txnid,status,hash}=q.body||{};
  if(!txnid||!status||!hash||!process.env.PAYU_SALT)return r.status(400).json({verified:false});
  const payload={...q.body,txnid,status};
  const ok=safeEqual(hash,payuResponseHash(payload,process.env.PAYU_SALT));
  const accepted=ok&&markPayment(txnid,payload);
  r.status(accepted?200:400).json({verified:accepted});
});

// Vercel/Node serverless entrypoint: export the Express application.
// The local listener only runs when this file is executed directly.
app.use((err,req,res,next)=>{
  console.error("Unhandled request error",err);
  if(res.headersSent) return next(err);
  res.status(500).json({error:"Internal server error"});
});

module.exports=app;

if(require.main===module){
  const port=process.env.PORT||3000;
  app.listen(port,()=>console.log("Astrological Solutions running on http://localhost:"+port));
}
