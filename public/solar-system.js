(function () {
  "use strict";
  if (!window.THREE) {
    document.documentElement.classList.add("solar-fallback");
    const loader=document.getElementById("loader");
    if(loader){setTimeout(()=>loader.classList.add("solar-exit"),2400);setTimeout(()=>loader.remove(),3200);}
    return;
  }
  const THREE=window.THREE;
  const planetSpecs=[
    {name:"Mercury",radius:.16,orbit:1.35,size:.055,color:0xaaa7a2,speed:1.8},
    {name:"Venus",radius:.24,orbit:1.8,size:.09,color:0xd6b98c,speed:1.25},
    {name:"Earth",radius:.33,orbit:2.35,size:.105,color:0x4f8ecb,speed:1},
    {name:"Mars",radius:.44,orbit:2.9,size:.078,color:0xc36c4a,speed:.8},
    {name:"Jupiter",radius:.62,orbit:3.75,size:.21,color:0xc8a57c,speed:.48},
    {name:"Saturn",radius:.79,orbit:4.55,size:.18,color:0xd6c49d,speed:.36,ring:true},
    {name:"Uranus",radius:.96,orbit:5.25,size:.13,color:0x8ac8cc,speed:.25},
    {name:"Neptune",radius:1.1,orbit:5.9,size:.13,color:0x4779d0,speed:.19}
  ];
  const instances=[];
  function glowTexture(){
    const canvas=document.createElement("canvas");canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext("2d"),g=ctx.createRadialGradient(64,64,3,64,64,64);
    g.addColorStop(0,"rgba(255,246,218,1)");g.addColorStop(.16,"rgba(255,194,92,.7)");g.addColorStop(.42,"rgba(255,145,42,.18)");g.addColorStop(1,"rgba(255,145,42,0)");
    ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas);
  }
  function makeSystem(canvas,entry){
    if(!canvas)return;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,entry?1.6:1.8));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.25;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,100);
    camera.position.set(0,entry?2.5:2.15,entry?13.8:13.1);
    camera.lookAt(0,0,0);
    const system=new THREE.Group();system.rotation.x=-.22;system.rotation.z=-.06;scene.add(system);
    scene.add(new THREE.AmbientLight(0xffffff,.72));
    const sunLight=new THREE.PointLight(0xffdf9b,95,45,1.8);system.add(sunLight);
    const sunGeo=new THREE.SphereGeometry(.57,48,48);
    const sunMat=new THREE.MeshStandardMaterial({color:0xffc86d,emissive:0xff8d28,emissiveIntensity:2.2,roughness:.38,metalness:0});
    const sun=new THREE.Mesh(sunGeo,sunMat);system.add(sun);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    glow.scale.set(3.6,3.6,1);system.add(glow);
    const corona=new THREE.Mesh(new THREE.SphereGeometry(.67,40,40),new THREE.MeshBasicMaterial({color:0xffb34e,transparent:true,opacity:.12,side:THREE.BackSide}));
    system.add(corona);
    const starGeo=new THREE.BufferGeometry(),starPos=[];
    for(let i=0;i<650;i++){starPos.push((Math.random()-.5)*35,(Math.random()-.5)*24,(Math.random()-.5)*30);}
    starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starPos,3));
    const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:entry?0xe8e8e8:0x777777,size:.022,transparent:true,opacity:.72,sizeAttenuation:true}));
    scene.add(stars);
    const planets=[];
    for(const p of planetSpecs){
      const orbit=new THREE.Mesh(new THREE.RingGeometry(p.orbit-.004,p.orbit+.004,180),new THREE.MeshBasicMaterial({color:entry?0x777777:0x8e8e8e,side:THREE.DoubleSide,transparent:true,opacity:entry?.45:.3}));
      orbit.rotation.x=Math.PI/2;system.add(orbit);
      const pivot=new THREE.Group();system.add(pivot);
      const geo=new THREE.SphereGeometry(p.size,24,24);
      const mat=new THREE.MeshStandardMaterial({color:p.color,roughness:.78,metalness:.03});
      const mesh=new THREE.Mesh(geo,mat);mesh.position.set(p.orbit,0,0);mesh.rotation.z=.2;pivot.add(mesh);
      if(p.ring){
        const ring=new THREE.Mesh(new THREE.RingGeometry(p.size*1.35,p.size*2.1,48),new THREE.MeshStandardMaterial({color:0xcdbd9f,side:THREE.DoubleSide,transparent:true,opacity:.72,roughness:.8}));
        ring.rotation.x=Math.PI/2.45;mesh.add(ring);
      }
      if(p.name==="Earth"){
        const moonPivot=new THREE.Group();mesh.add(moonPivot);
        const moon=new THREE.Mesh(new THREE.SphereGeometry(.027,12,12),new THREE.MeshStandardMaterial({color:0xc9c9c9,roughness:1}));
        moon.position.x=.17;moonPivot.add(moon);p.moon=moonPivot;
      }
      planets.push({spec:p,pivot,mesh,orbit});
    }
    let width=0,height=0;
    function resize(){
      const rect=canvas.getBoundingClientRect();
      const w=Math.max(1,Math.floor(rect.width)),h=Math.max(1,Math.floor(rect.height));
      if(!w||!h)return;
      if(w===width&&h===height)return;width=w;height=h;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=entry?36:39;camera.position.z=entry?13.7:(w<600?14.4:12.8);camera.position.y=entry?2.4:2.15;camera.updateProjectionMatrix();
    }
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);resize();
    const clock=new THREE.Clock();
    function animate(){
      if(!canvas.isConnected){resizeObserver.disconnect();renderer.dispose();return;}
      const t=clock.getElapsedTime();resize();
      sun.rotation.y=t*.09;glow.material.rotation=t*.025;system.rotation.y=t*.045;stars.rotation.y=t*.0018;
      planets.forEach(({spec,pivot,mesh})=>{pivot.rotation.y=t*.075*spec.speed;mesh.rotation.y=t*.24;if(spec.moon)spec.moon.rotation.y=t*1.5;});
      renderer.render(scene,camera);requestAnimationFrame(animate);
    }
    animate();instances.push({renderer,scene,camera});
  }
  makeSystem(document.getElementById("entry-solar-canvas"),true);
  makeSystem(document.getElementById("hero-solar-canvas"),false);
  const loader=document.getElementById("loader"),skip=document.getElementById("skipIntro");
  function finish(){if(!loader)return;loader.classList.add("solar-exit");setTimeout(()=>loader.remove(),1000);}
  skip?.addEventListener("click",finish);
  window.setTimeout(finish,4800);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)return;instances.forEach(x=>x.renderer.render(x.scene,x.camera));});
})();