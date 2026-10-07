const express=require("express"),cors=require("cors"),path=require("path"),helmet=require("helmet"),rateLimit=require("express-rate-limit"),{z}=require("zod");
const app=express();
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:process.env.CORS_ORIGIN||true}));
app.use(express.json({limit:"1mb"}));
app.use(rateLimit({windowMs:60*1000,max:120,standardHeaders:true,legacyHeaders:false}));
app.use(express.static(__dirname));

const consultants=[
{id:"c1",name:"Ananya Sharma",type:"Vedic Astrologer",experience:"18 years",rating:4.9,price:899,available:true,bio:"Vedic astrology focused on relationships, career and life timing."},
{id:"c2",name:"Raghav Mehta",type:"Numerologist",experience:"12 years",rating:4.8,price:699,available:true,bio:"Numerology guidance for names, business decisions and personal cycles."},
{id:"c3",name:"Meera Kapoor",type:"Vastu Consultant",experience:"15 years",rating:4.9,price:999,available:true,bio:"Practical vastu consultations for homes, offices and commercial spaces."}];
const products=[
{id:"p1",name:"Natural Amethyst Crystal",slug:"natural-amethyst-crystal",price:1499,compareAt:1699,category:"Wellness & Meditation",stock:24},
{id:"p2",name:"Brass Shree Yantra",slug:"brass-shree-yantra",price:2499,compareAt:2999,category:"Puja & Prosperity",stock:12},
{id:"p3",name:"Seven Chakra Bracelet",slug:"seven-chakra-bracelet",price:899,compareAt:1099,category:"Energy & Balance",stock:41},
{id:"p4",name:"Vastu Pyramid Set",slug:"vastu-pyramid-set",price:1999,compareAt:2399,category:"Home & Vastu",stock:18}];
let bookings=[],orders=[];

const bookingSchema=z.object({customerName:z.string().min(2).max(100),customerPhone:z.string().min(10).max(15),customerEmail:z.string().email().optional().or(z.literal("")),concern:z.string().min(2).max(100),consultantId:z.string(),slot:z.string(),amount:z.number().int().positive()});
const orderSchema=z.object({customerName:z.string().min(2),phone:z.string().min(10).max(15),email:z.string().email().optional().or(z.literal("")),address:z.record(z.any()),items:z.array(z.object({productId:z.string(),quantity:z.number().int().positive()})).min(1),fulfillment:z.enum(["PREPAID","COD"]),couponCode:z.string().optional()});

app.get("/api/health",(q,r)=>r.json({ok:true,service:"Astrological Solutions",mode:process.env.DATABASE_URL?"production-ready":"demo"}));
app.get("/api/consultants",(q,r)=>r.json(consultants.filter(x=>x.available)));
app.get("/api/consultants/:id",(q,r)=>{const x=consultants.find(x=>x.id===q.params.id);x?r.json(x):r.status(404).json({error:"Not found"})});
app.get("/api/products",(q,r)=>r.json(products.filter(x=>x.stock>0)));
app.get("/api/products/:id",(q,r)=>{const x=products.find(x=>x.id===q.params.id);x?r.json(x):r.status(404).json({error:"Not found"})});
app.get("/api/slots",(q,r)=>r.json(["10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:30 PM","8:00 PM"]));

app.post("/api/bookings",(q,r)=>{const parsed=bookingSchema.safeParse(q.body);if(!parsed.success)return r.status(400).json({error:"Invalid booking data",details:parsed.error.flatten()});const c=consultants.find(x=>x.id===parsed.data.consultantId);if(!c)return r.status(404).json({error:"Consultant not found"});const b={id:"AS-"+(10000+bookings.length+1),...parsed.data,status:"PENDING_PAYMENT",paymentStatus:"PENDING",createdAt:new Date().toISOString()};bookings.push(b);r.status(201).json(b)});

app.post("/api/payment/create",async(q,r)=>{const amount=Number(q.body.amount||0);if(!amount)return r.status(400).json({error:"Amount required"});if(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET){try{const Razorpay=require("razorpay");const rz=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});const order=await rz.orders.create({amount:Math.round(amount*100),currency:"INR",receipt:"AS-"+Date.now()});return r.json({gateway:"RAZORPAY",keyId:process.env.RAZORPAY_KEY_ID,orderId:order.id,amount:order.amount,currency:order.currency,status:"created"});}catch(e){return r.status(502).json({error:"Payment gateway unavailable"})}}r.json({gateway:"DEMO",orderId:"demo_"+Date.now(),amount,status:"created",message:"Demo mode. Set Razorpay server environment variables for live/test gateway."})});

app.post("/api/orders",(q,r)=>{const parsed=orderSchema.safeParse(q.body);if(!parsed.success)return r.status(400).json({error:"Invalid order data",details:parsed.error.flatten()});const subtotal=parsed.data.items.reduce((s,i)=>{const p=products.find(x=>x.id===i.productId);return s+(p?p.price*i.quantity:0)},0);const discount=parsed.data.fulfillment==="PREPAID"?100:0;const o={id:"ASO-"+(9000+orders.length+1),...parsed.data,subtotal,discount,total:Math.max(0,subtotal-discount),status:parsed.data.fulfillment==="COD"?"CONFIRMATION_PENDING":"PAYMENT_PENDING",paymentStatus:"PENDING",createdAt:new Date().toISOString()};orders.push(o);r.status(201).json(o)});

app.post("/api/payment/verify",(q,r)=>{if(!process.env.RAZORPAY_KEY_SECRET)return r.json({verified:false,mode:"demo",message:"Configure Razorpay secret and signature verification in production."});const crypto=require("crypto");const {orderId,paymentId,signature}=q.body;const expected=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(orderId+"|"+paymentId).digest("hex");if(signature!==expected)return r.status(400).json({verified:false,error:"Invalid payment signature"});r.json({verified:true})});

app.get("/api/admin/stats",(q,r)=>r.json({revenue:284650,consultations:186,prepaidRate:72.8,conversion:4.82,bookings:bookings.length,orders:orders.length}));
app.get("/api/admin/bookings",(q,r)=>r.json(bookings));
app.get("/api/admin/orders",(q,r)=>r.json(orders));
app.get("*",(q,r)=>r.sendFile(path.join(__dirname,"index.html")));
app.listen(process.env.PORT||3000,()=>console.log("Astrological Solutions running on http://localhost:"+(process.env.PORT||3000)));
