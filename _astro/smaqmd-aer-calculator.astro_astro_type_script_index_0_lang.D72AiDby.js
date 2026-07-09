/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=globalThis,Y=j.ShadowRoot&&(j.ShadyCSS===void 0||j.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,X=Symbol(),ae=new WeakMap;let ge=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==X)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Y&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ae.set(t,e))}return e}toString(){return this.cssText}};const Pe=i=>new ge(typeof i=="string"?i:i+"",void 0,X),ve=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((s,r,a)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[a+1],i[0]);return new ge(t,i,X)},ke=(i,e)=>{if(Y)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),r=j.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}},ne=Y?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return Pe(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Te,defineProperty:Ue,getOwnPropertyDescriptor:Me,getOwnPropertyNames:Oe,getOwnPropertySymbols:He,getPrototypeOf:qe}=Object,K=globalThis,le=K.trustedTypes,Re=le?le.emptyScript:"",Le=K.reactiveElementPolyfillSupport,q=(i,e)=>i,Z={toAttribute(i,e){switch(e){case Boolean:i=i?Re:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},_e=(i,e)=>!Te(i,e),ce={attribute:!0,type:String,converter:Z,reflect:!1,useDefault:!1,hasChanged:_e};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;let k=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ce){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&Ue(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){const{get:r,set:a}=Me(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:r,set(n){const p=r?.call(this);a?.call(this,n),this.requestUpdate(e,p,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ce}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;const e=qe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){const t=this.properties,s=[...Oe(t),...He(t)];for(const r of s)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(ne(r))}else e!==void 0&&t.push(ne(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ke(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const a=(s.converter?.toAttribute!==void 0?s.converter:Z).toAttribute(t,s.type);this._$Em=e,a==null?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(e,t){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const a=s.getPropertyOptions(r),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:Z;this._$Em=r;const p=n.fromAttribute(t,a.type);this[r]=p??this._$Ej?.get(r)??p,this._$Em=null}}requestUpdate(e,t,s,r=!1,a){if(e!==void 0){const n=this.constructor;if(r===!1&&(a=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??_e)(a,t)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:a},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,a]of this._$Ep)this[r]=a;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,a]of s){const{wrapped:n}=a,p=this[r];n!==!0||this._$AL.has(r)||p===void 0||this.C(r,void 0,a,p)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[q("elementProperties")]=new Map,k[q("finalized")]=new Map,Le?.({ReactiveElement:k}),(K.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Q=globalThis,de=i=>i,W=Q.trustedTypes,he=W?W.createPolicy("lit-html",{createHTML:i=>i}):void 0,ye="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,be="?"+x,De=`<${be}>`,N=document,R=()=>N.createComment(""),L=i=>i===null||typeof i!="object"&&typeof i!="function",ee=Array.isArray,Be=i=>ee(i)||typeof i?.[Symbol.iterator]=="function",J=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ue=/-->/g,pe=/>/g,z=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),fe=/'/g,me=/"/g,Ae=/^(?:script|style|textarea|title)$/i,Fe=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),S=Fe(1),U=Symbol.for("lit-noChange"),$=Symbol.for("lit-nothing"),$e=new WeakMap,C=N.createTreeWalker(N,129);function xe(i,e){if(!ee(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return he!==void 0?he.createHTML(e):e}const Ie=(i,e)=>{const t=i.length-1,s=[];let r,a=e===2?"<svg>":e===3?"<math>":"",n=H;for(let p=0;p<t;p++){const d=i[p];let m,f,u=-1,g=0;for(;g<d.length&&(n.lastIndex=g,f=n.exec(d),f!==null);)g=n.lastIndex,n===H?f[1]==="!--"?n=ue:f[1]!==void 0?n=pe:f[2]!==void 0?(Ae.test(f[2])&&(r=RegExp("</"+f[2],"g")),n=z):f[3]!==void 0&&(n=z):n===z?f[0]===">"?(n=r??H,u=-1):f[1]===void 0?u=-2:(u=n.lastIndex-f[2].length,m=f[1],n=f[3]===void 0?z:f[3]==='"'?me:fe):n===me||n===fe?n=z:n===ue||n===pe?n=H:(n=z,r=void 0);const v=n===z&&i[p+1].startsWith("/>")?" ":"";a+=n===H?d+De:u>=0?(s.push(m),d.slice(0,u)+ye+d.slice(u)+x+v):d+x+(u===-2?p:v)}return[xe(i,a+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class D{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let a=0,n=0;const p=e.length-1,d=this.parts,[m,f]=Ie(e,t);if(this.el=D.createElement(m,s),C.currentNode=this.el.content,t===2||t===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(r=C.nextNode())!==null&&d.length<p;){if(r.nodeType===1){if(r.hasAttributes())for(const u of r.getAttributeNames())if(u.endsWith(ye)){const g=f[n++],v=r.getAttribute(u).split(x),E=/([.?@])?(.*)/.exec(g);d.push({type:1,index:a,name:E[2],strings:v,ctor:E[1]==="."?je:E[1]==="?"?We:E[1]==="@"?Ke:G}),r.removeAttribute(u)}else u.startsWith(x)&&(d.push({type:6,index:a}),r.removeAttribute(u));if(Ae.test(r.tagName)){const u=r.textContent.split(x),g=u.length-1;if(g>0){r.textContent=W?W.emptyScript:"";for(let v=0;v<g;v++)r.append(u[v],R()),C.nextNode(),d.push({type:2,index:++a});r.append(u[g],R())}}}else if(r.nodeType===8)if(r.data===be)d.push({type:2,index:a});else{let u=-1;for(;(u=r.data.indexOf(x,u+1))!==-1;)d.push({type:7,index:a}),u+=x.length-1}a++}}static createElement(e,t){const s=N.createElement("template");return s.innerHTML=e,s}}function M(i,e,t=i,s){if(e===U)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl;const a=L(e)?void 0:e._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),a===void 0?r=void 0:(r=new a(i),r._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=M(i,r._$AS(i,e.values),r,s)),e}class Ve{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??N).importNode(t,!0);C.currentNode=r;let a=C.nextNode(),n=0,p=0,d=s[0];for(;d!==void 0;){if(n===d.index){let m;d.type===2?m=new B(a,a.nextSibling,this,e):d.type===1?m=new d.ctor(a,d.name,d.strings,this,e):d.type===6&&(m=new Ge(a,this,e)),this._$AV.push(m),d=s[++p]}n!==d?.index&&(a=C.nextNode(),n++)}return C.currentNode=N,r}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class B{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=$,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),L(e)?e===$||e==null||e===""?(this._$AH!==$&&this._$AR(),this._$AH=$):e!==this._$AH&&e!==U&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Be(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==$&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(N.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=D.createElement(xe(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{const a=new Ve(r,this),n=a.u(this.options);a.p(t),this.T(n),this._$AH=a}}_$AC(e){let t=$e.get(e.strings);return t===void 0&&$e.set(e.strings,t=new D(e)),t}k(e){ee(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const a of e)r===t.length?t.push(s=new B(this.O(R()),this.O(R()),this,this.options)):s=t[r],s._$AI(a),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=de(e).nextSibling;de(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class G{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,a){this.type=1,this._$AH=$,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=$}_$AI(e,t=this,s,r){const a=this.strings;let n=!1;if(a===void 0)e=M(this,e,t,0),n=!L(e)||e!==this._$AH&&e!==U,n&&(this._$AH=e);else{const p=e;let d,m;for(e=a[0],d=0;d<a.length-1;d++)m=M(this,p[s+d],t,d),m===U&&(m=this._$AH[d]),n||=!L(m)||m!==this._$AH[d],m===$?e=$:e!==$&&(e+=(m??"")+a[d+1]),this._$AH[d]=m}n&&!r&&this.j(e)}j(e){e===$?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class je extends G{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===$?void 0:e}}class We extends G{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==$)}}class Ke extends G{constructor(e,t,s,r,a){super(e,t,s,r,a),this.type=5}_$AI(e,t=this){if((e=M(this,e,t,0)??$)===U)return;const s=this._$AH,r=e===$&&s!==$||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==$&&(s===$||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ge{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}}const Je=Q.litHtmlPolyfillSupport;Je?.(D,B),(Q.litHtmlVersions??=[]).push("3.3.3");const Ze=(i,e,t)=>{const s=t?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const a=t?.renderBefore??null;s._$litPart$=r=new B(e.insertBefore(R(),a),a,void 0,t??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const te=globalThis;class T extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ze(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return U}}T._$litElement$=!0,T.finalized=!0,te.litElementHydrateSupport?.({LitElement:T});const Ye=te.litElementPolyfillSupport;Ye?.({LitElement:T});(te.litElementVersions??=[]).push("4.2.2");class Xe extends T{constructor(){super(),this.onInput=e=>{this.value=e.target.value,this.internals.setFormValue(this.value),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0,composed:!0}))},this.label="",this.size="md",this.placeholder="",this.helpText="",this.errorText="",this.required=!1,this.disabled=!1,this.type="text",this.value="",this.internals=this.attachInternals()}static{this.formAssociated=!0}static{this.properties={label:{type:String},size:{type:String,reflect:!0},placeholder:{type:String},helpText:{type:String,attribute:"help-text"},errorText:{type:String,attribute:"error-text"},required:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},type:{type:String},value:{type:String}}}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(this.value)}render(){const e=!!this.errorText;return S`
      <div class="field ${e?"field--error":""}">
        ${this.label?S`<label class="label" for="input"
              >${this.label}${this.required?S`<span class="required" aria-label="required">*</span>`:null}</label
            >`:null}
        <input
          id="input"
          class="input"
          .type=${this.type}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-invalid=${e?"true":"false"}
          @input=${this.onInput}
        />
        ${e?S`<p class="error">${this.errorText}</p>`:this.helpText?S`<p class="help">${this.helpText}</p>`:null}
      </div>
    `}static{this.styles=ve`
    :host {
      --_field-padding-y: var(--form-padding-y-md, 0.5rem);
      --_field-padding-x: var(--form-padding-x-md, 0.75rem);
      --_field-font-size: var(--form-font-size-md, 0.9375rem);
      --_field-height: var(--form-height-md, 40px);
      --_field-radius: var(--form-radius-md, 0.5rem);
      --_field-border-color: var(--form-border-color, #e5e5e5);
      --_label-font-size: var(--type-size-200, 0.9375rem);
      display: block;
      font-family: var(--font-sans, sans-serif);
    }
    :host([size='xs']) {
      --_field-padding-y: var(--form-padding-y-xs, 0.25rem);
      --_field-padding-x: var(--form-padding-x-xs, 0.5rem);
      --_field-font-size: var(--form-font-size-xs, 0.8125rem);
      --_field-height: var(--form-height-xs, 28px);
      --_field-radius: var(--form-radius-xs, 0.25rem);
      --_label-font-size: var(--type-size-050, 0.8125rem);
    }
    :host([size='sm']) {
      --_field-padding-y: var(--form-padding-y-sm, 0.375rem);
      --_field-padding-x: var(--form-padding-x-sm, 0.5rem);
      --_field-font-size: var(--form-font-size-sm, 0.875rem);
      --_field-height: var(--form-height-sm, 32px);
      --_field-radius: var(--form-radius-sm, 0.25rem);
      --_label-font-size: var(--type-size-150, 0.875rem);
    }
    :host([size='lg']) {
      --_field-padding-y: var(--form-padding-y-lg, 0.75rem);
      --_field-padding-x: var(--form-padding-x-lg, 1rem);
      --_field-font-size: var(--form-font-size-lg, 1.125rem);
      --_field-height: var(--form-height-lg, 48px);
      --_field-radius: var(--form-radius-lg, 0.5rem);
      --_label-font-size: var(--type-size-300, 1.125rem);
    }

    .field {
      display: flex;
      flex-direction: column;
    }

    .label {
      color: var(--form-label-color, #171717);
      font-weight: var(--font-weight-medium, 450);
      font-size: var(--_label-font-size);
      margin-block-end: var(--form-label-gap, 4px);
    }
    .required {
      color: var(--color-danger-strong, #ce2c31);
      margin-inline-start: 2px;
    }

    .input {
      width: 100%;
      height: var(--_field-height);
      padding: var(--_field-padding-y) var(--_field-padding-x);
      font-family: inherit;
      font-size: var(--_field-font-size);
      color: var(--form-text-color, #171717);
      background: var(--form-bg, #fff);
      border: var(--form-border-width, 1px) solid var(--_field-border-color);
      border-radius: var(--_field-radius);
      outline: none;
      box-sizing: border-box;
      transition:
        border-color var(--transition-fast, 150ms ease),
        box-shadow var(--transition-fast, 150ms ease);
    }
    .input::placeholder {
      color: var(--form-placeholder-color, #737373);
    }
    .input:focus {
      --_field-border-color: var(--form-border-color-focus, #43608a);
      box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
    }
    .input:disabled {
      background: var(--form-bg-disabled, #efefef);
      opacity: 0.5;
      cursor: not-allowed;
    }

    .field--error .input {
      --_field-border-color: var(--form-border-color-error, #ef4444);
    }
    .field--error .input:focus {
      box-shadow: 0 0 0 var(--focus-ring-width) var(--form-border-color-error, #ef4444);
    }

    .help,
    .error {
      margin: 0;
      margin-block-start: var(--form-help-gap, 4px);
      font-size: var(--type-size-100, 0.75rem);
    }
    .help {
      color: var(--form-help-color, #737373);
    }
    .error {
      color: var(--form-error-color, var(--color-danger-strong, #ce2c31));
    }
  `}}customElements.get("esa-text-field")||customElements.define("esa-text-field",Xe);let Qe=0;class et extends T{constructor(){super(),this.warnedNoName=!1,this.selectOption=e=>{e.disabled||(this.value=e.value,this.internals.setFormValue(this.value),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0,composed:!0})))},this.onKeydown=(e,t)=>{(e.key===" "||e.key==="Enter")&&(e.preventDefault(),this.selectOption(t))},this.options=[],this.label="",this.ariaLabel=null,this.size="md",this.orientation="vertical",this.value=null,this.internals=this.attachInternals(),this.uid=`esa-radio-${++Qe}`}static{this.formAssociated=!0}static{this.properties={options:{type:Array},label:{type:String},ariaLabel:{type:String,attribute:"aria-label"},size:{type:String,reflect:!0},orientation:{type:String,reflect:!0},value:{type:String}}}willUpdate(e){if(e.has("options")&&typeof this.options=="string")try{this.options=JSON.parse(this.options)}catch{this.options=[]}!this.warnedNoName&&!this.label&&!this.ariaLabel&&(this.warnedNoName=!0,console.warn("<esa-radio-group> has no accessible name. Set `label` (visible) or `aria-label` (invisible) so screen readers announce the group."))}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(this.value)}isSelected(e){return this.value===e}render(){const e=`${this.uid}-label`;return S`
      ${this.label?S`<span class="group-label" id=${e}>${this.label}</span>`:null}
      <div
        class="items"
        role="radiogroup"
        aria-labelledby=${this.label?e:void 0}
        aria-label=${!this.label&&this.ariaLabel?this.ariaLabel:void 0}
      >
        ${this.options.map((t,s)=>{const r=this.isSelected(t.value),a=t.disabled??!1,n=`${this.uid}-option-${s}`;return S`
            <label
              class="item ${a?"item--disabled":""}"
              @keydown=${p=>this.onKeydown(p,t)}
              @click=${()=>this.selectOption(t)}
            >
              <span
                class="circle ${r?"circle--selected":""}"
                role="radio"
                aria-checked=${String(r)}
                aria-disabled=${String(a)}
                aria-labelledby=${n}
                tabindex=${a?-1:0}
              >
                <span class="dot"></span>
              </span>
              <span class="item-label" id=${n}>${t.label}</span>
            </label>
          `})}
      </div>
    `}static{this.styles=ve`
    :host {
      --_radio-size: 20px;
      --_radio-dot-size: 10px;
      --_radio-font-size: var(--form-font-size-md, 0.9375rem);
      display: block;
    }
    :host([size='xs']) {
      --_radio-size: 14px;
      --_radio-dot-size: 7px;
      --_radio-font-size: var(--form-font-size-xs, 0.8125rem);
    }
    :host([size='sm']) {
      --_radio-size: 16px;
      --_radio-dot-size: 8px;
      --_radio-font-size: var(--form-font-size-sm, 0.875rem);
    }
    :host([size='lg']) {
      --_radio-size: 24px;
      --_radio-dot-size: 12px;
      --_radio-font-size: var(--form-font-size-lg, 1.125rem);
    }

    .group-label {
      display: block;
      margin-bottom: var(--spacing-200, 8px);
      font-family: var(--font-sans, sans-serif);
      font-size: var(--_radio-font-size);
      font-weight: var(--font-weight-medium, 450);
      color: var(--color-text-primary, #171717);
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-200, 8px);
    }
    :host([orientation='horizontal']) .items {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--spacing-400, 16px);
    }

    .item {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-200, 8px);
      cursor: pointer;
      user-select: none;
    }
    .item--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--_radio-size);
      height: var(--_radio-size);
      flex-shrink: 0;
      border: var(--form-border-width, 2px) solid var(--form-border-color, #d4d4d4);
      border-radius: 50%;
      background: var(--form-bg, #fff);
      transition:
        border-color var(--transition-fast, 150ms ease),
        box-shadow var(--transition-fast, 150ms ease);
    }
    .circle--selected {
      border-color: var(--color-primary, #43608a);
    }
    .circle:focus-visible {
      outline: none;
      border-color: var(--form-border-color-focus, #43608a);
      box-shadow: 0 0 0 var(--focus-ring-width)
        var(--focus-ring-color);
    }

    .dot {
      width: var(--_radio-dot-size);
      height: var(--_radio-dot-size);
      border-radius: 50%;
      background: transparent;
      transition: background var(--transition-fast, 150ms ease);
    }
    .circle--selected .dot {
      background: var(--color-primary, #43608a);
    }

    .item-label {
      font-family: var(--font-sans, sans-serif);
      font-size: var(--_radio-font-size);
      color: var(--color-text-primary, #171717);
      line-height: 1.4;
    }
  `}}customElements.get("esa-radio-group")||customElements.define("esa-radio-group",et);const y=document.querySelector("[data-aer]");if(y){const i=o=>y.querySelector(o),e=o=>Array.from(y.querySelectorAll(o)),t=(o,l)=>{o&&(o.hidden=!l)},s=(o,l)=>{const c=l?`[data-field="${o}"][data-cleaner="${l}"]`:`[data-field="${o}"]:not([data-cleaner])`,h=y.querySelector(c);return(h&&h.value!=null?String(h.value):"").trim()},r=(o,l)=>{const c=parseFloat(s(o,l));return Number.isFinite(c)?c:NaN},a=()=>{switch(s("roomMethod")){case"dimensions":return r("length")*r("width")*r("height");case"area":return r("area")*r("height");case"volume":return r("volume");default:return NaN}},n=o=>{const l=Number.isFinite(r("refHeight",o))?r("refHeight",o):8;switch(s("refMethod",o)){case"dimensions":return r("refLength",o)*r("refWidth",o)*l;case"area":return r("refArea",o)*l;case"volume":return r("refVolume",o);default:return NaN}},p=o=>{let l;if(s("unit",o)==="airflow")l=r("airflow",o);else{const c=r("ach",o);l=n(o)*c/60}return Number.isFinite(l)&&l>0?l:0},d=()=>e("[data-cleaner-block]:not([data-removing])"),m=()=>d().reduce((o,l)=>o+p(l.dataset.cleanerBlock),0),f=(o,l=0)=>o.toLocaleString("en-US",{maximumFractionDigits:l,minimumFractionDigits:0}),u=(o,l,c)=>{const h=y.querySelector(`[data-metric="${o}"] .esa-stat__value`);if(h&&(h.textContent=l,c)){const _=document.createElement("span");_.className="smaqmd-aer__unit",_.textContent=c,h.appendChild(_)}},g=(o,l,c)=>Array.from(o.querySelectorAll(`[data-r="${l}"]`)).forEach(h=>h.textContent=c),v=(o,l)=>Array.from(o.querySelectorAll("[data-verdict]")).forEach(c=>t(c,c.dataset.verdict===l)),E=i("[data-cleaners]"),Se=y.querySelector("[data-cleaner-template]");let se=0;const re=()=>{const o=Se.content.cloneNode(!0),l=o.querySelector("[data-cleaner-block]"),c=String(++se);l.setAttribute("data-cleaner-block",c),l.querySelectorAll("[data-cleaner]").forEach(h=>h.setAttribute("data-cleaner",c)),E.appendChild(o),P()},ie=()=>{E.replaceChildren(),se=0,re()},Ee=window.matchMedia("(prefers-reduced-motion: reduce)").matches,we=o=>{if(o.setAttribute("data-removing",""),Ee){o.remove(),P();return}const l=o.offsetHeight;o.style.overflow="hidden",o.style.boxSizing="border-box",o.style.blockSize=`${l}px`,o.getBoundingClientRect();const c=180;o.style.transition=`block-size ${c}ms ease, opacity ${c}ms ease, padding-block ${c}ms ease, margin-block ${c}ms ease, border-block ${c}ms ease`,o.style.blockSize="0",o.style.opacity="0",o.style.paddingBlock="0",o.style.marginBlock="0",o.style.borderBlock="0";let h=!1;const _=()=>{h||(h=!0,o.remove(),P())};o.addEventListener("transitionend",A=>{const b=A.propertyName;(b==="block-size"||b==="height")&&_()}),window.setTimeout(_,c+60),P()},ze=()=>{const o=s("roomMethod");e("[data-room]").forEach(h=>t(h,h.dataset.room.split(" ").includes(o)));const l=d();l.forEach((h,_)=>{const A=h.querySelector(".smaqmd-aer__cleaner-title");A&&(A.textContent=`Air cleaner ${_+1}`),t(h.querySelector("[data-remove-cleaner]"),l.length>1);const b=h.dataset.cleanerBlock,F=s("unit",b);t(h.querySelector(`[data-unit="airflow"][data-cleaner="${b}"]`),F==="airflow"),t(h.querySelector(`[data-unit="ach"][data-cleaner="${b}"]`),F==="ach");const I=s("refMethod",b);h.querySelectorAll("[data-refroom]").forEach(O=>t(O,O.dataset.refroom.split(" ").includes(I)))});const c=r("height");t(i('[data-hint="height"]'),Number.isFinite(c)&&c>0&&c<7.5)},P=()=>{ze();const o=i("[data-result]"),l=(w,V)=>t(o.querySelector(`[data-group="${w}"]`),V),c=w=>Array.from(o.querySelectorAll("[data-prompt]")).forEach(V=>t(V,V.dataset.prompt===w)),h=Number.isFinite(r("target"))&&r("target")>0?r("target"):2;g(o,"target",f(h,2));const _=m(),A=a(),b=_>0,F=Number.isFinite(A)&&A>0;if(!b){l("capacity",!1),l("ach",!1),v(o,"none"),c("empty");return}const I=_*60/h,O=d().length;if(g(o,"setup",O>1?`Your ${O} air cleaners together`:"Your air cleaner"),u("maxvol",f(I,0),"ft³"),u("maxarea",f(I/8,0),"ft²"),l("capacity",!0),F){const w=_/A*60;u("ach",f(w,1)),g(o,"ach",f(w,1)),l("ach",!0),v(o,w>=h?"pass":"fail"),c(null)}else l("ach",!1),v(o,"none"),c("addroom")},Ce=o=>{let l=o.replace(/[^0-9.]/g,"");const c=l.indexOf(".");return c!==-1&&(l=l.slice(0,c+1)+l.slice(c+1).replace(/\./g,"")),l},oe=o=>{const l=o.target;if(l&&l.tagName==="ESA-TEXT-FIELD"){const c=Ce(l.value??"");c!==l.value&&(l.value=c)}P()};y.addEventListener("change",oe),y.addEventListener("input",oe),y.addEventListener("click",o=>{const l=o.target;l.closest("[data-add-cleaner]")&&(o.preventDefault(),re());const c=l.closest("[data-remove-cleaner]");if(c){o.preventDefault();const h=c.closest("[data-cleaner-block]");h&&!h.hasAttribute("data-removing")&&we(h)}});const Ne=()=>{const o=(l,c)=>{const h=y.querySelector(l);h&&(h.value=c)};o('[data-field="roomMethod"]',"dimensions"),o('[data-field="target"]',"2"),["length","width","height","area","volume"].forEach(l=>o(`[data-field="${l}"]:not([data-cleaner])`,""))};y.querySelector("form")?.addEventListener("reset",()=>requestAnimationFrame(()=>{Ne(),ie()})),ie(),Promise.all([customElements.whenDefined("esa-text-field"),customElements.whenDefined("esa-radio-group")]).then(P)}
