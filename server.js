const express=require("express"),cors=require("cors"),path=require("path"),helmet=require("helmet"),rateLimit=require("express-rate-limit"),{z}=require("zod");
const app=express();
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:process.env.CORS_ORIGIN||true}));
app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({extended:true,limit:"1mb"}));
app.use(rateLimit({windowMs:60*1000,max:120,standardHeaders:true,legacyHeaders:false}));
app.use(express.static(__dirname));

const consultants=[
{id:"c1",name:"Ananya Sharma",type:"Vedic Astrologer",experience:"18 years",rating:4.9,price:899,available:true,bio:"Vedic astrology focused on relationships, career and life timing."},
{id:"c2",name:"Raghav Mehta",type:"Numerologist",experience:"12 years",rating:4.8,price:699,available:true,bio:"Numerology guidance for names, business decisions and personal cycles."},
{id:"c3",name:"Meera Kapoor",type:"Vastu Consultant",experience:"15 years",rating:4.9,price:999,available:true,bio:"Practical vastu consultations for homes, offices and commercial spaces."}];
const products=[
{id:"p1",name:"1 Mukhi Rudraksh",slug:"1-mukhi-rudraksh",price:2344.99,compareAt:null,category:"Rudraksha",stock:20},
{id:"p2",name:"5 Mukhi Rudraksh | Panch Mukhi Rudraksha",slug:"5-mukhi-rudraksh",price:699,compareAt:1199,category:"Rudraksha",stock:40},
{id:"p3",name:"Sudarshan Shaligram",slug:"sudarshan-shaligram",price:400,compareAt:null,category:"Shaligram",stock:25},
{id:"p4",name:"Jupiter Necklace",slug:"jupiter-necklace",price:2000,compareAt:null,category:"Gemstones",stock:15},
{id:"p5",name:"necklaces",slug:"necklaces",price:299,compareAt:null,category:"Gemstones",stock:35},
{id:"p6",name:"crystal pyramid",slug:"crystal-pyramid",price:799,compareAt:null,category:"Crystals",stock:30},
{id:"p7",name:"vnexxx",slug:"vnexxx",price:2345,compareAt:null,category:"Vastu Products",stock:12},
{id:"p8",name:"crystal vastu remedies",slug:"crystal-vastu-remedies",price:344,compareAt:null,category:"Vastu Products",stock:30},
{id:"p9",name:"solid perfumes",slug:"solid-perfumes",price:322,compareAt:null,category:"Perfumes",stock:30},
{id:"p10",name:"Fragrance for Men",slug:"fragrance-for-men",price:569,compareAt:null,category:"Perfumes",stock:25},
{id:"p11",name:"Shankh & Sea Shells",slug:"shankh-sea-shells",price:1299,compareAt:null,category:"Shankh Sea Shells",stock:20},
{id:"p12",name:"Diyas",slug:"diyas",price:499,compareAt:null,category:"Pooja",stock:40}];
let bookings=[],orders=[];
let offers=[{id:"o1",code:"PREPAID100",title:"₹100 off on prepaid",type:"FIXED",value:100,active:true},{id:"o2",code:"FIRSTCONSULT",title:"10% off first consultation",type:"PERCENT",value:10,active:true}];
let siteContent={heroTitle:"Clarity for the chapters ahead.",heroSubtitle:"Connect with trusted astrologers, numerologists and vastu experts through a consultation experience designed around you.",announcement:"Pay online & save ₹100 on eligible orders.",seoTitle:"Astrological Solutions — Astrology, Numerology & Vastu Consultations",seoDescription:"Book trusted astrology, numerology and vastu consultations online."};

const bookingSchema=z.object({customerName:z.string().min(2).max(100),customerPhone:z.string().min(10).max(15),customerEmail:z.string().email().optional().or(z.literal("")),concern:z.string().min(2).max(100),consultantId:z.string(),slot:z.string(),amount:z.number().int().positive()});
const orderSchema=z.object({customerName:z.string().min(2),phone:z.string().min(10).max(15),email:z.string().email().optional().or(z.literal("")),address:z.record(z.any()),items:z.array(z.object({productId:z.string(),quantity:z.number().int().positive()})).min(1),fulfillment:z.enum(["PREPAID","COD"]),couponCode:z.string().optional()});

app.get("/api/health",(q,r)=>r.json({ok:true,service:"Astrological Solutions",mode:process.env.DATABASE_URL?"database-enabled":"demo",payment:process.env.PAYU_KEY?"payu-configured":"not-configured"}));
app.get("/api/consultants",(q,r)=>r.json(consultants.filter(x=>x.available)));
app.get("/api/consultants/:id",(q,r)=>{const x=consultants.find(x=>x.id===q.params.id);x?r.json(x):r.status(404).json({error:"Not found"})});
app.get("/api/products",(q,r)=>r.json(products.filter(x=>x.stock>0)));
app.get("/api/products/:id",(q,r)=>{const x=products.find(x=>x.id===q.params.id);x?r.json(x):r.status(404).json({error:"Not found"})});
app.get("/api/slots",(q,r)=>r.json(["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"]));

app.post("/api/bookings",(q,r)=>{const parsed=bookingSchema.safeParse(q.body);if(!parsed.success)return r.status(400).json({error:"Invalid booking data",details:parsed.error.flatten()});const c=consultants.find(x=>x.id===parsed.data.consultantId);if(!c)return r.status(404).json({error:"Consultant not found"});const b={id:"AS-"+(10000+bookings.length+1),...parsed.data,status:"PENDING_PAYMENT",paymentStatus:"PENDING",createdAt:new Date().toISOString()};bookings.push(b);r.status(201).json(b)});

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
  markPayment(p.txnid,p);
  const success=p.status==="success";
  r.status(200).send(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment ${success?"Successful":"Failed"}</title></head><body style="font-family:Arial;text-align:center;padding:60px;background:#fffaf0;color:#10243b"><h1>${success?"Payment successful":"Payment not completed"}</h1><p>Transaction: ${String(p.txnid).replace(/[<>]/g,"")}</p><p>You can close this page.</p><script>setTimeout(()=>location.href="/payment-result.html?status=${success?"success":"failed"}&txnid=${encodeURIComponent(p.txnid)}",1200)</script></body></html>`);
});

app.post("/api/payu/webhook",(q,r)=>{
  const p=q.body||{};
  if(!process.env.PAYU_SALT||!p.hash)return r.status(400).json({ok:false});
  if(!safeEqual(p.hash,payuResponseHash(p,process.env.PAYU_SALT)))return r.status(401).json({ok:false,error:"Invalid hash"});
  markPayment(p.txnid,p); r.json({ok:true});
});

app.post("/api/payment/verify",(q,r)=>{
  const {txnid,status,hash}=q.body||{};
  if(!txnid||!status||!hash||!process.env.PAYU_SALT)return r.status(400).json({verified:false});
  const payload={...q.body,txnid,status};
  const ok=safeEqual(hash,payuResponseHash(payload,process.env.PAYU_SALT));
  if(ok)markPayment(txnid,payload);
  r.status(ok?200:400).json({verified:ok});
});
