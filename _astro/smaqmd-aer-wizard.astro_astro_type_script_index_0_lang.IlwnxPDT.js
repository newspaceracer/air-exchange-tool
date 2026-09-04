import{i as Ua,a as ca}from"./announcer.CjDH29W_.js";import"./esa-radio-group.Dv82n_W1.js";import"./esa-button-toggle.BsaIktF8.js";import{i as ja,A as Ka,b as Se,t as Qa,a as Za,c as Ja}from"./a11y.dx8jdvWt.js";const Wa=new Set(["false","0","off","no"]),tn={fromAttribute:U=>U!==null&&!Wa.has(U.trim().toLowerCase()),toAttribute:U=>U?"":null},en={xs:"label-2xs",sm:"label-xs",md:"label-md",lg:"label-lg"},an={xs:"microcopy-2xs",sm:"microcopy-xs",md:"microcopy-md",lg:"microcopy-lg"};class nn extends ja{constructor(){super(),this.onInput=et=>{const j=Number(et.target.value);this.value=j,this.internals.setFormValue(String(j)),this.dispatchEvent(new CustomEvent("change",{detail:{value:j},bubbles:!0,composed:!0}))},this.min=0,this.max=100,this.step=1,this.size="md",this.label="",this.showValue=!0,this.disabled=!1,this.value=0,this.internals=this.attachInternals()}static{this.formAssociated=!0}static{this.properties={min:{type:Number},max:{type:Number},step:{type:Number},size:{type:String,reflect:!0},label:{type:String},showValue:{type:Boolean,attribute:"show-value",converter:tn},disabled:{type:Boolean,reflect:!0},name:{type:String,reflect:!0},value:{type:Number}}}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(String(this.value))}willUpdate(et){et.has("value")&&this.internals.setFormValue(String(this.value))}get fillPercent(){return this.max===this.min?0:(this.value-this.min)/(this.max-this.min)*100}render(){return Se`
      ${this.label?Se`<label for="input" class="label typography-${en[this.size]}"
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
            aria-label=${this.label?Ka:"Range slider"}
            aria-valuemin=${this.min}
            aria-valuemax=${this.max}
            aria-valuenow=${this.value}
            @input=${this.onInput}
          />
        </div>
        ${this.showValue?Se`<span class="value typography-${an[this.size]}">${this.value}</span>`:null}
      </div>
    `}static{this.styles=[Qa,Za,Ja`
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
  `]}}customElements.get("esa-range-slider")||customElements.define("esa-range-slider",nn);Ua();const d=document.querySelector("[data-aerb-wizard]");if(d){const U=window.matchMedia("(max-width: 68rem)");{const t=d.querySelector(".smaqmd-aerb__header"),e=d.querySelector(".smaqmd-aerw__col"),a=()=>{t&&(U.matches?d.firstElementChild!==t&&d.prepend(t):e&&e.firstElementChild!==t&&e.prepend(t))};a(),U.addEventListener("change",a)}const et=t=>Array.from(d.querySelectorAll(t)),j=(t,e)=>{const a=e!=null?`[data-field="${t}"][data-cleaner="${e}"]`:`[data-field="${t}"]:not([data-cleaner])`;return d.querySelector(a)},E=(t,e)=>{const a=j(t,e);return(a&&a.value!=null?String(a.value):"").trim()},G=(t,e)=>{const a=parseFloat(E(t,e));return Number.isFinite(a)?a:NaN},D=(t,e)=>{const a=G(t,e);return Number.isFinite(a)&&a>0?a:NaN},w=(t,e=0)=>t.toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:0}),te=Math.cos(Math.PI/6),ee=.5,ae=(t,e,a)=>[(t-e)*te,(t+e)*ee-a],Me=d.querySelector(".smaqmd-cityview__svg"),ke=d.querySelector("[data-cityview]"),_=Me??document.createElementNS("http://www.w3.org/2000/svg","svg"),Y=ke??document.createElement("div");let Ae=1,$e=480,_e=380,dt={x:52,y:52,w:376,h:276};const la=12,qe=60,da=20,tt={L:1,W:1,H:1},ua=2.6,ha=1.4,Ee=22,ne=3.8,Ce=d.querySelector("[data-safe]"),Ne=Ce??document.createElement("div"),pt=!!(Me&&ke&&Ce),se=d.dataset.variant==="responsive";let At=pt&&!(se&&U.matches);const oe=()=>{if(!At)return;$e=Y.clientWidth,_e=Y.clientHeight,_.setAttribute("viewBox",`0 0 ${$e} ${_e}`);const t=Ne.getBoundingClientRect(),e=Y.getBoundingClientRect();dt={x:t.left-e.left,y:t.top-e.top,w:t.width,h:t.height},ce(S.L,S.W,S.H)};pt&&new ResizeObserver(oe).observe(Ne);const Ot=[],Fe=3,ze=28;let ut=1;const P=4,re=[];for(let t=0;pt&&t<P;t++)re[t]=Array.from(_.querySelectorAll(`.smaqmd-cityview__rings[data-rings="${t+1}"] .smaqmd-cityview__ring`));const ie=t=>t.map(e=>`${e[0].toFixed(1)},${e[1].toFixed(1)}`).join(" "),C=(t,e)=>{const a=_.querySelector(t);a&&a.setAttribute("points",ie(e))},Dt=(t,e,a)=>{const s=_.querySelector(`[data-label="${t}"]`);s&&(s.setAttribute("x",e[0].toFixed(1)),s.setAttribute("y",e[1].toFixed(1)),s.textContent=a)},Lt=(t,e)=>[(t[0]+e[0])/2,(t[1]+e[1])/2],Re=_.querySelector("[data-room-details]"),Ie=_.querySelector("[data-furniture]"),$t=(t,e,a)=>{const s=_.querySelector(t);s&&(s.style.visibility=e?"":"hidden",e&&a&&s.setAttribute("points",ie(a)))},Te=(t,e,a,s)=>{const i=Math.min(Math.max(Math.min(t,e)*.16,ha),ua);let r=Math.min(s??i,e*.55,3.2);a>=3&&(r=Math.min(r,e*.28>=2?e*.28:e*.35-.5)),a>=2&&(r=Math.min(r,(t-2.4)/2)),r=Math.max(r,.2);const p=r*1.5,u=Math.max(1,r*.5),g=r/2+u/2,M=a>=3,x=a>=4,B=[];for(let I=0;I<a;I++){const H=I%2===0?"front":"back",q=(H==="front"?M:x)?e/2+(I<2?-g:g):e/2,T=H==="front"?t-1.2-r:.6;B.push({x0:T,y0:q-r/2,x1:T+r,y1:q+r/2,h:p,side:H})}return B},fa=t=>{const e=t.filter(s=>s.side==="back");if(!e.length)return null;const a=.6;return{x0:0,x1:Math.max(...e.map(s=>s.x1))+a,y0:Math.min(...e.map(s=>s.y0))-a,y1:Math.max(...e.map(s=>s.y1))+a}},ma=2,Oe=3,Pt=[{fx:.12,fy:.06,sx:3.6,sy:1.5,h:2.7,minArea:90,snap:"y"},{fx:.05,fy:.28,sx:1.1,sy:3.2,h:5.6,minArea:0,snap:"x"},{fx:.42,fy:.06,sx:6.4,sy:5,h:1.7,minArea:0,snap:"y"},{fx:.72,fy:.06,sx:3.2,sy:1.6,h:2.5,minArea:260,snap:"y"},{fx:.05,fy:.74,sx:1.4,sy:1.4,h:2.1,minArea:140,snap:"x"},{fx:.1,fy:.9,sx:1.1,sy:1.1,h:3,minArea:220},{fx:.7,fy:.86,sx:1.9,sy:1.9,h:2.4,minArea:320}],pa=[2,0,3],_t={fx:.46,fy:.4,sx:8,sy:6.5,minArea:150},qt=(t,e,a)=>Math.max(Math.min(t,a),e),De=(t,e,a)=>{const s=e-t;return a<1||s<Oe?[]:Array.from({length:a},(i,r)=>t+s*(r+.5)/a)},ga=(t,e,a,s)=>{const i=t<3||e<3||a<3.5,r=Math.min(3.2,a*.38),p=Math.min(Math.min(3.4,a*.42),Math.max(.4,.85*a-r)),u=i?0:e>=15?2:e>=6?1:0,g=De(0,e,u),M=!i&&t>=8&&a>=5,x=Math.min(6.8,a*.8),B=1.5,I=M?t-5.5:t-1.5,H=I-B,ot=i?0:H>=12?2:H>=3?1:0,q=De(B,I,ot),T=[],rt=!i&&Math.min(t,e)>=5,f=t*e,n=1.8,A=new Map,L=[];for(const V of pa){const k=Pt[V];if(!rt||f<k.minArea){A.set(V,null);continue}const c=Math.min(k.sx,t*.3),b=Math.min(k.sy,e*.3),v=Math.min(t-ne-c,M?t-4.6-c:1/0),l=s&&.3<s.y1&&.3+b>s.y0?Math.max(n,s.x1):n;if(v<l){A.set(V,null);continue}const o=m=>L.find(([F,z])=>m<z-1e-9&&m+c>F+1e-9);let h=qt(k.fx*t-c/2,l,v);for(let m=0;h!=null&&m<=L.length;m++){const F=o(h);if(!F)break;const z=h,O=[F[1],F[0]-c].filter(X=>X>=l-1e-9&&X<=v+1e-9);O.sort((X,W)=>Math.abs(X-z)-Math.abs(W-z)),h=O.length?O[0]:null}if(h==null||o(h)){A.set(V,null);continue}L.push([h,h+c]),A.set(V,h)}for(let V=0;V<Pt.length;V++){const k=Pt[V];if(!rt||f<k.minArea){T.push(null);continue}const c=Math.min(k.sx,t*.3),b=Math.min(k.sy,e*.3),v=t-ne-c,l=e-1-b;if(k.snap!=="x"&&v<1||k.snap!=="y"&&l<1){T.push(null);continue}const o=k.snap==="y"?A.get(V)??null:null;if(k.snap==="y"&&o==null){T.push(null);continue}const h=k.snap==="x"?.3:k.snap==="y"?o:qt(k.fx*t-c/2,1,v);let m=k.snap==="y"?.3:qt(k.fy*e-b/2,1,l);if(s&&k.snap!=="y"&&h<s.x1&&h+c>s.x0&&m<s.y1&&m+b>s.y0){const F=s.y0-b,z=s.y1,O=Math.abs(m-F)<=Math.abs(m-z)?[F,z]:[z,F],X=k.snap==="x"?.3:1,W=O.find(R=>R>=X&&R<=l);if(W==null){T.push(null);continue}m=W}T.push({x0:h,y0:m,x1:h+c,y1:m+b,h:Math.min(k.h,a*.75)})}const Rt=rt&&f>=_t.minArea,it=Math.min(_t.sx,t*.5),ct=Math.min(_t.sy,e*.55),mt=qt(_t.fx*t-it/2,.8,t-ne-it),lt=qt(_t.fy*e-ct/2,.8,e-.8-ct);return{degenerate:i,sill:r,winH:p,doorOn:M,doorH:x,winL:g,winR:q,furn:T,rugOn:Rt,rx0:mt,ry0:lt,rx1:mt+it,ry1:lt+ct}},ce=(t,e,a)=>{if(!pt)return;const s=Math.min(Math.max(1,ut),P),i=K>.01,r=t*K,p=e*K,u=t-r,g=(e-p)/2,M=(e+p)/2,x=Math.max(2,.08*(t+e)),B=c=>{const b=[],v=(R,kt,Zt,Jt,It)=>{for(const[Tt,we]of[[R,kt],[Zt,kt],[Zt,Jt],[R,Jt]])for(const Wt of[0,It])b.push(ae(Tt,we,Wt))};v(0,0,t,e,a);for(const R of c)v(R.x0,R.y0,R.x1,R.y1,R.h);i&&v(u,g,t,M,a);for(const[R,kt]of[[-x,-x],[t+x,-x],[t+x,e+x],[-x,e+x]])b.push(ae(R,kt,-.35));const l=b.map(R=>R[0]),o=b.map(R=>R[1]),h=Math.min(...l),m=Math.max(...l),F=Math.min(...o),z=Math.max(...o),O=Math.min(dt.w/(m-h||1),dt.h/(z-F||1),la),X=dt.x+(dt.w-(m-h)*O)/2-h*O,W=dt.y+(dt.h-(z-F)*O)/2-F*O;return{scale:O,ox:X,oy:W}};let I=Te(t,e,s),H=B(I);(I[0].x1-I[0].x0)*H.scale<Ee&&(I=Te(t,e,s,Ee*1.1/H.scale),H=B(I));const{scale:q,ox:T,oy:rt}=H;Ae=q;const f=ga(t,e,a,fa(I)),n=(c,b,v)=>{const l=ae(c,b,v);return[T+l[0]*q,rt+l[1]*q]};C("[data-ground]",[n(-x,-x,-.35),n(t+x,-x,-.35),n(t+x,e+x,-.35),n(-x,e+x,-.35)]),C('[data-room="left"]',[n(0,0,a),n(0,e,a),n(0,e,0),n(0,0,0)]),C('[data-room="right"]',[n(0,0,a),n(t,0,a),n(t,0,0),n(0,0,0)]),C('[data-wall-top="left"]',[n(0,0,a),n(0,e,a),n(-.35,e,a),n(-.35,0,a)]),C('[data-wall-top="right"]',[n(0,0,a),n(t,0,a),n(t,-.35,a),n(0,-.35,a)]),C('[data-wall-cap="left"]',[n(0,e,a),n(-.35,e,a),n(-.35,e,0),n(0,e,0)]),C('[data-wall-cap="right"]',[n(t,0,a),n(t,-.35,a),n(t,-.35,0),n(t,0,0)]);const A=[n(0,0,0),n(t,0,0),n(t,e,0),n(0,e,0)];if(C('[data-room="floor"]',A),C('[data-floor-edge="left"]',[n(0,e,0),n(t,e,0),n(t,e,-.35),n(0,e,-.35)]),C('[data-floor-edge="right"]',[n(t,0,0),n(t,e,0),n(t,e,-.35),n(t,0,-.35)]),C("[data-floor-clip]",A),Re&&(Re.style.visibility=f.degenerate?"hidden":""),Ie&&(Ie.style.visibility=f.degenerate?"hidden":""),f.degenerate&&$t("[data-rug]",!1),!f.degenerate){const c=Oe/2,b=f.sill,v=f.sill+f.winH;for(let l=1;l<=ma;l++){const o=f.winL[l-1];$t(`[data-win-l="${l}"]`,o!=null,o!=null?[n(0,o-c,v),n(0,o+c,v),n(0,o+c,b),n(0,o-c,b)]:void 0);const h=f.winR[l-1];$t(`[data-win-r="${l}"]`,h!=null,h!=null?[n(h-c,0,v),n(h+c,0,v),n(h+c,0,b),n(h-c,0,b)]:void 0)}$t("[data-door]",f.doorOn,f.doorOn?[n(t-4.2,0,f.doorH),n(t-1.2,0,f.doorH),n(t-1.2,0,0),n(t-4.2,0,0)]:void 0),$t("[data-rug]",f.rugOn,f.rugOn?[n(f.rx0,f.ry0,0),n(f.rx1,f.ry0,0),n(f.rx1,f.ry1,0),n(f.rx0,f.ry1,0)]:void 0);for(let l=0;l<Pt.length;l++){const o=f.furn[l],h=_.querySelector(`[data-furn="${l+1}"]`);if(h&&(h.style.visibility=o?"":"hidden"),!o)continue;const m=o.h;C(`[data-furn="${l+1}"] [data-furn-face="top"]`,[n(o.x0,o.y0,m),n(o.x1,o.y0,m),n(o.x1,o.y1,m),n(o.x0,o.y1,m)]),C(`[data-furn="${l+1}"] [data-furn-face="left"]`,[n(o.x0,o.y1,m),n(o.x1,o.y1,m),n(o.x1,o.y1,0),n(o.x0,o.y1,0)]),C(`[data-furn="${l+1}"] [data-furn-face="right"]`,[n(o.x1,o.y0,m),n(o.x1,o.y1,m),n(o.x1,o.y1,0),n(o.x1,o.y0,0)])}}if(i){const c=u<-1e-6?"[data-capg-back]":"[data-capg]",b=u<-1e-6?"[data-capg]":"[data-capg-back]";for(const z of["floor","left","right"])C(`${b} [data-cap="${z}"]`,[]);C(`${c} [data-cap="floor"]`,[n(u,g,0),n(t,g,0),n(t,M,0),n(u,M,0)]),C(`${c} [data-cap="left"]`,[n(u,g,a),n(u,M,a),n(u,M,0),n(u,g,0)]),C(`${c} [data-cap="right"]`,[n(u,g,a),n(t,g,a),n(t,g,0),n(u,g,0)]),C('[data-cap="top"]',[n(u,g,a),n(t,g,a),n(t,M,a),n(u,M,a)]);const v=_.querySelector("[data-cap-edge]");if(v){const z=n(t,M,0),O=n(t,M,a);v.setAttribute("x1",`${z[0]}`),v.setAttribute("y1",`${z[1]}`),v.setAttribute("x2",`${O[0]}`),v.setAttribute("y2",`${O[1]}`)}const[l,o]=n(t,M,0),h=Ht?"≥":"",F=E("units")==="ft3"?`${w(gt,0)} ft³`:`${w(gt/8,0)} ft²`;Dt("capacity",[l+8,o+16],`covers a room up to ${h}${F}`)}Ot.length=0;for(let c=0;c<P;c++){const b=_.querySelector(`.smaqmd-cityview__rings[data-rings="${c+1}"]`),v=_.querySelector(`.smaqmd-cityview__unitg[data-unitg="${c+1}"]`),l=c<s;if(b&&(b.style.visibility=l?"":"hidden"),v&&(v.style.visibility=l?"":"hidden"),!l){Ot[c]=null,(re[c]||[]).forEach(Tt=>Tt.setAttribute("points",""));continue}const o=I[c],h=o.x1-o.x0,m=(o.x0+o.x1)/2,F=(o.y0+o.y1)/2,z=.75*h,O=Math.max(z+.5,Math.min(7,Math.max(2.5,.45*Math.min(t,e)))),[X,W]=n(m,F,0),[R,kt]=n(m+1,F,0),[Zt,Jt]=n(m,F+1,0);Ot[c]={cx:X,cy:W,ex:R-X,ey:kt-W,fx:Zt-X,fy:Jt-W,r0:z,rMax:O};const It=(Tt,we)=>{const Wt=v?.querySelector(Tt);Wt&&Wt.setAttribute("points",ie(we))};It('[data-unit="top"]',[n(o.x0,o.y0,o.h),n(o.x1,o.y0,o.h),n(o.x1,o.y1,o.h),n(o.x0,o.y1,o.h)]),It('[data-unit="left"]',[n(o.x0,o.y1,o.h),n(o.x1,o.y1,o.h),n(o.x1,o.y1,0),n(o.x0,o.y1,0)]),It('[data-unit="right"]',[n(o.x1,o.y0,o.h),n(o.x1,o.y1,o.h),n(o.x1,o.y1,0),n(o.x1,o.y0,0)])}const[L,Rt]=Lt(n(0,e,0),n(t,e,0));Dt("length",[L-4,Rt+20],`${w(t*tt.L,1)} ft`);const[it,ct]=Lt(n(0,0,a),n(0,e,a));Dt("width",[it-12,ct-12],`${w(e*tt.W,1)} ft`);const[mt,lt]=Lt(n(0,e,0),n(0,e,a));Dt("height",[mt-26,lt],`${w(a*tt.H,1)} ft`);const V={length:30,width:150,height:90},k=(c,b,v)=>{const l=_.querySelector(`.smaqmd-cityview__hit[data-grip="${c}"]`);l&&(l.setAttribute("x1",b[0].toFixed(1)),l.setAttribute("y1",b[1].toFixed(1)),l.setAttribute("x2",v[0].toFixed(1)),l.setAttribute("y2",v[1].toFixed(1)));const[o,h]=Lt(b,v),m=_.querySelector(`.smaqmd-cityview__handle[data-grip="${c}"]`);m&&m.setAttribute("transform",`translate(${o.toFixed(1)} ${h.toFixed(1)}) rotate(${V[c]})`)};k("length",n(0,e,0),n(t,e,0)),k("width",n(0,0,a),n(0,e,a)),k("height",n(0,e,0),n(0,e,a)),xa()},ya=5,Bt=window.matchMedia("(prefers-reduced-motion: reduce)").matches,S={L:12,W:10,H:8},$={L:12,W:10,H:8};let K=0,ht=0,gt=0,Ht=!1;const yt=_.querySelector("[data-capg]"),vt=_.querySelector("[data-capg-back]"),xt=_.querySelector("[data-capg-top]"),bt=[];let at="idle",Yt=!1,le=0;const de=new Array(P).fill(0),va=()=>at!=="idle"&&!Bt,xa=()=>{for(let t=0;t<P;t++){const e=Ot[t],a=re[t];if(!(!e||!a))for(let s=0;s<Fe;s++){const i=a[s];if(!i)continue;const r=(de[t]+s/Fe)%1,p=e.r0+(e.rMax-e.r0)*r,u=[];for(let g=0;g<ze;g++){const M=g/ze*Math.PI*2,x=Math.cos(M),B=Math.sin(M);u.push(`${(e.cx+p*(e.ex*x+e.fx*B)).toFixed(1)},${(e.cy+p*(e.ey*x+e.fy*B)).toFixed(1)}`)}i.setAttribute("points",u.join(" ")),i.setAttribute("stroke-opacity",(.55*(1-r)).toFixed(2))}}},ba=t=>{if(!(at==="idle"||Bt))for(let e=0;e<P&&e<ut;e++){const a=bt[e];if(!a||!Number.isFinite(a))continue;const s=Math.max(1.2,Math.min(80,4*ya/a));de[e]=(de[e]+t/s)%1}},Le=()=>{for(let t=0;t<P;t++){const e=!(t<ut&&bt[t]>0),a=_.querySelector(`.smaqmd-cityview__rings[data-rings="${t+1}"]`);a&&(e?a.setAttribute("data-lane-idle",""):a.removeAttribute("data-lane-idle"))}},Pe=t=>{if(!At){Yt=!1;return}const e=Math.min(.05,(t-le)/1e3||0);le=t,S.L+=($.L-S.L)*.22,S.W+=($.W-S.W)*.22,S.H+=($.H-S.H)*.22,K+=(ht-K)*.22;const a=Math.abs($.L-S.L)+Math.abs($.W-S.W)+Math.abs($.H-S.H)+Math.abs(ht-K)>=.01;a||(S.L=$.L,S.W=$.W,S.H=$.H,K=ht),ba(e),ce(S.L,S.W,S.H),a||va()?requestAnimationFrame(Pe):Yt=!1},Et=()=>{!At||Yt||(Yt=!0,le=performance.now(),requestAnimationFrame(Pe))},Be={length:100,width:100,height:30,area:1e4,volume:3e5},wa=1,Sa=()=>{const t=e=>{const a=G(e);return Number.isFinite(a)&&a>Be[e]};switch(E("roomMethod")){case"dimensions":return t("length")||t("width")||t("height");case"area":return t("area")||t("height");case"volume":return t("volume");default:return!1}},He=()=>{switch(E("roomMethod")){case"dimensions":return G("length")*G("width")*G("height");case"area":return G("area")*G("height");case"volume":return G("volume");default:return NaN}},Ma=()=>{switch(E("roomMethod")){case"dimensions":{const t=D("length")*D("width");return t>0?t:NaN}case"area":return D("area");case"volume":{const t=D("volume");return t>0?t/8:NaN}default:return NaN}},ka=()=>{const t=E("roomMethod");if(t==="area"){const e=D("area"),a=D("height")||8,s=Number.isFinite(e)?Math.sqrt(e):.5;return{L:s||.5,W:s||.5,H:a}}if(t==="volume"){const e=D("volume"),a=8,s=Number.isFinite(e)?Math.sqrt(e/a):.5;return{L:s||.5,W:s||.5,H:a}}return{L:D("length")||.5,W:D("width")||.5,H:D("height")||.5}},Ct=()=>{const t=ka();$.L=Math.min(t.L,qe),$.W=Math.min(t.W,qe),$.H=Math.min(t.H,da),tt.L=t.L/$.L,tt.W=t.W/$.W,tt.H=t.H/$.H,Et()},ue=()=>{const t=pt&&!(se&&U.matches&&d.dataset.section!=="3");t!==At&&(At=t,t&&(S.L=$.L,S.W=$.W,S.H=$.H,K=ht,oe(),Ct()))};se&&pt&&U.addEventListener("change",ue);const Ye=d.querySelector("[data-cleaners]"),Aa=d.querySelector("[data-cleaner-template]"),wt=()=>et("[data-cleaner-block]:not([data-removing])");let Ge=0;const $a=["unit","airflow","ach","refMethod","refArea","refLength","refWidth","refHeight"],_a=t=>{Bt||(t.style.overflow="hidden",t.style.boxSizing="border-box",t.style.blockSize="0",t.style.opacity="0",requestAnimationFrame(()=>{const e=t.scrollHeight,a=200;t.style.transition=`block-size ${a}ms ease-out, opacity ${a}ms ease-out`,t.style.blockSize=`${e}px`,t.style.opacity="1";let s=!1;const i=()=>{s||(s=!0,t.style.transition="",t.style.overflow="",t.style.boxSizing="",t.style.blockSize="",t.style.opacity="")};t.addEventListener("transitionend",r=>{r.propertyName==="block-size"&&i()}),window.setTimeout(i,a+80)}))},Ve=t=>{if(wt().length>=P)return;const e=t?.copyLast?wt().at(-1)?.dataset.cleanerBlock:void 0,a=Aa.content.cloneNode(!0),s=a.querySelector("[data-cleaner-block]"),i=String(++Ge);s.setAttribute("data-cleaner-block",i),s.querySelectorAll("[data-cleaner]").forEach(r=>r.setAttribute("data-cleaner",i)),e&&$a.forEach(r=>{const p=E(r,e);if(!p)return;const u=s.querySelector(`[data-field="${r}"][data-cleaner]`);u&&u.setAttribute("value",p)}),Ye.appendChild(a),t?.animate&&_a(s)},qa=()=>{Ye.replaceChildren(),Ge=0,Ve()},Ea=t=>{t.setAttribute("data-removing","");const e=()=>{t.remove(),Ct(),St()};if(Bt){e();return}const a=t.offsetHeight;t.style.overflow="hidden",t.style.boxSizing="border-box",t.style.blockSize=`${a}px`,t.getBoundingClientRect();const s=180;t.style.transition=`block-size ${s}ms ease, opacity ${s}ms ease, padding-block ${s}ms ease, margin-block ${s}ms ease, border-block ${s}ms ease`,t.style.blockSize="0",t.style.opacity="0",t.style.paddingBlock="0",t.style.marginBlock="0",t.style.borderBlock="0";let i=!1;const r=()=>{i||(i=!0,e())};t.addEventListener("transitionend",p=>{const u=p.propertyName;(u==="block-size"||u==="height")&&r()}),window.setTimeout(r,s+60),St()},nt=(t,e)=>{t&&(t.hidden=!e)},he=()=>{const t=E("roomMethod")||"dimensions";et("[data-room]").forEach(s=>nt(s,s.dataset.room.split(" ").includes(t))),Y.dataset.entryMode=t,nt(d.querySelector("[data-cleaner-entry]"),E("hasCleaner")!=="no");const e=wt();e.forEach((s,i)=>{const r=s.querySelector(".smaqmd-aerb__cleaner-title");r&&(r.textContent=`Air cleaner ${i+1}`);const p=s.querySelector("[data-remove-cleaner]");nt(p,e.length>1);const u=p?.querySelector("esa-icon-button, [label]");u&&u.setAttribute("label",`Remove air cleaner ${i+1}`);const g=E("unit",s.dataset.cleanerBlock);nt(s.querySelector('[data-unit-mode="airflow"]'),g!=="ach"),nt(s.querySelector('[data-unit-mode="ach"]'),g==="ach");const M=E("refMethod",s.dataset.cleanerBlock)||"area";s.querySelectorAll("[data-ref]").forEach(x=>nt(x,x.dataset.ref.split(" ").includes(M)))});const a=e.length>=P;nt(d.querySelector("[data-add-cleaner]"),!a),nt(d.querySelector("[data-cap-note]"),a)},Q=d.querySelector("[data-result]"),fe=(t,e)=>{const a=d.querySelector(`[data-metric="${t}"] .esa-stat__value`);a&&(a.innerHTML=e)},Xe=t=>`<span class="smaqmd-aerb__unit"> ${t}</span>`,ft=(t,e)=>Q.querySelectorAll(`[data-r="${t}"]`).forEach(a=>a.textContent=e),y=(t,e)=>{if(!t)return;const a=t,s=a.hidden;a.hidden=!e,e&&s&&a.hasAttribute("data-alert")&&ca(a.textContent?.trim()??"",{assertive:a.dataset.alert==="assertive"})},me=t=>{let e;if(E("unit",t)==="ach"){const a=D("refHeight",t)||8,s=E("refMethod",t)==="dimensions"?G("refLength",t)*G("refWidth",t)*a:G("refArea",t)*a;e=D("ach",t)*s/60}else e=D("airflow",t);return Number.isFinite(e)&&e>0?e:0},Ue=()=>E("hasCleaner")!=="no",Ca=()=>Ue()?wt().reduce((t,e)=>t+me(e.dataset.cleanerBlock),0):0,je=(t,e)=>y(Q.querySelector(`[data-group="${t}"]`),e),Gt=t=>Q.querySelectorAll("[data-verdict-card]").forEach(e=>y(e,e.dataset.verdictCard===t)),Nt=Q.querySelector('[data-group="answer"]'),pe=Q.querySelector("[data-answer-title]"),Na=d.querySelector("[data-target-warn]"),Fa=d.querySelector("[data-target-invalid]"),za=d.querySelector("[data-room-warn]"),ge=d.querySelector('[data-field="targetSlider"]'),Ra=1,Ia=8,Ke=.5,Ta=t=>{if(!ge||!Number.isFinite(t))return;const e=Math.min(Ia,Math.max(Ra,t)),a=Math.round(e/Ke)*Ke;ge.value!==a&&(ge.value=a)},Ft=Q.querySelector('[data-metric="ach"]'),Qe=Q.querySelector("[data-ach-evidence]"),st=Q.querySelector('[data-metric="fix"]'),Vt=st?.querySelector(".esa-stat__label")??null,Xt=st?.querySelector(".esa-stat__sub")??null,Ze=st?.querySelector("[data-ach-equiv]")??null,ye=st?.querySelector("[data-ach-equiv-rows]")??null,Je=Q.querySelector("[data-cadr-high]"),Ut=(t,e)=>{pe&&(pe.textContent=t),Nt&&(e?Nt.setAttribute("data-verdict",e):Nt.removeAttribute("data-verdict"),y(Nt,e!=null))};let We=0,ta="";const jt=t=>{window.clearTimeout(We),We=window.setTimeout(()=>{t!==ta&&(ca(t),ta=t)},600)},St=()=>{he();const t=wt(),e=Ue()?Math.max(1,t.length):1;ut=Math.min(Math.max(1,t.length),P);const a=D("target")||2;ft("target",w(a,2));const s=G("target"),i=Number.isFinite(s)&&s<=0;y(Fa,i),y(za,Sa()),y(Na,Number.isFinite(s)&&s>0&&s<2),Ta(s);const r=Ca(),p=He(),u=r>0,g=Number.isFinite(p)&&p>0,M=!u&&g&&Number.isFinite(s)&&s>0,x=Ma(),B=u?r*60/a:NaN,I=E("units")==="ft3",H=E("rating")==="ach";ft("coversubj",t.length>1?"Your cleaners cover":"Your cleaner covers"),ft("roomarea",g&&Number.isFinite(x)?I?`${w(p,0)} ft³`:`${w(x,0)} ft²`:"—"),ft("coverarea",u?I?`${w(B,0)} ft³`:`${w(B/8,0)} ft²`:"—");const ot=u&&g?r/p*60:NaN,q=u&&g&&ot>=a;if(je("secondary",q),u&&g){gt=r*60/a;const n=Math.sqrt(gt/p);ht=Math.min(n,3),Ht=n>3,Y.dataset.capCompare=gt>=p?"bigger":"smaller",yt&&(yt.style.visibility=""),vt&&(vt.style.visibility=""),xt&&(xt.style.visibility="")}else M?(gt=p,ht=1,Ht=!1,Y.dataset.capCompare="bigger",yt&&(yt.style.visibility=""),vt&&(vt.style.visibility=""),xt&&(xt.style.visibility="")):(ht=0,Ht=!1,yt&&(yt.style.visibility="hidden"),vt&&(vt.style.visibility="hidden"),xt&&(xt.style.visibility="hidden"));bt.length=0,t.forEach((n,A)=>{if(A>=P)return;const L=me(n.dataset.cleanerBlock);bt[A]=g&&L>0?L/p*60:0}),Le();const T=a*p/60,rt=()=>{if(H){if(fe("fix",`${w(a,2)}${Xe("ACH")}`),Vt&&(Vt.textContent="ACH coverage to shop for"),Xt&&(Xt.textContent=`${w(a,2)} air changes per hour in your ${w(x,0)} ft² room`),ye){const n=[1,2,4,5];a>0&&!n.includes(a)&&n.push(a),n.sort((A,L)=>A-L),ye.textContent="";for(const A of n){const L=document.createElement("li");L.textContent=`${w(A,2)} ACH — covers ${w(Math.ceil(T*7.5/A),0)} ft² or more`,ye.appendChild(L)}}y(Ze,!0)}else fe("fix",`${w(T,0)}${Xe("CFM (ft³/min)")}`),Vt&&(Vt.textContent="combined CADR to shop for"),Xt&&(Xt.textContent="added up across all the air cleaners in the room"),y(Ze,!1)},f=n=>y(Q.querySelector('[data-prompt="empty"]'),n);if(i)y(Ft,!1),y(st,!1),Ut("",null),Gt(null),je("secondary",!1),at="idle",Y.dataset.state="idle",f(!0),jt("");else if(u&&g){fe("ach",w(ot,1)),ft("ach",w(ot,1)),y(Ft,q),y(Qe,!q);const n=Ft?.querySelector(".esa-stat__sub");if(n&&(n.textContent=`${q?"Meets":"Below"} your ${w(a,2)} air changes per hour target`),rt(),y(st,!q),!q){const Rt=a*p/60,it=t.map(lt=>me(lt.dataset.cleanerBlock)).filter(lt=>lt>0),ct=it.length?Math.min(...it):0,mt=ct>0?Math.max(1,Math.ceil((Rt-r)/ct)):0;ft("moreunits",w(mt,0)),ft("unitnoun",mt===1?"air cleaner":"air cleaners")}y(Je,!1);const A=t.length>1?"Your cleaners are":"Your cleaner is",L=t.length>1?"Your cleaners aren't":"Your cleaner isn't";Ut(q?`${A} powerful enough for this room`:`${L} powerful enough for this room`,q?"pass":"fail"),Gt(q?"pass":"fail"),f(!1),at=q?"pass":"fail",Y.dataset.state=at,jt(`This setup delivers ${w(ot,1)} air changes per hour, ${q?"at or above":"below"} your target of ${w(a,1)}.`),Et()}else if(g){if(y(Ft,!1),y(Qe,!1),rt(),y(st,!0),y(Je,T>700),Ut("Shop for this rating","shop"),Gt("shop"),f(!1),M){ut=Math.min(Math.max(1,e),P),bt.length=0;for(let A=0;A<P;A++)bt[A]=A<ut?a/ut:0;Le(),at="shop",Y.dataset.state="shop",Et()}else at="idle",Y.dataset.state="idle",K>.01&&Et();jt(H?`Look for a listing that covers at least ${w(Math.ceil(T*7.5),0)} square feet at 1 air change per hour, or a matching size from the on-screen list at a higher ACH.`:e>1?`To reach ${w(a,1)} air changes per hour, your cleaners' combined CADR needs to be at least ${w(T,0)} CFM.`:`To reach ${w(a,1)} air changes per hour in this room, look for an air cleaner with a CADR of at least ${w(T,0)} CFM.`)}else y(Ft,!1),y(st,!1),Ut("",null),Gt(null),at="idle",Y.dataset.state="idle",f(!0),jt(""),K>.01&&Et()},Oa=t=>{let e=t.replace(/[^0-9.]/g,"");const a=e.indexOf(".");return a!==-1&&(e=e.slice(0,a+1)+e.slice(a+1).replace(/\./g,"")),e},Da=t=>{const e=$.L*tt.L,a=$.W*tt.W,s=$.H*tt.H;if(t==="area"){const i=j("area");i&&!E("area")&&(i.value=String(Math.round(e*a)))}else if(t==="volume"){const i=j("volume");i&&!E("volume")&&(i.value=String(Math.round(e*a*s)))}},ea=t=>{const e=t.target;if(e&&e.tagName==="ESA-TEXT-FIELD"){const a=Oa(e.value??"");a!==e.value&&(e.value=a)}if(e&&e.tagName==="ESA-RADIO-GROUP"&&e.dataset?.field==="roomMethod"&&Da(e.value??"dimensions"),e&&e.dataset?.field==="targetSlider"){const a=j("target"),s=e.value;a&&s!=null&&(a.value=String(s))}Ct(),St()};d.addEventListener("input",ea),d.addEventListener("change",ea),d.addEventListener("click",t=>{const e=t.target;if(e.closest("[data-add-cleaner]")){if(t.preventDefault(),wt().length>=P)return;Ve({copyLast:!0,animate:!0}),Ct(),St();return}const a=e.closest("[data-remove-cleaner]");if(a){t.preventDefault();const s=a.closest("[data-cleaner-block]");s&&!s.hasAttribute("data-removing")&&Ea(s)}});const La={length:[te,ee],width:[te,-ee],height:[0,-1]},Pa={length:"L",width:"W",height:"H"};let Z=null;_.addEventListener("pointerdown",t=>{if(E("roomMethod")!=="dimensions")return;const e=t.target.closest?.("[data-grip]");if(!e)return;const a=e.getAttribute("data-grip");Z={dim:a,sx:t.clientX,sy:t.clientY,v0:D(a)||$[Pa[a]],sc:Ae},t.target.setPointerCapture(t.pointerId),Y.dataset.dragging=a,t.preventDefault()}),_.addEventListener("pointermove",t=>{if(!Z)return;const[e,a]=La[Z.dim],s=((t.clientX-Z.sx)*e+(t.clientY-Z.sy)*a)/Z.sc,i=Math.min(Be[Z.dim],Math.max(wa,Math.round((Z.v0+s)*2)/2)),r=j(Z.dim);r&&r.value!==String(i)&&(r.value=String(i),r.dispatchEvent(new Event("input",{bubbles:!0})))});const aa=()=>{Z=null,delete Y.dataset.dragging};_.addEventListener("pointerup",aa),_.addEventListener("pointercancel",aa);const na=[0,1,2],Ba=[0,2],Ha=3;let J=na;const Ya=["What size is your room?","What air cleaners do you have?","What's your air-change target?","Your result"],zt=d.querySelector("[data-wizard]"),ve=d.querySelector("[data-intro]"),Ga=d.querySelector("[data-intro-title]"),sa=et("[data-step]"),Va=et("[data-dot]"),oa=d.querySelector("[data-step-count]"),xe=d.querySelector("[data-step-title]"),Mt=d.querySelector("[data-room-hint]"),Kt=t=>d.querySelector(`[data-nav="${t}"]`),ra=()=>{const t=He();return Number.isFinite(t)&&t>0};let N=0;const be=(t=0)=>{const e=N>=J.length,a=e?Ha:J[N];d.dataset.section=String(a),ue(),sa.forEach(r=>y(r,Number(r.dataset.step)===a));const s=sa.find(r=>Number(r.dataset.step)===a);if(s&&(s.classList.remove("smaqmd-wizard__step--enter-fwd","smaqmd-wizard__step--enter-back"),t!==0&&(s.offsetWidth,s.classList.add(t<0?"smaqmd-wizard__step--enter-back":"smaqmd-wizard__step--enter-fwd"))),Va.forEach((r,p)=>{y(r,!e&&p<J.length),r.toggleAttribute("data-active",p===N&&!e),r.toggleAttribute("data-done",p<N)}),y(d.querySelector(".smaqmd-wizard__dots"),!e),oa&&(oa.textContent=e?"Result":`Step ${N+1} of ${J.length}`),xe){const r=e?pe?.textContent?.trim():null;xe.textContent=r&&r!=="—"?r:Ya[a]}const i=e?Nt?.getAttribute("data-verdict"):null;zt&&(i?zt.setAttribute("data-verdict",i):zt.removeAttribute("data-verdict")),y(Kt("back"),N>0||!!ve),y(Kt("next"),N<J.length-1),y(Kt("result"),N===J.length-1),y(Kt("restart"),e),Mt&&a!==0&&y(Mt,!1),oe(),t!==0&&xe?.focus()},Qt=t=>{const e=Math.min(Math.max(0,t),J.length);if(e>N&&J[N]===0&&!ra()){Mt&&y(Mt,!0);return}const a=e===N?0:e>N?1:-1;N=e,be(a)},ia=()=>{N=0,delete d.dataset.section,ue(),zt?.setAttribute("data-phase","intro"),Ga?.focus()},Xa=()=>{N===0&&ve?ia():Qt(N-1)};d.addEventListener("click",t=>{const e=t.target,a=e.closest('[data-nav="check"], [data-nav="shop"]');if(a){t.preventDefault();const s=a.matches('[data-nav="shop"]'),i=j("hasCleaner");i&&(i.value=s?"no":"yes"),he(),St(),J=s?Ba:na,N=0,zt?.setAttribute("data-phase","steps"),be(1)}else e.closest('[data-nav="next"]')?(t.preventDefault(),Qt(N+1)):e.closest('[data-nav="result"]')?(t.preventDefault(),Qt(J.length)):e.closest('[data-nav="back"]')?(t.preventDefault(),Xa()):e.closest('[data-nav="restart"]')&&(t.preventDefault(),ve?ia():Qt(0))}),d.addEventListener("input",()=>{N===0&&Mt&&ra()&&y(Mt,!1)}),qa(),ce(S.L,S.W,S.H),Promise.all([customElements.whenDefined("esa-text-field"),customElements.whenDefined("esa-radio-group")]).then(()=>{he(),Ct(),St(),be()})}
