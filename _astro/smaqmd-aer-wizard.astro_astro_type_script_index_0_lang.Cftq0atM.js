import{i as ln,a as oe}from"./announcer.CjDH29W_.js";import"./esa-radio-group.Dv82n_W1.js";import"./esa-button-toggle.BsaIktF8.js";import{i as dn,A as un,b as Ne,t as hn,a as fn,c as mn}from"./a11y.dx8jdvWt.js";const pn=new Set(["false","0","off","no"]),yn={fromAttribute:U=>U!==null&&!pn.has(U.trim().toLowerCase()),toAttribute:U=>U?"":null},gn={xs:"label-2xs",sm:"label-xs",md:"label-md",lg:"label-lg"},xn={xs:"microcopy-2xs",sm:"microcopy-xs",md:"microcopy-md",lg:"microcopy-lg"};class bn extends dn{constructor(){super(),this.onInput=nt=>{const Q=Number(nt.target.value);this.value=Q,this.internals.setFormValue(String(Q)),this.dispatchEvent(new CustomEvent("change",{detail:{value:Q},bubbles:!0,composed:!0}))},this.min=0,this.max=100,this.step=1,this.size="md",this.label="",this.showValue=!0,this.disabled=!1,this.value=0,this.internals=this.attachInternals()}static{this.formAssociated=!0}static{this.properties={min:{type:Number},max:{type:Number},step:{type:Number},size:{type:String,reflect:!0},label:{type:String},showValue:{type:Boolean,attribute:"show-value",converter:yn},disabled:{type:Boolean,reflect:!0},name:{type:String,reflect:!0},value:{type:Number}}}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(String(this.value))}willUpdate(nt){nt.has("value")&&this.internals.setFormValue(String(this.value))}get fillPercent(){return this.max===this.min?0:(this.value-this.min)/(this.max-this.min)*100}render(){return Ne`
      ${this.label?Ne`<label for="input" class="label typography-${gn[this.size]}"
            >${this.label}</label
          >`:null}
      <div class="row">
        <div class="track-wrapper">
          <input
            id="input"
            type="range"
            class="input"
            min=${this.min}
            max=${this.max}
            step=${this.step}
            .value=${String(this.value)}
            ?disabled=${this.disabled}
            style="--_fill-percent: ${this.fillPercent}%"
            aria-label=${this.label?un:"Range slider"}
            aria-valuemin=${this.min}
            aria-valuemax=${this.max}
            aria-valuenow=${this.value}
            @input=${this.onInput}
          />
        </div>
        ${this.showValue?Ne`<span class="value typography-${xn[this.size]}">${this.value}</span>`:null}
      </div>
    `}static{this.styles=[hn,fn,mn`
    :host {
      display: block;
      --_track-height: 6px;
      --_thumb-size: 20px;
    }
    :host([size='xs']) {
      --_track-height: 3px;
      --_thumb-size: 14px;
    }
    :host([size='sm']) {
      --_track-height: 4px;
      --_thumb-size: 16px;
    }
    :host([size='lg']) {
      --_track-height: 8px;
      --_thumb-size: 24px;
    }

    .label {
      display: block;
      margin-bottom: var(--spacing-100, 4px);
      color: var(--color-content-default, #202020);
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--spacing-300, 12px);
    }
    .track-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .input {
      width: 100%;
      height: var(--_thumb-size);
      margin: 0;
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      cursor: pointer;
    }
    .input::-webkit-slider-runnable-track {
      height: var(--_track-height);
      border-radius: calc(var(--_track-height) / 2);
      background: linear-gradient(
        to right,
        var(--color-background-brand, #46a758) 0%,
        var(--color-background-brand, #46a758) var(--_fill-percent, 0%),
        var(--color-border-default, #cecece) var(--_fill-percent, 0%),
        var(--color-border-default, #cecece) 100%
      );
    }
    .input::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: var(--_thumb-size);
      height: var(--_thumb-size);
      margin-top: calc((var(--_track-height) - var(--_thumb-size)) / 2);
      border: 2px solid var(--color-background-brand, #46a758);
      border-radius: 50%;
      background: var(--color-background-elevation-raised, #fcfcfc);
      box-shadow: var(--elevation-1, 0 1px 3px rgba(0, 0, 0, 0.12));
      transition:
        box-shadow var(--transition-fast, 150ms ease),
        transform var(--transition-fast, 150ms ease);
    }
    .input::-moz-range-track {
      height: var(--_track-height);
      border-radius: calc(var(--_track-height) / 2);
      background: var(--color-border-default, #cecece);
    }
    .input::-moz-range-progress {
      height: var(--_track-height);
      border-radius: calc(var(--_track-height) / 2);
      background: var(--color-background-brand, #46a758);
    }
    .input::-moz-range-thumb {
      width: var(--_thumb-size);
      height: var(--_thumb-size);
      border: 2px solid var(--color-background-brand, #46a758);
      border-radius: 50%;
      background: var(--color-background-elevation-raised, #fcfcfc);
      box-shadow: var(--elevation-1, 0 1px 3px rgba(0, 0, 0, 0.12));
    }
    .input:focus-visible {
      outline: none;
    }
    .input:focus-visible::-webkit-slider-thumb {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #3e9b4f);
      outline-offset: var(--focus-ring-offset, 2px);
    }
    .input:focus-visible::-moz-range-thumb {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #3e9b4f);
      outline-offset: var(--focus-ring-offset, 2px);
    }
    .input:hover:not(:disabled)::-webkit-slider-thumb {
      transform: scale(1.1);
    }
    .input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .value {
      min-width: 3ch;
      text-align: right;
      color: var(--color-content-default, #202020);
      font-variant-numeric: tabular-nums;
    }

    /* FORCED COLORS. This is the kit's ONLY gradient, and it is the value fill —
       non-url() background-image is forced to 'none', so the slider would read as
       empty at every position. The thumb survives on its own (real 2px border).

       The track opts OUT and re-states the fill in system colours, rather than
       simply opting out and keeping the brand green. A plain opt-out would keep
       author colours the user has explicitly asked not to see, and green-on-black
       is exactly the contrast a theme may have been chosen to avoid. Highlight
       and Canvas are the user's own values, so the fill stays legible in a theme
       we cannot predict.

       Gecko splits the same job across two pseudo-elements (-moz-range-track is
       the trough, -moz-range-progress the fill), so it needs no gradient at all.

       The 'forced-color-adjust: none' on a UA pseudo-element is the part of this
       file to re-check in a real contrast theme. If it does not take, the fill is
       lost but the component still reports its value: showValue defaults to true
       and .value is real text. That fallback is why this is safe to ship. */
    @media (forced-colors: active) {
      .input::-webkit-slider-runnable-track {
        forced-color-adjust: none;
        border: 1px solid CanvasText;
        background: linear-gradient(
          to right,
          Highlight 0%,
          Highlight var(--_fill-percent, 0%),
          Canvas var(--_fill-percent, 0%),
          Canvas 100%
        );
      }
      .input::-moz-range-track {
        forced-color-adjust: none;
        border: 1px solid CanvasText;
        background: Canvas;
      }
      .input::-moz-range-progress {
        forced-color-adjust: none;
        background: Highlight;
      }
      .input:disabled::-webkit-slider-runnable-track,
      .input:disabled::-moz-range-track { border-color: GrayText; }
    }
  `]}}customElements.get("esa-range-slider")||customElements.define("esa-range-slider",bn);ln();const h=document.querySelector("[data-aerb-wizard]");if(h){const U=window.matchMedia("(max-width: 68rem)");{const t=h.querySelector(".smaqmd-aerb__header"),e=h.querySelector(".smaqmd-aerw__col"),a=()=>{t&&(U.matches?h.firstElementChild!==t&&h.prepend(t):e&&e.firstElementChild!==t&&e.prepend(t))};a(),U.addEventListener("change",a)}const nt=t=>Array.from(h.querySelectorAll(t)),Q=(t,e)=>{const a=e!=null?`[data-field="${t}"][data-cleaner="${e}"]`:`[data-field="${t}"]:not([data-cleaner])`;return h.querySelector(a)},C=(t,e)=>{const a=Q(t,e);return(a&&a.value!=null?String(a.value):"").trim()},V=(t,e)=>{const a=parseFloat(C(t,e));return Number.isFinite(a)?a:NaN},P=(t,e)=>{const a=V(t,e);return Number.isFinite(a)&&a>0?a:NaN},S=(t,e=0)=>t.toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:0}),re=Math.cos(Math.PI/6),ie=.5,ce=(t,e,a)=>[(t-e)*re,(t+e)*ie-a],Fe=h.querySelector(".smaqmd-cityview__svg"),ze=h.querySelector("[data-cityview]"),A=Fe??document.createElementNS("http://www.w3.org/2000/svg","svg"),H=ze??document.createElement("div");let Re=1,Yt=480,Gt=380,j={x:52,y:52,w:376,h:276};const xa=12,Te=60,ba=20,at={L:1,W:1,H:1},va=2.6,wa=1.4,Ie=22,le=3.8,Le=h.querySelector("[data-safe]"),Oe=Le??document.createElement("div"),St=!!(Fe&&ze&&Le),pt=h.querySelector("[data-pulse-toggle]");let st=null;const De=A.querySelector('[data-cap="top"]'),de=De&&parseFloat(getComputedStyle(De).strokeWidth)||0,ue=h.dataset.variant==="responsive";let Ft=St&&!(ue&&U.matches);const he=()=>{if(!Ft)return;Yt=H.clientWidth,Gt=H.clientHeight,A.setAttribute("viewBox",`0 0 ${Yt} ${Gt}`);const t=Oe.getBoundingClientRect(),e=H.getBoundingClientRect();j={x:t.left-e.left,y:t.top-e.top,w:t.width,h:t.height};const a=pt?.getBoundingClientRect();st=a&&a.width?{x:a.left-e.left,y:a.top-e.top,w:a.width,h:a.height}:null,pe(M.L,M.W,M.H)};St&&new ResizeObserver(he).observe(Oe);const Ht=[],Pe=3,Be=28;let yt=1;const B=4,fe=[];for(let t=0;St&&t<B;t++)fe[t]=Array.from(A.querySelectorAll(`.smaqmd-cityview__rings[data-rings="${t+1}"] .smaqmd-cityview__ring`));const me=t=>t.map(e=>`${e[0].toFixed(1)},${e[1].toFixed(1)}`).join(" "),N=(t,e)=>{const a=A.querySelector(t);a&&a.setAttribute("points",me(e))},Vt=(t,e,a)=>{const s=A.querySelector(`[data-label="${t}"]`);s&&(s.setAttribute("x",e[0].toFixed(1)),s.setAttribute("y",e[1].toFixed(1)),s.textContent=a)},Xt=(t,e)=>[(t[0]+e[0])/2,(t[1]+e[1])/2],Ye=A.querySelector("[data-room-details]"),Ge=A.querySelector("[data-furniture]"),zt=(t,e,a)=>{const s=A.querySelector(t);s&&(s.style.visibility=e?"":"hidden",e&&a&&s.setAttribute("points",me(a)))},He=(t,e,a,s)=>{const i=Math.min(Math.max(Math.min(t,e)*.16,wa),va);let r=Math.min(s??i,e*.55,3.2);a>=3&&(r=Math.min(r,e*.28>=2?e*.28:e*.35-.5)),a>=2&&(r=Math.min(r,(t-2.4)/2)),r=Math.max(r,.2);const l=r*1.5,c=Math.max(1,r*.5),u=r/2+c/2,x=a>=3,f=a>=4,z=[];for(let _=0;_<a;_++){const T=_%2===0?"front":"back",E=(T==="front"?x:f)?e/2+(_<2?-u:u):e/2,I=T==="front"?t-1.2-r:.6;z.push({x0:I,y0:E-r/2,x1:I+r,y1:E+r/2,h:l,side:T})}return z},Sa=t=>{const e=t.filter(s=>s.side==="back");if(!e.length)return null;const a=.6;return{x0:0,x1:Math.max(...e.map(s=>s.x1))+a,y0:Math.min(...e.map(s=>s.y0))-a,y1:Math.max(...e.map(s=>s.y1))+a}},Ma=2,Ve=3,Ut=[{fx:.12,fy:.06,sx:3.6,sy:1.5,h:2.7,minArea:90,snap:"y"},{fx:.05,fy:.28,sx:1.1,sy:3.2,h:5.6,minArea:0,snap:"x"},{fx:.42,fy:.06,sx:6.4,sy:5,h:1.7,minArea:0,snap:"y"},{fx:.72,fy:.06,sx:3.2,sy:1.6,h:2.5,minArea:260,snap:"y"},{fx:.05,fy:.74,sx:1.4,sy:1.4,h:2.1,minArea:140,snap:"x"},{fx:.1,fy:.9,sx:1.1,sy:1.1,h:3,minArea:220},{fx:.7,fy:.86,sx:1.9,sy:1.9,h:2.4,minArea:320}],ka=[2,0,3],Rt={fx:.46,fy:.4,sx:8,sy:6.5,minArea:150},gt=(t,e,a)=>Math.max(Math.min(t,a),e),Xe=(t,e,a)=>{const s=e-t;return a<1||s<Ve?[]:Array.from({length:a},(i,r)=>t+s*(r+.5)/a)},Aa=(t,e,a,s)=>{const i=t<3||e<3||a<3.5,r=Math.min(3.2,a*.38),l=Math.min(Math.min(3.4,a*.42),Math.max(.4,.85*a-r)),c=i?0:e>=15?2:e>=6?1:0,u=Xe(0,e,c),x=!i&&t>=8&&a>=5,f=Math.min(6.8,a*.8),z=1.5,_=x?t-5.5:t-1.5,T=_-z,lt=i?0:T>=12?2:T>=3?1:0,E=Xe(z,_,lt),I=[],dt=!i&&Math.min(t,e)>=5,y=t*e,n=1.8,$=new Map,Y=[];for(const X of ka){const k=Ut[X];if(!dt||y<k.minArea){$.set(X,null);continue}const d=Math.min(k.sx,t*.3),w=Math.min(k.sy,e*.3),v=Math.min(t-le-d,x?t-4.6-d:1/0),m=s&&.3<s.y1&&.3+w>s.y0?Math.max(n,s.x1):n;if(v<m){$.set(X,null);continue}const o=g=>Y.find(([R,L])=>g<L-1e-9&&g+d>R+1e-9);let p=gt(k.fx*t-d/2,m,v);for(let g=0;p!=null&&g<=Y.length;g++){const R=o(p);if(!R)break;const L=p,G=[R[1],R[0]-d].filter(O=>O>=m-1e-9&&O<=v+1e-9);G.sort((O,K)=>Math.abs(O-L)-Math.abs(K-L)),p=G.length?G[0]:null}if(p==null||o(p)){$.set(X,null);continue}Y.push([p,p+d]),$.set(X,p)}for(let X=0;X<Ut.length;X++){const k=Ut[X];if(!dt||y<k.minArea){I.push(null);continue}const d=Math.min(k.sx,t*.3),w=Math.min(k.sy,e*.3),v=t-le-d,m=e-1-w;if(k.snap!=="x"&&v<1||k.snap!=="y"&&m<1){I.push(null);continue}const o=k.snap==="y"?$.get(X)??null:null;if(k.snap==="y"&&o==null){I.push(null);continue}const p=k.snap==="x"?.3:k.snap==="y"?o:gt(k.fx*t-d/2,1,v);let g=k.snap==="y"?.3:gt(k.fy*e-w/2,1,m);if(s&&k.snap!=="y"&&p<s.x1&&p+d>s.x0&&g<s.y1&&g+w>s.y0){const R=s.y0-w,L=s.y1,G=Math.abs(g-R)<=Math.abs(g-L)?[R,L]:[L,R],O=k.snap==="x"?.3:1,K=G.find(et=>et>=O&&et<=m);if(K==null){I.push(null);continue}g=K}I.push({x0:p,y0:g,x1:p+d,y1:g+w,h:Math.min(k.h,a*.75)})}const Bt=dt&&y>=Rt.minArea,ut=Math.min(Rt.sx,t*.5),ht=Math.min(Rt.sy,e*.55),wt=gt(Rt.fx*t-ut/2,.8,t-le-ut),ft=gt(Rt.fy*e-ht/2,.8,e-.8-ht);return{degenerate:i,sill:r,winH:l,doorOn:x,doorH:f,winL:u,winR:E,furn:I,rugOn:Bt,rx0:wt,ry0:ft,rx1:wt+ut,ry1:ft+ht}},Ue=8,Tt=A.querySelector('[data-label="capacity"]');let It=null;const $a=()=>Math.max(2,Math.min(j.x,j.y,Yt-(j.x+j.w),Gt-(j.y+j.h))),qa=t=>{if(!Tt)return null;if(It&&It.key===t)return It;Tt.textContent=t,Tt.setAttribute("x","0"),Tt.setAttribute("y","0");let e=null;try{e=Tt.getBBox()}catch{e=null}return!e||!e.width?null:(It={key:t,w:e.width,h:e.height,dx:e.x,dy:e.y},It)},_a=(t,e,a)=>{let s=t+Ue,i=e+2*Ue;const r=qa(a);if(!r)return[s,i];const l=$a(),c=(u,x)=>{s=u-r.dx,i=x-r.dy};if(c(gt(s+r.dx,l,Math.max(l,Yt-l-r.w)),gt(i+r.dy,l,Math.max(l,Gt-l-r.h))),st){const u=st.x-l,x=st.y-l,f=st.x+st.w+l,z=st.y+st.h+l,_=s+r.dx,T=i+r.dy;_<f&&_+r.w>u&&T<z&&T+r.h>x&&(u-r.w>=l?c(u-r.w,T):c(_,Math.max(l,x-r.h)))}return[s,i]},pe=(t,e,a)=>{if(!St)return;const s=Math.min(Math.max(1,yt),B),i=Z>.01,r=t*Z,l=e*Z,c=t-r,u=(e-l)/2,x=(e+l)/2,f=Math.max(2,.08*(t+e)),z=d=>{const w=[],v=(D,mt,Nt,ne,se)=>{for(const[on,rn]of[[D,mt],[Nt,mt],[Nt,ne],[D,ne]])for(const cn of[0,se])w.push(ce(on,rn,cn))};v(0,0,t,e,a);for(const D of d)v(D.x0,D.y0,D.x1,D.y1,D.h);i&&v(c,u,t,x,a);for(const[D,mt]of[[-f,-f],[t+f,-f],[t+f,e+f],[-f,e+f]])w.push(ce(D,mt,-.35));const m=w.map(D=>D[0]),o=w.map(D=>D[1]),p=Math.min(...m),g=Math.max(...m),R=Math.min(...o),L=Math.max(...o),G=de/2,O=Math.max(1,j.w-de),K=Math.max(1,j.h-de),et=Math.min(O/(g-p||1),K/(L-R||1),xa),Ee=j.x+G+(O-(g-p)*et)/2-p*et,Ce=j.y+G+(K-(L-R)*et)/2-R*et;return{scale:et,ox:Ee,oy:Ce}};let _=He(t,e,s),T=z(_);(_[0].x1-_[0].x0)*T.scale<Ie&&(_=He(t,e,s,Ie*1.1/T.scale),T=z(_));const{scale:E,ox:I,oy:dt}=T;Re=E;const y=Aa(t,e,a,Sa(_)),n=(d,w,v)=>{const m=ce(d,w,v);return[I+m[0]*E,dt+m[1]*E]};N("[data-ground]",[n(-f,-f,-.35),n(t+f,-f,-.35),n(t+f,e+f,-.35),n(-f,e+f,-.35)]),N('[data-room="left"]',[n(0,0,a),n(0,e,a),n(0,e,0),n(0,0,0)]),N('[data-room="right"]',[n(0,0,a),n(t,0,a),n(t,0,0),n(0,0,0)]),N('[data-wall-top="left"]',[n(0,0,a),n(0,e,a),n(-.35,e,a),n(-.35,0,a)]),N('[data-wall-top="right"]',[n(0,0,a),n(t,0,a),n(t,-.35,a),n(0,-.35,a)]),N('[data-wall-cap="left"]',[n(0,e,a),n(-.35,e,a),n(-.35,e,0),n(0,e,0)]),N('[data-wall-cap="right"]',[n(t,0,a),n(t,-.35,a),n(t,-.35,0),n(t,0,0)]);const $=[n(0,0,0),n(t,0,0),n(t,e,0),n(0,e,0)];if(N('[data-room="floor"]',$),N('[data-floor-edge="left"]',[n(0,e,0),n(t,e,0),n(t,e,-.35),n(0,e,-.35)]),N('[data-floor-edge="right"]',[n(t,0,0),n(t,e,0),n(t,e,-.35),n(t,0,-.35)]),N("[data-floor-clip]",$),Ye&&(Ye.style.visibility=y.degenerate?"hidden":""),Ge&&(Ge.style.visibility=y.degenerate?"hidden":""),y.degenerate&&zt("[data-rug]",!1),!y.degenerate){const d=Ve/2,w=y.sill,v=y.sill+y.winH;for(let m=1;m<=Ma;m++){const o=y.winL[m-1];zt(`[data-win-l="${m}"]`,o!=null,o!=null?[n(0,o-d,v),n(0,o+d,v),n(0,o+d,w),n(0,o-d,w)]:void 0);const p=y.winR[m-1];zt(`[data-win-r="${m}"]`,p!=null,p!=null?[n(p-d,0,v),n(p+d,0,v),n(p+d,0,w),n(p-d,0,w)]:void 0)}zt("[data-door]",y.doorOn,y.doorOn?[n(t-4.2,0,y.doorH),n(t-1.2,0,y.doorH),n(t-1.2,0,0),n(t-4.2,0,0)]:void 0),zt("[data-rug]",y.rugOn,y.rugOn?[n(y.rx0,y.ry0,0),n(y.rx1,y.ry0,0),n(y.rx1,y.ry1,0),n(y.rx0,y.ry1,0)]:void 0);for(let m=0;m<Ut.length;m++){const o=y.furn[m],p=A.querySelector(`[data-furn="${m+1}"]`);if(p&&(p.style.visibility=o?"":"hidden"),!o)continue;const g=o.h;N(`[data-furn="${m+1}"] [data-furn-face="top"]`,[n(o.x0,o.y0,g),n(o.x1,o.y0,g),n(o.x1,o.y1,g),n(o.x0,o.y1,g)]),N(`[data-furn="${m+1}"] [data-furn-face="left"]`,[n(o.x0,o.y1,g),n(o.x1,o.y1,g),n(o.x1,o.y1,0),n(o.x0,o.y1,0)]),N(`[data-furn="${m+1}"] [data-furn-face="right"]`,[n(o.x1,o.y0,g),n(o.x1,o.y1,g),n(o.x1,o.y1,0),n(o.x1,o.y0,0)])}}if(i){const d=c<-1e-6?"[data-capg-back]":"[data-capg]",w=c<-1e-6?"[data-capg]":"[data-capg-back]";for(const G of["floor","left","right"])N(`${w} [data-cap="${G}"]`,[]);N(`${d} [data-cap="floor"]`,[n(c,u,0),n(t,u,0),n(t,x,0),n(c,x,0)]),N(`${d} [data-cap="left"]`,[n(c,u,a),n(c,x,a),n(c,x,0),n(c,u,0)]),N(`${d} [data-cap="right"]`,[n(c,u,a),n(t,u,a),n(t,u,0),n(c,u,0)]),N('[data-cap="top"]',[n(c,u,a),n(t,u,a),n(t,x,a),n(c,x,a)]);const v=A.querySelector("[data-cap-edge]");if(v){const G=n(t,x,0),O=n(t,x,a);v.setAttribute("x1",`${G[0]}`),v.setAttribute("y1",`${G[1]}`),v.setAttribute("x2",`${O[0]}`),v.setAttribute("y2",`${O[1]}`)}const[m,o]=n(t,x,0),p=jt?"≥":"",R=C("units")==="ft3"?`${S(Mt,0)} ft³`:`${S(Mt/8,0)} ft²`,L=`covers a room up to ${p}${R}`;Vt("capacity",_a(m,o,L),L)}Ht.length=0;for(let d=0;d<B;d++){const w=A.querySelector(`.smaqmd-cityview__rings[data-rings="${d+1}"]`),v=A.querySelector(`.smaqmd-cityview__unitg[data-unitg="${d+1}"]`),m=d<s;if(w&&(w.style.visibility=m?"":"hidden"),v&&(v.style.visibility=m?"":"hidden"),!m){Ht[d]=null,(fe[d]||[]).forEach(Nt=>Nt.setAttribute("points",""));continue}const o=_[d],p=o.x1-o.x0,g=(o.x0+o.x1)/2,R=(o.y0+o.y1)/2,L=.75*p,G=Math.max(L+.5,Math.min(7,Math.max(2.5,.45*Math.min(t,e)))),[O,K]=n(g,R,0),[et,Ee]=n(g+1,R,0),[Ce,D]=n(g,R+1,0);Ht[d]={cx:O,cy:K,ex:et-O,ey:Ee-K,fx:Ce-O,fy:D-K,r0:L,rMax:G};const mt=(Nt,ne)=>{const se=v?.querySelector(Nt);se&&se.setAttribute("points",me(ne))};mt('[data-unit="top"]',[n(o.x0,o.y0,o.h),n(o.x1,o.y0,o.h),n(o.x1,o.y1,o.h),n(o.x0,o.y1,o.h)]),mt('[data-unit="left"]',[n(o.x0,o.y1,o.h),n(o.x1,o.y1,o.h),n(o.x1,o.y1,0),n(o.x0,o.y1,0)]),mt('[data-unit="right"]',[n(o.x1,o.y0,o.h),n(o.x1,o.y1,o.h),n(o.x1,o.y1,0),n(o.x1,o.y0,0)])}const[Y,Bt]=Xt(n(0,e,0),n(t,e,0));Vt("length",[Y-4,Bt+20],`${S(t*at.L,1)} ft`);const[ut,ht]=Xt(n(0,0,a),n(0,e,a));Vt("width",[ut-12,ht-12],`${S(e*at.W,1)} ft`);const[wt,ft]=Xt(n(0,e,0),n(0,e,a));Vt("height",[wt-26,ft],`${S(a*at.H,1)} ft`);const X={length:30,width:150,height:90},k=(d,w,v)=>{const m=A.querySelector(`.smaqmd-cityview__hit[data-grip="${d}"]`);m&&(m.setAttribute("x1",w[0].toFixed(1)),m.setAttribute("y1",w[1].toFixed(1)),m.setAttribute("x2",v[0].toFixed(1)),m.setAttribute("y2",v[1].toFixed(1)));const[o,p]=Xt(w,v),g=A.querySelector(`.smaqmd-cityview__handle[data-grip="${d}"]`);g&&g.setAttribute("transform",`translate(${o.toFixed(1)} ${p.toFixed(1)}) rotate(${X[d]})`)};k("length",n(0,e,0),n(t,e,0)),k("width",n(0,0,a),n(0,e,a)),k("height",n(0,e,0),n(0,e,a)),Na()},Ea=5,ye=window.matchMedia("(prefers-reduced-motion: reduce)").matches;let xt=ye;const M={L:12,W:10,H:8},q={L:12,W:10,H:8};let Z=0,bt=0,Mt=0,jt=!1;const kt=A.querySelector("[data-capg]"),At=A.querySelector("[data-capg-back]"),$t=A.querySelector("[data-capg-top]"),qt=[];let ot="idle",Kt=!1,ge=0;const xe=new Array(B).fill(0),Ca=()=>ot!=="idle"&&!xt,Na=()=>{for(let t=0;t<B;t++){const e=Ht[t],a=fe[t];if(!(!e||!a))for(let s=0;s<Pe;s++){const i=a[s];if(!i)continue;const r=(xe[t]+s/Pe)%1,l=e.r0+(e.rMax-e.r0)*r,c=[];for(let u=0;u<Be;u++){const x=u/Be*Math.PI*2,f=Math.cos(x),z=Math.sin(x);c.push(`${(e.cx+l*(e.ex*f+e.fx*z)).toFixed(1)},${(e.cy+l*(e.ey*f+e.fy*z)).toFixed(1)}`)}i.setAttribute("points",c.join(" ")),i.setAttribute("stroke-opacity",(.55*(1-r)).toFixed(2))}}},Fa=t=>{if(!(ot==="idle"||xt))for(let e=0;e<B&&e<yt;e++){const a=qt[e];if(!a||!Number.isFinite(a))continue;const s=Math.max(1.2,Math.min(80,4*Ea/a));xe[e]=(xe[e]+t/s)%1}},je=()=>{for(let t=0;t<B;t++){const e=!(t<yt&&qt[t]>0),a=A.querySelector(`.smaqmd-cityview__rings[data-rings="${t+1}"]`);a&&(e?a.setAttribute("data-lane-idle",""):a.removeAttribute("data-lane-idle"))}},Ke=t=>{if(!Ft){Kt=!1;return}const e=Math.min(.05,(t-ge)/1e3||0);ge=t,M.L+=(q.L-M.L)*.22,M.W+=(q.W-M.W)*.22,M.H+=(q.H-M.H)*.22,Z+=(bt-Z)*.22;const a=Math.abs(q.L-M.L)+Math.abs(q.W-M.W)+Math.abs(q.H-M.H)+Math.abs(bt-Z)>=.01;a||(M.L=q.L,M.W=q.W,M.H=q.H,Z=bt),Fa(e),pe(M.L,M.W,M.H),a||Ca()?requestAnimationFrame(Ke):Kt=!1},_t=()=>{!Ft||Kt||(Kt=!0,ge=performance.now(),requestAnimationFrame(Ke))},Qe={length:100,width:100,height:30,area:1e4,volume:3e5},za=1,Ra=()=>{const t=e=>{const a=V(e);return Number.isFinite(a)&&a>Qe[e]};switch(C("roomMethod")){case"dimensions":return t("length")||t("width")||t("height");case"area":return t("area")||t("height");case"volume":return t("volume");default:return!1}},Ze=()=>{switch(C("roomMethod")){case"dimensions":return V("length")*V("width")*V("height");case"area":return V("area")*V("height");case"volume":return V("volume");default:return NaN}},Ta=()=>{switch(C("roomMethod")){case"dimensions":{const t=P("length")*P("width");return t>0?t:NaN}case"area":return P("area");case"volume":{const t=P("volume");return t>0?t/8:NaN}default:return NaN}},Ia=()=>{const t=C("roomMethod");if(t==="area"){const e=P("area"),a=P("height")||8,s=Number.isFinite(e)?Math.sqrt(e):.5;return{L:s||.5,W:s||.5,H:a}}if(t==="volume"){const e=P("volume"),a=8,s=Number.isFinite(e)?Math.sqrt(e/a):.5;return{L:s||.5,W:s||.5,H:a}}return{L:P("length")||.5,W:P("width")||.5,H:P("height")||.5}},Lt=()=>{const t=Ia();q.L=Math.min(t.L,Te),q.W=Math.min(t.W,Te),q.H=Math.min(t.H,ba),at.L=t.L/q.L,at.W=t.W/q.W,at.H=t.H/q.H,_t()},be=()=>{const t=St&&!(ue&&U.matches&&h.dataset.section!=="3");t!==Ft&&(Ft=t,t&&(M.L=q.L,M.W=q.W,M.H=q.H,Z=bt,he(),Lt()))};ue&&St&&U.addEventListener("change",be);const Je=()=>{if(!pt)return;const t=`${xt?"Play":"Pause"} the air-cleaning animation`;pt.setAttribute("aria-label",t),pt.setAttribute("title",t),pt.querySelectorAll("[data-icon]").forEach(e=>{e.style.display=e.dataset.icon==="pause"===xt?"none":""})};pt&&(Je(),pt.addEventListener("click",()=>{xt=!xt,Je(),xt||_t()}));const We=h.querySelector("[data-cleaners]"),La=h.querySelector("[data-cleaner-template]"),rt=()=>nt("[data-cleaner-block]:not([data-removing])");let ta=0;const Oa=["unit","airflow","ach","refMethod","refArea","refLength","refWidth","refHeight"],Da=t=>{ye||(t.style.overflow="hidden",t.style.boxSizing="border-box",t.style.blockSize="0",t.style.opacity="0",requestAnimationFrame(()=>{const e=t.scrollHeight,a=200;t.style.transition=`block-size ${a}ms ease-out, opacity ${a}ms ease-out`,t.style.blockSize=`${e}px`,t.style.opacity="1";let s=!1;const i=()=>{s||(s=!0,t.style.transition="",t.style.overflow="",t.style.boxSizing="",t.style.blockSize="",t.style.opacity="")};t.addEventListener("transitionend",r=>{r.propertyName==="block-size"&&i()}),window.setTimeout(i,a+80)}))},ea=t=>{if(rt().length>=B)return;const e=t?.copyLast?rt().at(-1)?.dataset.cleanerBlock:void 0,a=La.content.cloneNode(!0),s=a.querySelector("[data-cleaner-block]"),i=String(++ta);s.setAttribute("data-cleaner-block",i),s.querySelectorAll("[data-cleaner]").forEach(r=>r.setAttribute("data-cleaner",i)),e&&Oa.forEach(r=>{const l=C(r,e);if(!l)return;const c=s.querySelector(`[data-field="${r}"][data-cleaner]`);c&&c.setAttribute("value",l)}),We.appendChild(a),t?.animate&&Da(s)},Pa=()=>{We.replaceChildren(),ta=0,ea()},Ba=t=>{const e=rt(),a=e.indexOf(t),s=e.filter(f=>f!==t);let i=null;s.length>1&&(i=s[Math.min(a,s.length-1)].querySelector("[data-remove-cleaner] button")),i||(i=h.querySelector("[data-add-cleaner] button")),i?.focus(),oe(`Air cleaner ${a+1} removed.`),t.setAttribute("data-removing","");const r=()=>{t.remove(),Lt(),Et()};if(ye){r();return}const l=t.offsetHeight;t.style.overflow="hidden",t.style.boxSizing="border-box",t.style.blockSize=`${l}px`,t.getBoundingClientRect();const c=180;t.style.transition=`block-size ${c}ms ease, opacity ${c}ms ease, padding-block ${c}ms ease, margin-block ${c}ms ease, border-block ${c}ms ease`,t.style.blockSize="0",t.style.opacity="0",t.style.paddingBlock="0",t.style.marginBlock="0",t.style.borderBlock="0";let u=!1;const x=()=>{u||(u=!0,r())};t.addEventListener("transitionend",f=>{const z=f.propertyName;(z==="block-size"||z==="height")&&x()}),window.setTimeout(x,c+60),Et()},it=(t,e)=>{t&&(t.hidden=!e)},ve=()=>{const t=C("roomMethod")||"dimensions";nt("[data-room]").forEach(s=>it(s,s.dataset.room.split(" ").includes(t))),H.dataset.entryMode=t,it(h.querySelector("[data-cleaner-entry]"),C("hasCleaner")!=="no");const e=rt();e.forEach((s,i)=>{const r=s.querySelector(".smaqmd-aerb__cleaner-title");r&&(r.textContent=`Air cleaner ${i+1}`);const l=s.querySelector("[data-remove-cleaner]");it(l,e.length>1);const c=l?.querySelector("button");if(c){const f=`Remove air cleaner ${i+1}`;c.setAttribute("aria-label",f),c.setAttribute("title",f)}const u=C("unit",s.dataset.cleanerBlock);it(s.querySelector('[data-unit-mode="airflow"]'),u!=="ach"),it(s.querySelector('[data-unit-mode="ach"]'),u==="ach");const x=C("refMethod",s.dataset.cleanerBlock)||"area";s.querySelectorAll("[data-ref]").forEach(f=>it(f,f.dataset.ref.split(" ").includes(x)))});const a=e.length>=B;it(h.querySelector("[data-add-cleaner]"),!a),it(h.querySelector("[data-cap-note]"),a)},J=h.querySelector("[data-result]"),we=(t,e)=>{const a=h.querySelector(`[data-metric="${t}"] .esa-stat__value`);a&&(a.innerHTML=e)},aa=t=>`<span class="smaqmd-aerb__unit"> ${t}</span>`,vt=(t,e)=>J.querySelectorAll(`[data-r="${t}"]`).forEach(a=>a.textContent=e),b=(t,e)=>{if(!t)return;const a=t,s=a.hidden;a.hidden=!e,e&&s&&a.hasAttribute("data-alert")&&oe(a.textContent?.trim()??"",{assertive:a.dataset.alert==="assertive"})},Se=t=>{let e;if(C("unit",t)==="ach"){const a=P("refHeight",t)||8,s=C("refMethod",t)==="dimensions"?V("refLength",t)*V("refWidth",t)*a:V("refArea",t)*a;e=P("ach",t)*s/60}else e=P("airflow",t);return Number.isFinite(e)&&e>0?e:0},na=()=>C("hasCleaner")!=="no",Ya=()=>na()?rt().reduce((t,e)=>t+Se(e.dataset.cleanerBlock),0):0,sa=(t,e)=>b(J.querySelector(`[data-group="${t}"]`),e),Qt=t=>J.querySelectorAll("[data-verdict-card]").forEach(e=>b(e,e.dataset.verdictCard===t)),Ot=J.querySelector('[data-group="answer"]'),Me=J.querySelector("[data-answer-title]"),Ga=h.querySelector("[data-target-warn]"),Ha=h.querySelector("[data-target-invalid]"),Va=h.querySelector("[data-room-warn]"),ke=h.querySelector('[data-field="targetSlider"]'),Xa=1,Ua=8,oa=.5,ja=t=>{if(!ke||!Number.isFinite(t))return;const e=Math.min(Ua,Math.max(Xa,t)),a=Math.round(e/oa)*oa;ke.value!==a&&(ke.value=a)},Dt=J.querySelector('[data-metric="ach"]'),ra=J.querySelector("[data-ach-evidence]"),ct=J.querySelector('[data-metric="fix"]'),Zt=ct?.querySelector(".esa-stat__label")??null,Jt=ct?.querySelector(".esa-stat__sub")??null,ia=ct?.querySelector("[data-ach-equiv]")??null,Ae=ct?.querySelector("[data-ach-equiv-rows]")??null,ca=J.querySelector("[data-cadr-high]"),Wt=(t,e)=>{Me&&(Me.textContent=t),Ot&&(e?Ot.setAttribute("data-verdict",e):Ot.removeAttribute("data-verdict"),b(Ot,e!=null))};let la=0,da="";const te=t=>{window.clearTimeout(la),la=window.setTimeout(()=>{t!==da&&(oe(t),da=t)},600)},Et=()=>{ve();const t=rt(),e=na()?Math.max(1,t.length):1;yt=Math.min(Math.max(1,t.length),B);const a=P("target")||2;vt("target",S(a,2));const s=V("target"),i=Number.isFinite(s)&&s<=0;b(Ha,i),b(Va,Ra()),b(Ga,Number.isFinite(s)&&s>0&&s<2),ja(s);const r=Ya(),l=Ze(),c=r>0,u=Number.isFinite(l)&&l>0,x=!c&&u&&Number.isFinite(s)&&s>0,f=Ta(),z=c?r*60/a:NaN,_=C("units")==="ft3",T=C("rating")==="ach";vt("coversubj",t.length>1?"Your cleaners cover":"Your cleaner covers"),vt("roomarea",u&&Number.isFinite(f)?_?`${S(l,0)} ft³`:`${S(f,0)} ft²`:"—"),vt("coverarea",c?_?`${S(z,0)} ft³`:`${S(z/8,0)} ft²`:"—");const lt=c&&u?r/l*60:NaN,E=c&&u&&lt>=a;if(sa("secondary",E),c&&u){Mt=r*60/a;const n=Math.sqrt(Mt/l);bt=Math.min(n,3),jt=n>3,H.dataset.capCompare=Mt>=l?"bigger":"smaller",kt&&(kt.style.visibility=""),At&&(At.style.visibility=""),$t&&($t.style.visibility="")}else x?(Mt=l,bt=1,jt=!1,H.dataset.capCompare="bigger",kt&&(kt.style.visibility=""),At&&(At.style.visibility=""),$t&&($t.style.visibility="")):(bt=0,jt=!1,kt&&(kt.style.visibility="hidden"),At&&(At.style.visibility="hidden"),$t&&($t.style.visibility="hidden"));qt.length=0,t.forEach((n,$)=>{if($>=B)return;const Y=Se(n.dataset.cleanerBlock);qt[$]=u&&Y>0?Y/l*60:0}),je();const I=a*l/60,dt=()=>{if(T){if(we("fix",`${S(a,2)}${aa("ACH")}`),Zt&&(Zt.textContent="ACH coverage to shop for"),Jt&&(Jt.textContent=`${S(a,2)} air changes per hour in your ${S(f,0)} ft² room`),Ae){const n=[1,2,4,5];a>0&&!n.includes(a)&&n.push(a),n.sort(($,Y)=>$-Y),Ae.textContent="";for(const $ of n){const Y=document.createElement("li");Y.textContent=`${S($,2)} ACH — covers ${S(Math.ceil(I*7.5/$),0)} ft² or more`,Ae.appendChild(Y)}}b(ia,!0)}else we("fix",`${S(I,0)}${aa("CFM (ft³/min)")}`),Zt&&(Zt.textContent="combined CADR to shop for"),Jt&&(Jt.textContent="added up across all the air cleaners in the room"),b(ia,!1)},y=n=>b(J.querySelector('[data-prompt="empty"]'),n);if(i)b(Dt,!1),b(ct,!1),Wt("",null),Qt(null),sa("secondary",!1),ot="idle",H.dataset.state="idle",y(!0),te("");else if(c&&u){we("ach",S(lt,1)),vt("ach",S(lt,1)),b(Dt,E),b(ra,!E);const n=Dt?.querySelector(".esa-stat__sub");if(n&&(n.textContent=`${E?"Meets":"Below"} your ${S(a,2)} air changes per hour target`),dt(),b(ct,!E),!E){const Bt=a*l/60,ut=t.map(ft=>Se(ft.dataset.cleanerBlock)).filter(ft=>ft>0),ht=ut.length?Math.min(...ut):0,wt=ht>0?Math.max(1,Math.ceil((Bt-r)/ht)):0;vt("moreunits",S(wt,0)),vt("unitnoun",wt===1?"air cleaner":"air cleaners")}b(ca,!1);const $=t.length>1?"Your cleaners are":"Your cleaner is",Y=t.length>1?"Your cleaners aren't":"Your cleaner isn't";Wt(E?`${$} powerful enough for this room`:`${Y} powerful enough for this room`,E?"pass":"fail"),Qt(E?"pass":"fail"),y(!1),ot=E?"pass":"fail",H.dataset.state=ot,te(`This setup delivers ${S(lt,1)} air changes per hour, ${E?"at or above":"below"} your target of ${S(a,1)}.`),_t()}else if(u){if(b(Dt,!1),b(ra,!1),dt(),b(ct,!0),b(ca,I>700),Wt("Shop for this rating","shop"),Qt("shop"),y(!1),x){yt=Math.min(Math.max(1,e),B),qt.length=0;for(let $=0;$<B;$++)qt[$]=$<yt?a/yt:0;je(),ot="shop",H.dataset.state="shop",_t()}else ot="idle",H.dataset.state="idle",Z>.01&&_t();te(T?`Look for a listing that covers at least ${S(Math.ceil(I*7.5),0)} square feet at 1 air change per hour, or a matching size from the on-screen list at a higher ACH.`:e>1?`To reach ${S(a,1)} air changes per hour, your cleaners' combined CADR needs to be at least ${S(I,0)} CFM.`:`To reach ${S(a,1)} air changes per hour in this room, look for an air cleaner with a CADR of at least ${S(I,0)} CFM.`)}else b(Dt,!1),b(ct,!1),Wt("",null),Qt(null),ot="idle",H.dataset.state="idle",y(!0),te(""),Z>.01&&_t()},Ka=t=>{let e=t.replace(/[^0-9.]/g,"");const a=e.indexOf(".");return a!==-1&&(e=e.slice(0,a+1)+e.slice(a+1).replace(/\./g,"")),e},Qa=t=>{const e=q.L*at.L,a=q.W*at.W,s=q.H*at.H;if(t==="area"){const i=Q("area");i&&!C("area")&&(i.value=String(Math.round(e*a)))}else if(t==="volume"){const i=Q("volume");i&&!C("volume")&&(i.value=String(Math.round(e*a*s)))}},ua=t=>{const e=t.target;if(e&&e.tagName==="ESA-TEXT-FIELD"){const a=Ka(e.value??"");a!==e.value&&(e.value=a)}if(e&&e.tagName==="ESA-RADIO-GROUP"&&e.dataset?.field==="roomMethod"&&Qa(e.value??"dimensions"),e&&e.dataset?.field==="targetSlider"){const a=Q("target"),s=e.value;a&&s!=null&&(a.value=String(s))}Lt(),Et()};h.addEventListener("input",ua),h.addEventListener("change",ua),h.addEventListener("click",t=>{const e=t.target;if(e.closest("[data-add-cleaner]")){if(t.preventDefault(),rt().length>=B)return;ea({copyLast:!0,animate:!0}),Lt(),Et();const s=rt();if(s.length>=B){s[s.length-1]?.querySelector("[data-remove-cleaner] button")?.focus();const r=h.querySelector("[data-cap-note]");oe(r?.textContent?.trim()||"You have added the maximum number of air cleaners.")}return}const a=e.closest("[data-remove-cleaner]");if(a){t.preventDefault();const s=a.closest("[data-cleaner-block]");s&&!s.hasAttribute("data-removing")&&Ba(s)}});const Za={length:[re,ie],width:[re,-ie],height:[0,-1]},Ja={length:"L",width:"W",height:"H"};let W=null;A.addEventListener("pointerdown",t=>{if(C("roomMethod")!=="dimensions")return;const e=t.target.closest?.("[data-grip]");if(!e)return;const a=e.getAttribute("data-grip");W={dim:a,sx:t.clientX,sy:t.clientY,v0:P(a)||q[Ja[a]],sc:Re},t.target.setPointerCapture(t.pointerId),H.dataset.dragging=a,t.preventDefault()}),A.addEventListener("pointermove",t=>{if(!W)return;const[e,a]=Za[W.dim],s=((t.clientX-W.sx)*e+(t.clientY-W.sy)*a)/W.sc,i=Math.min(Qe[W.dim],Math.max(za,Math.round((W.v0+s)*2)/2)),r=Q(W.dim);r&&r.value!==String(i)&&(r.value=String(i),r.dispatchEvent(new Event("input",{bubbles:!0})))});const ha=()=>{W=null,delete H.dataset.dragging};A.addEventListener("pointerup",ha),A.addEventListener("pointercancel",ha);const fa=[0,1,2],Wa=[0,2],tn=3;let tt=fa;const en=["What size is your room?","What air cleaners do you have?","What's your air-change target?","Your result"],Pt=h.querySelector("[data-wizard]"),$e=h.querySelector("[data-intro]"),an=h.querySelector("[data-intro-title]"),ma=nt("[data-step]"),nn=nt("[data-dot]"),pa=h.querySelector("[data-step-count]"),qe=h.querySelector("[data-step-title]"),Ct=h.querySelector("[data-room-hint]"),ee=t=>h.querySelector(`[data-nav="${t}"]`),ya=()=>{const t=Ze();return Number.isFinite(t)&&t>0};let F=0;const _e=(t=0)=>{const e=F>=tt.length,a=e?tn:tt[F];h.dataset.section=String(a),be(),ma.forEach(r=>b(r,Number(r.dataset.step)===a));const s=ma.find(r=>Number(r.dataset.step)===a);if(s&&(s.classList.remove("smaqmd-wizard__step--enter-fwd","smaqmd-wizard__step--enter-back"),t!==0&&(s.offsetWidth,s.classList.add(t<0?"smaqmd-wizard__step--enter-back":"smaqmd-wizard__step--enter-fwd"))),nn.forEach((r,l)=>{b(r,!e&&l<tt.length),r.toggleAttribute("data-active",l===F&&!e),r.toggleAttribute("data-done",l<F)}),b(h.querySelector(".smaqmd-wizard__dots"),!e),pa&&(pa.textContent=e?"Result":`Step ${F+1} of ${tt.length}`),qe){const r=e?Me?.textContent?.trim():null;qe.textContent=r&&r!=="—"?r:en[a]}const i=e?Ot?.getAttribute("data-verdict"):null;Pt&&(i?Pt.setAttribute("data-verdict",i):Pt.removeAttribute("data-verdict")),b(ee("back"),F>0||!!$e),b(ee("next"),F<tt.length-1),b(ee("result"),F===tt.length-1),b(ee("restart"),e),Ct&&a!==0&&b(Ct,!1),he(),t!==0&&qe?.focus()},ae=t=>{const e=Math.min(Math.max(0,t),tt.length);if(e>F&&tt[F]===0&&!ya()){Ct&&b(Ct,!0);return}const a=e===F?0:e>F?1:-1;F=e,_e(a)},ga=()=>{F=0,delete h.dataset.section,be(),Pt?.setAttribute("data-phase","intro"),an?.focus()},sn=()=>{F===0&&$e?ga():ae(F-1)};h.addEventListener("click",t=>{const e=t.target,a=e.closest('[data-nav="check"], [data-nav="shop"]');if(a){t.preventDefault();const s=a.matches('[data-nav="shop"]'),i=Q("hasCleaner");i&&(i.value=s?"no":"yes"),ve(),Et(),tt=s?Wa:fa,F=0,Pt?.setAttribute("data-phase","steps"),_e(1)}else e.closest('[data-nav="next"]')?(t.preventDefault(),ae(F+1)):e.closest('[data-nav="result"]')?(t.preventDefault(),ae(tt.length)):e.closest('[data-nav="back"]')?(t.preventDefault(),sn()):e.closest('[data-nav="restart"]')&&(t.preventDefault(),$e?ga():ae(0))}),h.addEventListener("input",()=>{F===0&&Ct&&ya()&&b(Ct,!1)}),Pa(),pe(M.L,M.W,M.H),Promise.all([customElements.whenDefined("esa-text-field"),customElements.whenDefined("esa-radio-group")]).then(()=>{ve(),Lt(),Et(),_e()})}
