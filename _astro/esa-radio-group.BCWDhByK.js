import{i as s,b as r,a as l}from"./lit-element.DWovE5T-.js";class c extends s{constructor(){super(),this.onInput=e=>{this.value=e.target.value,this.internals.setFormValue(this.value),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0,composed:!0}))},this.label="",this.size="md",this.placeholder="",this.helpText="",this.errorText="",this.required=!1,this.disabled=!1,this.type="text",this.value="",this.prefix="",this.suffix="",this.internals=this.attachInternals()}static{this.formAssociated=!0}static{this.properties={label:{type:String},size:{type:String,reflect:!0},placeholder:{type:String},helpText:{type:String,attribute:"help-text"},errorText:{type:String,attribute:"error-text"},required:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},type:{type:String},value:{type:String},prefix:{type:String},suffix:{type:String}}}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(this.value)}render(){const e=!!this.errorText;return r`
      <div class="field ${e?"field--error":""}">
        ${this.label?r`<label class="label" for="input"
              >${this.label}${this.required?r`<span class="required" aria-label="required">*</span>`:null}</label
            >`:null}
        <div class="control">
          ${this.prefix?r`<span class="affix affix--prefix" aria-hidden="true">${this.prefix}</span>`:null}
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
          ${this.suffix?r`<span class="affix affix--suffix" aria-hidden="true">${this.suffix}</span>`:null}
        </div>
        ${e?r`<p class="error">${this.errorText}</p>`:this.helpText?r`<p class="help">${this.helpText}</p>`:null}
      </div>
    `}static{this.styles=l`
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
      border-radius: var(--_field-radius);
      box-shadow: inset 0 0 0 var(--form-border-width, 1px) var(--_field-border-color);
      box-sizing: border-box;
      overflow: hidden;
      transition:
        border-color var(--transition-fast, 150ms ease),
        box-shadow var(--transition-fast, 150ms ease);
    }
    .control:focus-within {
      --_field-border-color: var(--form-border-color-focus, #43608a);
      box-shadow:
        inset 0 0 0 var(--form-border-width, 1px) var(--_field-border-color),
        0 0 0 var(--focus-ring-width) var(--focus-ring-color);
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
      box-shadow:
        inset 0 0 0 var(--form-border-width, 1px) var(--_field-border-color),
        0 0 0 var(--focus-ring-width, 2px) var(--form-border-color-error, #ef4444);
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
  `}}customElements.get("esa-text-field")||customElements.define("esa-text-field",c);let h=0;class p extends s{constructor(){super(),this.warnedNoName=!1,this.selectOption=e=>{e.disabled||(this.value=e.value,this.internals.setFormValue(this.value),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0,composed:!0})))},this.onKeydown=(e,i)=>{(e.key===" "||e.key==="Enter")&&(e.preventDefault(),this.selectOption(i))},this.options=[],this.label="",this.ariaLabel=null,this.size="md",this.orientation="vertical",this.value=null,this.internals=this.attachInternals(),this.uid=`esa-radio-${++h}`}static{this.formAssociated=!0}static{this.properties={options:{type:Array},label:{type:String},ariaLabel:{type:String,attribute:"aria-label"},size:{type:String,reflect:!0},orientation:{type:String,reflect:!0},value:{type:String}}}willUpdate(e){if(e.has("options")&&typeof this.options=="string")try{this.options=JSON.parse(this.options)}catch{this.options=[]}!this.warnedNoName&&!this.label&&!this.ariaLabel&&(this.warnedNoName=!0,console.warn("<esa-radio-group> has no accessible name. Set `label` (visible) or `aria-label` (invisible) so screen readers announce the group."))}connectedCallback(){super.connectedCallback(),this.internals.setFormValue(this.value)}isSelected(e){return this.value===e}render(){const e=`${this.uid}-label`;return r`
      ${this.label?r`<span class="group-label" id=${e}>${this.label}</span>`:null}
      <div
        class="items"
        role="radiogroup"
        aria-labelledby=${this.label?e:void 0}
        aria-label=${!this.label&&this.ariaLabel?this.ariaLabel:void 0}
      >
        ${this.options.map((i,d)=>{const t=this.isSelected(i.value),a=i.disabled??!1,o=`${this.uid}-option-${d}`;return r`
            <label
              class="item ${a?"item--disabled":""}"
              @keydown=${f=>this.onKeydown(f,i)}
              @click=${()=>this.selectOption(i)}
            >
              <span
                class="circle ${t?"circle--selected":""}"
                role="radio"
                aria-checked=${String(t)}
                aria-disabled=${String(a)}
                aria-labelledby=${o}
                tabindex=${a?-1:0}
              >
                <span class="dot"></span>
              </span>
              <span class="item-label" id=${o}>${i.label}</span>
            </label>
          `})}
      </div>
    `}static{this.styles=l`
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
      border-radius: 50%;
      background: var(--form-bg, #fff);
      box-shadow: inset 0 0 0 var(--form-border-width, 2px) var(--form-border-color, #d4d4d4);
      transition: box-shadow var(--transition-fast, 150ms ease);
    }
    .circle--selected {
      box-shadow: inset 0 0 0 var(--form-border-width, 2px) var(--color-primary, #43608a);
    }
    .circle:focus-visible {
      outline: none;
      box-shadow:
        inset 0 0 0 var(--form-border-width, 2px) var(--form-border-color-focus, #43608a),
        0 0 0 var(--focus-ring-width) var(--focus-ring-color);
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
  `}}customElements.get("esa-radio-group")||customElements.define("esa-radio-group",p);
