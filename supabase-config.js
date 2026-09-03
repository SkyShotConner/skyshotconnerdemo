const SUPABASE_URL = "https://mlvbfdyahgszuwtgxmes.supabase.co";

const SUPABASE_KEY = "sb_publishable_l4ZBZi1Fxy_AwYVD2KDxiA_FnYNvp2z";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

(function () {
    function addConstructionBanner() {
        if (document.getElementById("siteConstructionBanner")) return;
        const banner = document.createElement("div");
        banner.id = "siteConstructionBanner";
        banner.innerHTML = `<strong>SKYSHOTCONNER WEBSITE UNDER CONSTRUCTION</strong><span>Some features and pages are still being developed.</span>`;
        const style = document.createElement("style");
        style.textContent = `#siteConstructionBanner{position:relative;z-index:2000;width:100%;padding:9px 16px;text-align:center;background:#0b1722;border-bottom:1px solid rgba(85,184,255,.35);color:#dcefff;font:600 10px/1.4 Inter,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase}#siteConstructionBanner strong{color:#55b8ff;margin-right:8px}#siteConstructionBanner span{color:#91a0ae}@media(max-width:600px){#siteConstructionBanner{font-size:8px;padding:8px 10px}#siteConstructionBanner strong{display:block;margin:0 0 2px}}`;
        document.head.appendChild(style);
        document.body.prepend(banner);
    }

    function addPreviousOperatorField() {
        const detailStats = document.querySelector(".detail-stats");
        const registrationElement = document.getElementById("detailRegistration");
        if (!detailStats || !registrationElement) return;
        const registration = registrationElement.textContent.trim();
        if (!registration) return;
        let stat = document.getElementById("detailPreviousOperator");
        if (!stat) {
            stat = document.createElement("div"); stat.className = "stat"; stat.id = "detailPreviousOperator";
            stat.innerHTML = `<div class="stat-label">Previous Operator</div><div class="stat-value" id="detailPreviousOperatorValue">—</div>`;
            detailStats.appendChild(stat);
        }
        const valueElement = document.getElementById("detailPreviousOperatorValue");
        if (!valueElement) return;
        valueElement.textContent = "Loading...";
        supabaseClient.from("aircraft").select("previous_operator").eq("registration", registration).maybeSingle().then(({ data, error }) => {
            if (error) { console.error("Error loading previous operator:", error); valueElement.textContent = "—"; return; }
            valueElement.textContent = data && data.previous_operator ? String(data.previous_operator).trim() : "—";
        });
    }

    function addGalleryRegistrationTotal() {
        if (!document.querySelector(".aircraft-grid") || document.getElementById("galleryRegistrationTotal")) return;
        const heading = document.querySelector(".section-title h2") || document.querySelector("h2"); if (!heading) return;
        const total = document.createElement("div"); total.id = "galleryRegistrationTotal"; total.textContent = "Total registrations: Loading…";
        total.style.cssText = "margin-top:12px;color:#91a0ae;font:700 11px/1.4 Inter,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase;";
        heading.insertAdjacentElement("afterend", total);
        supabaseClient.from("aircraft").select("id", { count: "exact", head: true }).then(({ count, error }) => { total.textContent = error ? "Total registrations: —" : `Total registrations: ${Number(count || 0)}`; });
    }

    async function renderDatabaseShop() {
        const locations = document.querySelector("#locations"); if (!locations || locations.dataset.shopDatabaseRendered === "true") return;
        const container = locations.querySelector(".container"); const grid = container && container.querySelector(".location-grid, .shop-card-grid"); if (!container || !grid) return;
        locations.dataset.shopDatabaseRendered = "true";
        const { data, error } = await supabaseClient.from("shop_products").select("id,name,description,image_url,product_url,price,active,sort_order").eq("active", true).order("sort_order", { ascending: true });
        if (error) { console.error("Error loading shop products:", error); return; }
        const products = Array.isArray(data) ? data : [];
        const heading = container.querySelector(".section-heading");
        if (heading) { const eyebrow=heading.querySelector(".eyebrow"),title=heading.querySelector("h2"),intro=heading.querySelector(".section-intro"); if(eyebrow)eyebrow.textContent="SHOP SKYSHOTCONNER";if(title)title.innerHTML=`Aviation <span>Prints</span>`;if(intro)intro.textContent="Choose a canvas size for a SkyShotConner aviation photograph."; }
        grid.className="shop-card-grid";
        grid.innerHTML=products.map((p,i)=>{const action=p.product_url?`<a class="btn btn-ghost" href="${escapeHtml(p.product_url)}" target="_blank" rel="noopener noreferrer">View Product →</a>`:`<a class="btn btn-ghost" href="shop.html">View Shop →</a>`;const image=p.image_url?`<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy">`:`<div style="height:100%;display:grid;place-items:center;color:#91a0ae;font-weight:800">SKYSHOTCONNER</div>`;return `<article class="shop-product-card"><div class="shop-product-image">${image}</div><div class="shop-product-body"><span>${String(i+1).padStart(2,"0")}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||"Aviation photography canvas print.")}</p><strong>${escapeHtml(p.price||"Price on request")}</strong>${action}</div></article>`}).join("")||`<p class="photo-note">Shop products are currently being prepared.</p>`;
        if(!document.getElementById("databaseShopStyles")){const style=document.createElement("style");style.id="databaseShopStyles";style.textContent=`.shop-card-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.shop-product-card{overflow:hidden;background:#0d1219;border:1px solid rgba(255,255,255,.1)}.shop-product-image{aspect-ratio:16/9;background:#080d13;overflow:hidden}.shop-product-image img{width:100%;height:100%;object-fit:contain}.shop-product-body{padding:18px}.shop-product-body>span{color:#55b8ff;font-size:10px;font-weight:800;letter-spacing:1.5px}.shop-product-body h3{margin:7px 0;font-family:Montserrat,Arial,sans-serif;font-size:17px;text-transform:uppercase}.shop-product-body p{color:#98a4b2;font-size:12px;min-height:38px}.shop-product-body strong{display:block;margin:12px 0;font-size:18px}.shop-product-body .btn{margin-top:4px}@media(max-width:900px){.shop-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.shop-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.shop-product-body{padding:12px}.shop-product-body h3{font-size:13px}.shop-product-body p{font-size:10px;min-height:0}.shop-product-body strong{font-size:14px}}`;document.head.appendChild(style)}
    }

    function escapeHtml(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");}

    /* Phoenix admin tools: internet-backed aircraft lookup, Postimages upload and draft cards. */
    const isAdminPage=()=>location.pathname.toLowerCase().endsWith("admin.html")||document.title.toLowerCase().includes("admin control centre");
    const POSTIMG_KEY="skyshotconner_postimg_key";
    let phoenixResearch=null;
    function addPhoenixTools(){
        if(!isAdminPage()||document.getElementById("phoenixTools"))return;
        const box=document.createElement("div");box.id="phoenixTools";box.innerHTML=`<div class="pt-head"><div><b>✦ Phoenix Tools</b><small>Internet research • Postimages • Draft cards</small></div><button id="ptClose">×</button></div><div class="pt-body"><label>Aircraft research</label><div class="pt-row"><input id="ptReg" placeholder="Registration e.g. ZS-SJO"><button id="ptResearch">Research</button></div><div id="ptResult" class="pt-result">Ready.</div><div class="pt-actions"><button id="ptFill" disabled>Fill Aircraft Form</button><button id="ptSave" disabled>Save Info Card</button></div><hr><label>Postimages</label><input id="ptKey" type="password" placeholder="Postimages API key"><input id="ptFile" type="file" accept="image/*"><button id="ptUpload">Upload Image & Get URL</button><div id="ptUploadResult" class="pt-result">No image uploaded.</div><p class="pt-note">The Postimages key is stored only in this browser. Phoenix never posts cards automatically.</p></div>`;
        document.body.appendChild(box);const style=document.createElement("style");style.id="phoenixToolsStyle";style.textContent=`#phoenixTools{position:fixed;z-index:95;right:20px;top:90px;width:min(430px,calc(100vw - 30px));display:none;background:rgba(9,15,22,.98);border:1px solid rgba(85,184,255,.25);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.45);color:#f5f9fd;font:14px Inter,Arial,sans-serif}#phoenixTools.open{display:block}.pt-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.09)}.pt-head b{display:block}.pt-head small{display:block;color:#91a0ae;font-size:10px;margin-top:3px}.pt-head button{border:0;background:none;color:#91a0ae;font-size:22px;cursor:pointer}.pt-body{padding:15px}.pt-body label{display:block;color:#91a0ae;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:900;margin:7px 0}.pt-row{display:grid;grid-template-columns:1fr auto;gap:8px}.pt-body input{width:100%;padding:10px;background:#080e14;color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:9px;margin:5px 0}.pt-body button{padding:10px 12px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:#172431;color:#fff;font-weight:800;cursor:pointer}.pt-row button,#ptUpload{background:#55b8ff;color:#06111a;border-color:#55b8ff}.pt-result{margin-top:8px;padding:10px;background:#080e14;border:1px solid rgba(255,255,255,.08);border-radius:9px;white-space:pre-wrap;line-height:1.4;max-height:190px;overflow:auto}.pt-actions{display:flex;gap:8px;margin-top:8px}.pt-actions button{flex:1}.pt-note{color:#91a0ae;font-size:10px;line-height:1.4}@media(max-width:600px){#phoenixTools{right:10px;top:72px;width:calc(100vw - 20px);max-height:calc(100dvh - 90px);overflow:auto}.pt-row{grid-template-columns:1fr}.pt-actions{flex-direction:column}}`;document.head.appendChild(style);
        ptKey.value=localStorage.getItem(POSTIMG_KEY)||"";
        document.addEventListener("click",e=>{if(e.target.closest("#openPhoenixTools"))box.classList.add("open");if(e.target.id==="ptClose")box.classList.remove("open");});
        const trigger=document.createElement("button");trigger.id="openPhoenixTools";trigger.textContent="✦";trigger.title="Phoenix Tools";trigger.style.cssText="position:fixed;z-index:94;right:22px;bottom:92px;width:48px;height:48px;border-radius:50%;border:1px solid rgba(85,184,255,.35);background:#55b8ff;color:#06111a;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.4)";document.body.appendChild(trigger);
        ptResearch.onclick=async()=>{const r=ptReg.value.trim();if(!r){ptResult.textContent="Enter a registration.";return}ptResult.textContent="Phoenix is researching "+r.toUpperCase()+"…";const data=await research(r);if(data){phoenixResearch=data;const a=data.aircraft||{};ptResult.textContent=`Registration: ${data.registration}\nManufacturer: ${a.manufacturer||"—"}\nModel: ${a.model||"—"}\nAircraft type: ${a.aircraft_type||"—"}\nMSN: ${a.msn||"—"}\nOperator: ${a.operator||"—"}\nStatus: ${a.status||"—"}\n\nSources: Planespotters ${data.source?.planespotters?"✓":"—"} • ADSB One ${data.source?.adsbOne?"✓":"—"}`;ptFill.disabled=false;ptSave.disabled=false}};
        ptFill.onclick=()=>fillAircraftForm(phoenixResearch);ptSave.onclick=()=>saveDraft(phoenixResearch);
        ptKey.onchange=()=>localStorage.setItem(POSTIMG_KEY,ptKey.value.trim());
        ptUpload.onclick=async()=>{const file=ptFile.files?.[0];if(!file){ptUploadResult.textContent="Choose an image first.";return}const key=ptKey.value.trim()||localStorage.getItem(POSTIMG_KEY)||"";if(!key){ptUploadResult.textContent="Enter your Postimages API key first.";return}localStorage.setItem(POSTIMG_KEY,key);ptUploadResult.textContent="Uploading…";try{const fd=new FormData();fd.append("source",file);fd.append("format","json");const res=await fetch("https://postimg.pro/api/1/upload",{method:"POST",headers:{"X-API-Key":key},body:fd});const data=await res.json();if(!res.ok||data.status_code&&data.status_code!==200)throw new Error(data.status_txt||"Upload failed");const url=data.url||data.image?.url||data.link||data.display_url;if(!url)throw new Error("Postimages returned no image URL.");ptUploadResult.textContent=url;navigator.clipboard?.writeText(url).catch(()=>{});setTimeout(()=>{const field=document.querySelector("#form input[name='image_url']");if(field)field.value=url},100)}catch(err){ptUploadResult.textContent="Upload failed: "+err.message}};
        async function research(reg){try{const{data:{session}}=await supabaseClient.auth.getSession();if(!session)throw new Error("Admin session expired.");const res=await fetch(`${SUPABASE_URL}/functions/v1/phoenix-research`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY},body:JSON.stringify({registration:reg})});const data=await res.json();if(!res.ok||data.error)throw new Error(data.error||"Research failed");return data}catch(e){ptResult.textContent="Research failed: "+e.message;return null}}
        function fillAircraftForm(data){if(!data?.aircraft)return;const a=data.aircraft;const map={registration:data.registration,...a};Object.entries(map).forEach(([k,v])=>{const el=document.querySelector(`#form [name='${k}']`);if(el&&v)el.value=v});const reg=document.querySelector("#form [name='registration']");if(reg&&!reg.value)reg.value=data.registration;ptResult.textContent+="\n\n✓ Aircraft form filled. Review before saving."}
        async function saveDraft(data){if(!data)return;const content=JSON.stringify({registration:data.registration,...data.aircraft},null,2);const{error}=await supabaseClient.from("phoenix_drafts").insert({kind:"aircraft",title:`${data.registration} aircraft info card`,content,metadata:data,status:"draft"});if(error)ptResult.textContent+="\n\nDraft save failed: "+error.message;else{ptResult.textContent+="\n\n✓ Info card saved as DRAFT. Nothing was posted.";}}
        const observer=new MutationObserver(()=>{const m=document.getElementById("modal");if(!m||getComputedStyle(m).display==="none")return;const price=document.querySelector("#form [name='price']");if(price&&!price.value)price.value="R349";const reg=document.querySelector("#form [name='registration']");if(reg&&!document.getElementById("phoenixFormButton")){const b=document.createElement("button");b.type="button";b.id="phoenixFormButton";b.className="btn primary";b.textContent="✦ Phoenix Research";b.onclick=()=>{if(reg.value){ptReg.value=reg.value;document.getElementById("openPhoenixTools").click();ptResearch.click()}else{document.getElementById("openPhoenixTools").click();ptReg.focus()}};m.querySelector(".actions")?.before(b)}});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["style","class"]});
    }

    function initialise(){addGalleryRegistrationTotal();const detail=document.getElementById("aircraftDetail");if(detail){const observer=new MutationObserver(()=>{if(detail.classList.contains("active"))addPreviousOperatorField()});observer.observe(detail,{attributes:true,childList:true,subtree:true,attributeFilter:["class"]})}const locations=document.getElementById("locations");if(locations){const observer=new MutationObserver(()=>renderDatabaseShop());observer.observe(locations,{childList:true,subtree:true});setTimeout(renderDatabaseShop,100)}setTimeout(addPhoenixTools,300)}
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialise);else initialise();
})();