const titles={overview:"Overview",consultants:"Consultants",bookings:"Bookings",products:"Products",orders:"Orders",offers:"Offers",reviews:"Reviews",content:"Content & SEO"};function showTab(id,btn){document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.getElementById("pageTitle").textContent=titles[id]}function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}function openConsultant(name=""){document.getElementById("adminModal").innerHTML='<div class="modal" style="position:fixed;inset:0;background:#000b;z-index:99;display:grid;place-items:center"><div class="panel" style="width:min(520px,90vw);background:#101019"><button onclick="this.closest(\'.modal\').remove()" style="float:right;background:#222;color:#fff;border:0;border-radius:50%;width:30px;height:30px">×</button><small style="color:#8f7aff">CONSULTANT PROFILE</small><h2>'+ (name?"Edit "+name:"Add consultant") +'</h2><input placeholder="Full name" value="'+name+'" style="width:100%;padding:12px;margin:6px 0;background:#171621;border:1px solid #292737;color:white;border-radius:8px"><input placeholder="Specialization" value="Vedic Astrologer" style="width:100%;padding:12px;margin:6px 0;background:#171621;border:1px solid #292737;color:white;border-radius:8px"><input placeholder="Consultation price" value="899" style="width:100%;padding:12px;margin:6px 0;background:#171621;border:1px solid #292737;color:white;border-radius:8px"><button class="primary" onclick="this.closest(\'.modal\').remove();toast(\'Consultant saved\')" style="margin-top:10px">Save consultant</button></div></div>'}
async function adminApi(path){const res=await fetch(path);if(!res.ok)throw new Error("API error");return res.json()}
async function refreshAdminData(){
  try{
    const s=await adminApi("/api/admin/stats");
    const cards=document.querySelectorAll(".metrics > div");
    if(cards[0])cards[0].querySelector("b").textContent="₹"+Number(s.revenue).toLocaleString("en-IN");
    if(cards[1])cards[1].querySelector("b").textContent=s.consultations;
    if(cards[2])cards[2].querySelector("b").textContent=s.prepaidRate+"%";
    if(cards[3])cards[3].querySelector("b").textContent=s.conversion+"%";
  }catch(e){console.warn(e)}
}
refreshAdminData();
