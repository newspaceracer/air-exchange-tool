/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const T=globalThis,R=T.ShadowRoot&&(T.ShadyCSS===void 0||T.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,D=Symbol(),B=new WeakMap;let Y=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==D)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(R&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=B.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&B.set(t,e))}return e}toString(){return this.cssText}};const ne=r=>new Y(typeof r=="string"?r:r+"",void 0,D),ee=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((i,s,o)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[o+1],r[0]);return new Y(t,r,D)},ae=(r,e)=>{if(R)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=T.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,r.appendChild(i)}},q=R?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return ne(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:le,defineProperty:he,getOwnPropertyDescriptor:de,getOwnPropertyNames:ce,getOwnPropertySymbols:pe,getPrototypeOf:fe}=Object,O=globalThis,V=O.trustedTypes,ue=V?V.emptyScript:"",me=O.reactiveElementPolyfillSupport,S=(r,e)=>r,N={toAttribute(r,e){switch(e){case Boolean:r=r?ue:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},te=(r,e)=>!le(r,e),W={attribute:!0,type:String,converter:N,reflect:!1,useDefault:!1,hasChanged:te};Symbol.metadata??=Symbol("metadata"),O.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=W){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&he(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:o}=de(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){const h=s?.call(this);o?.call(this,n),this.requestUpdate(e,h,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??W}static _$Ei(){if(this.hasOwnProperty(S("elementProperties")))return;const e=fe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(S("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(S("properties"))){const t=this.properties,i=[...ce(t),...pe(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(q(s))}else e!==void 0&&t.push(q(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ae(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const o=(i.converter?.toAttribute!==void 0?i.converter:N).toAttribute(t,i.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const o=i.getPropertyOptions(s),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:N;this._$Em=s;const h=n.fromAttribute(t,o.type);this[s]=h??this._$Ej?.get(s)??h,this._$Em=null}}requestUpdate(e,t,i,s=!1,o){if(e!==void 0){const n=this.constructor;if(s===!1&&(o=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??te)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,o]of i){const{wrapped:n}=o,h=this[s];n!==!0||this._$AL.has(s)||h===void 0||this.C(s,void 0,o,h)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[S("elementProperties")]=new Map,b[S("finalized")]=new Map,me?.({ReactiveElement:b}),(O.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const I=globalThis,F=r=>r,U=I.trustedTypes,K=U?U.createPolicy("lit-html",{createHTML:r=>r}):void 0,ie="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,se="?"+$,$e=`<${se}>`,_=document,w=()=>_.createComment(""),z=r=>r===null||typeof r!="object"&&typeof r!="function",L=Array.isArray,ge=r=>L(r)||typeof r?.[Symbol.iterator]=="function",M=`[ 	
\f\r]`,E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,J=/-->/g,Z=/>/g,g=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),G=/'/g,Q=/"/g,re=/^(?:script|style|textarea|title)$/i,ve=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),f=ve(1),x=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),X=new WeakMap,v=_.createTreeWalker(_,129);function oe(r,e){if(!L(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return K!==void 0?K.createHTML(e):e}const _e=(r,e)=>{const t=r.length-1,i=[];let s,o=e===2?"<svg>":e===3?"<math>":"",n=E;for(let h=0;h<t;h++){const a=r[h];let d,p,l=-1,u=0;for(;u<a.length&&(n.lastIndex=u,p=n.exec(a),p!==null);)u=n.lastIndex,n===E?p[1]==="!--"?n=J:p[1]!==void 0?n=Z:p[2]!==void 0?(re.test(p[2])&&(s=RegExp("</"+p[2],"g")),n=g):p[3]!==void 0&&(n=g):n===g?p[0]===">"?(n=s??E,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,d=p[1],n=p[3]===void 0?g:p[3]==='"'?Q:G):n===Q||n===G?n=g:n===J||n===Z?n=E:(n=g,s=void 0);const m=n===g&&r[h+1].startsWith("/>")?" ":"";o+=n===E?a+$e:l>=0?(i.push(d),a.slice(0,l)+ie+a.slice(l)+$+m):a+$+(l===-2?h:m)}return[oe(r,o+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class C{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,n=0;const h=e.length-1,a=this.parts,[d,p]=_e(e,t);if(this.el=C.createElement(d,i),v.currentNode=this.el.content,t===2||t===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=v.nextNode())!==null&&a.length<h;){if(s.nodeType===1){if(s.hasAttributes())for(const l of s.getAttributeNames())if(l.endsWith(ie)){const u=p[n++],m=s.getAttribute(l).split($),k=/([.?@])?(.*)/.exec(u);a.push({type:1,index:o,name:k[2],strings:m,ctor:k[1]==="."?ye:k[1]==="?"?xe:k[1]==="@"?Ae:H}),s.removeAttribute(l)}else l.startsWith($)&&(a.push({type:6,index:o}),s.removeAttribute(l));if(re.test(s.tagName)){const l=s.textContent.split($),u=l.length-1;if(u>0){s.textContent=U?U.emptyScript:"";for(let m=0;m<u;m++)s.append(l[m],w()),v.nextNode(),a.push({type:2,index:++o});s.append(l[u],w())}}}else if(s.nodeType===8)if(s.data===se)a.push({type:2,index:o});else{let l=-1;for(;(l=s.data.indexOf($,l+1))!==-1;)a.push({type:7,index:o}),l+=$.length-1}o++}}static createElement(e,t){const i=_.createElement("template");return i.innerHTML=e,i}}function A(r,e,t=r,i){if(e===x)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl;const o=z(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(r),s._$AT(r,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=A(r,s._$AS(r,e.values),s,i)),e}class be{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??_).importNode(t,!0);v.currentNode=s;let o=v.nextNode(),n=0,h=0,a=i[0];for(;a!==void 0;){if(n===a.index){let d;a.type===2?d=new P(o,o.nextSibling,this,e):a.type===1?d=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(d=new Ee(o,this,e)),this._$AV.push(d),a=i[++h]}n!==a?.index&&(o=v.nextNode(),n++)}return v.currentNode=_,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class P{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),z(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==x&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ge(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(_.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=C.createElement(oe(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const o=new be(s,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=X.get(e.strings);return t===void 0&&X.set(e.strings,t=new C(e)),t}k(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const o of e)s===t.length?t.push(i=new P(this.O(w()),this.O(w()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=F(e).nextSibling;F(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,o){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=c}_$AI(e,t=this,i,s){const o=this.strings;let n=!1;if(o===void 0)e=A(this,e,t,0),n=!z(e)||e!==this._$AH&&e!==x,n&&(this._$AH=e);else{const h=e;let a,d;for(e=o[0],a=0;a<o.length-1;a++)d=A(this,h[i+a],t,a),d===x&&(d=this._$AH[a]),n||=!z(d)||d!==this._$AH[a],d===c?e=c:e!==c&&(e+=(d??"")+o[a+1]),this._$AH[a]=d}n&&!s&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ye extends H{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}}class xe extends H{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}}class Ae extends H{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??c)===x)return;const i=this._$AH,s=e===c&&i!==c||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==c&&(i===c||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ee{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}}const Se=I.litHtmlPolyfillSupport;Se?.(C,P),(I.litHtmlVersions??=[]).push("3.3.3");const we=(r,e,t)=>{const i=t?.renderBefore??e;let s=i._$litPart$;if(s===void 0){const o=t?.renderBefore??null;i._$litPart$=s=new P(e.insertBefore(w(),o),o,void 0,t??{})}return s._$AI(r),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=globalThis;class y extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=we(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return x}}y._$litElement$=!0,y.finalized=!0,j.litElementHydrateSupport?.({LitElement:y});const ze=j.litElementPolyfillSupport;ze?.({LitElement:y});(j.litElementVersions??=[]).push("4.2.2");class Ce extends y{constructor(){super(),this.onInput=e=>{this.value=e.target.value,this.internals.setFormValue(this.value),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0,composed:!0}))},this.label="",this.size="md",this.placeholder="",this.helpText="",this.errorText="",this.required=!1,this.disabled=!1,this.type="text",this.value="",this.prefix="",this.suffix="",this.internals=this.attachInternals()}static{this.formAssociated=!0}static{this.properties={label:{type:String},size:{type:String,reflect:!0},placeholder:{type:String},helpText:{type:String,attribute:"help-text"},errorText:{type:String,attribute:"error-text"},required:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},type:{type:String},value:{type:String},prefix:{type:String},suffix:{type:String}}}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(this.value)}render(){const e=!!this.errorText;return f`
      <div class="field ${e?"field--error":""}">
        ${this.label?f`<label class="label" for="input"
              >${this.label}${this.required?f`<span class="required" aria-label="required">*</span>`:null}</label
            >`:null}
        <div class="control">
          ${this.prefix?f`<span class="affix affix--prefix" aria-hidden="true">${this.prefix}</span>`:null}
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
          ${this.suffix?f`<span class="affix affix--suffix" aria-hidden="true">${this.suffix}</span>`:null}
        </div>
        ${e?f`<p class="error">${this.errorText}</p>`:this.helpText?f`<p class="help">${this.helpText}</p>`:null}
      </div>
    `}static{this.styles=ee`
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
      font-weight: var(--form-label-font-weight, var(--font-weight-medium, 450));
      font-size: var(--form-label-font-size, var(--_label-font-size));
      margin-block-end: var(--form-label-gap, 4px);
    }
    .required {
      color: var(--color-danger-strong, #ce2c31);
      margin-inline-start: 2px;
    }

    /* The box chrome (border / height / radius / focus ring) lives on the wrapper
       so any affixes sit flush inside the same border as the input. */
    .control {
      display: flex;
      align-items: stretch;
      height: var(--_field-height);
      background: var(--form-bg, #fff);
      border: var(--form-border-width, 1px) solid var(--_field-border-color);
      border-radius: var(--_field-radius);
      box-sizing: border-box;
      overflow: hidden;
      transition:
        border-color var(--transition-fast, 150ms ease),
        box-shadow var(--transition-fast, 150ms ease);
    }
    .control:focus-within {
      --_field-border-color: var(--form-border-color-focus, #43608a);
      box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
    }
    .control:has(.input:disabled) {
      background: var(--form-bg-disabled, #efefef);
    }

    .input {
      flex: 1 1 auto;
      min-width: 0;
      width: 100%;
      height: 100%;
      padding: var(--_field-padding-y) var(--_field-padding-x);
      font-family: inherit;
      font-size: var(--_field-font-size);
      color: var(--form-text-color, #171717);
      background: transparent;
      border: none;
      outline: none;
      box-sizing: border-box;
    }
    .input::placeholder {
      color: var(--form-placeholder-color, #737373);
    }
    .input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Segmented addon inside the field box — a sunken tint divided from the input
       by a hairline. The divider stays neutral on focus (uses the static border
       color, not the dynamic --_field-border-color). */
    .affix {
      display: inline-flex;
      align-items: center;
      flex: none;
      padding-inline: var(--_field-padding-x);
      color: var(--form-affix-color, var(--color-text-secondary, #737373));
      font-size: var(--_field-font-size);
      background: var(--form-affix-bg, var(--color-surface-sunken, #efefef));
      user-select: none;
      white-space: nowrap;
    }
    .affix--prefix {
      border-inline-end: var(--form-border-width, 1px) solid
        var(--form-affix-border-color, var(--form-border-color, #e5e5e5));
    }
    .affix--suffix {
      border-inline-start: var(--form-border-width, 1px) solid
        var(--form-affix-border-color, var(--form-border-color, #e5e5e5));
    }

    .field--error .control {
      --_field-border-color: var(--form-border-color-error, #ef4444);
    }
    .field--error .control:focus-within {
      box-shadow: 0 0 0 var(--focus-ring-width, 2px) var(--form-border-color-error, #ef4444);
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
  `}}customElements.get("esa-text-field")||customElements.define("esa-text-field",Ce);class Pe extends y{constructor(){super(),this.selectOption=e=>{e.disabled||(this.value=e.value,this.internals.setFormValue(this.value),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0,composed:!0})))},this.onKeydown=(e,t)=>{(e.key===" "||e.key==="Enter")&&(e.preventDefault(),this.selectOption(t))},this.options=[],this.label="",this.size="md",this.orientation="vertical",this.value=null,this.internals=this.attachInternals()}static{this.formAssociated=!0}static{this.properties={options:{type:Array},label:{type:String},size:{type:String,reflect:!0},orientation:{type:String,reflect:!0},value:{type:String}}}willUpdate(e){if(e.has("options")&&typeof this.options=="string")try{this.options=JSON.parse(this.options)}catch{this.options=[]}}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(this.value)}isSelected(e){return this.value===e}render(){return f`
      ${this.label?f`<span class="group-label">${this.label}</span>`:null}
      <div class="items" role="radiogroup" aria-label=${this.label}>
        ${this.options.map(e=>{const t=this.isSelected(e.value),i=e.disabled??!1;return f`
            <label
              class="item ${i?"item--disabled":""}"
              @keydown=${s=>this.onKeydown(s,e)}
              @click=${()=>this.selectOption(e)}
            >
              <span
                class="circle ${t?"circle--selected":""}"
                role="radio"
                aria-checked=${String(t)}
                aria-disabled=${String(i)}
                tabindex=${i?-1:0}
              >
                <span class="dot"></span>
              </span>
              <span class="item-label">${e.label}</span>
            </label>
          `})}
      </div>
    `}static{this.styles=ee`
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
  `}}customElements.get("esa-radio-group")||customElements.define("esa-radio-group",Pe);
