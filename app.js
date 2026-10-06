const $ = (id) => document.getElementById(id);
function fmt(n, digits=2){ return Number(n).toLocaleString(undefined,{maximumFractionDigits:digits}); }

function highlightFormulas(){
  document.querySelectorAll('.formula').forEach((formula)=>{
    const source=formula.textContent;
    const fragment=document.createDocumentFragment();
    const tokenPattern=/(\b[A-Za-z][A-Za-z0-9_]*\b|\d[\d,]*(?:\.\d+)?|[()[\]{}]|[=+\-×÷*/≈≤≥·])/g;
    let cursor=0, match;
    while((match=tokenPattern.exec(source))){
      if(match.index>cursor) fragment.append(source.slice(cursor,match.index));
      const token=match[0], span=document.createElement('span');
      span.className=/^[()[\]{}]$/.test(token)?'syntax-bracket':/^[=+\-×÷*/≈≤≥·]$/.test(token)?'syntax-operator':/^\d/.test(token)?'syntax-number':'syntax-name';
      span.textContent=token; fragment.append(span); cursor=tokenPattern.lastIndex;
    }
    if(cursor<source.length) fragment.append(source.slice(cursor));
    formula.replaceChildren(fragment);
  });
}

function initNumericValidation(){
  const limits={inputTokens:1e12,outputTokens:1e12,inputRate:1e6,outputRate:1e6,requests:1e9,tp:1e15,fp:1e15,fn:1e15,tn:1e15,params:1e6,overhead:100};
  const integerFields=new Set(['inputTokens','outputTokens','requests','tp','fp','fn','tn']);
  document.querySelectorAll('input[type="number"]').forEach((input)=>{
    input.required=true;
    if(limits[input.id]) input.max=String(limits[input.id]);
    if(integerFields.has(input.id)) input.step='1';
    const message=document.createElement('span');
    message.className='field-error'; message.id=`${input.id}-error`; message.setAttribute('aria-live','polite');
    input.insertAdjacentElement('afterend',message); input.setAttribute('aria-describedby',message.id);
    function validate(){
      let text='';
      if(input.validity.valueMissing) text='Enter a value.';
      else if(input.validity.badInput||!Number.isFinite(Number(input.value))) text='Enter a valid number.';
      else if(input.validity.rangeUnderflow) text=`Enter a value of at least ${input.min}.`;
      else if(input.validity.rangeOverflow) text=`Enter a value no greater than ${input.max}.`;
      else if(input.validity.stepMismatch) text=`Use the expected increment of ${input.step}.`;
      message.textContent=text; input.setAttribute('aria-invalid',String(Boolean(text)));
      return !text;
    }
    input.addEventListener('input',validate); validate();
  });
}

function readNumbers(ids){
  const values=ids.map((id)=>$(id));
  if(values.some((input)=>!input||!input.checkValidity())) return null;
  return values.map((input)=>Number(input.value));
}

function initTheme(){
  const toggle=document.querySelector('.theme-toggle');
  if(!toggle) return;
  const saved=localStorage.getItem('modelmetric-theme');
  const theme=saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  function apply(next){
    document.documentElement.dataset.theme=next;
    toggle.setAttribute('aria-label',`Switch to ${next==='dark'?'light':'dark'} theme`);
    toggle.setAttribute('aria-pressed',String(next==='dark'));
  }
  apply(theme);
  toggle.addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    localStorage.setItem('modelmetric-theme',next); apply(next);
  });
}

function initCustomSelects(){
  document.querySelectorAll('.custom-select').forEach((wrapper)=>{
    const select=wrapper.querySelector('select'), trigger=wrapper.querySelector('.select-trigger'), options=wrapper.querySelector('.select-options');
    if(!select||!trigger||!options) return;
    const optionItems=[];
    trigger.setAttribute('role','combobox');
    trigger.setAttribute('aria-controls',`${select.id}-options`);
    options.id=`${select.id}-options`;
    [...select.options].forEach((option,index)=>{
      const item=document.createElement('li');
      item.className='select-option'; item.textContent=option.textContent; item.dataset.value=option.value;
      item.setAttribute('role','option'); item.setAttribute('tabindex','-1');
      item.setAttribute('aria-selected',String(index===select.selectedIndex));
      item.addEventListener('click',()=>{ select.value=option.value; trigger.firstChild.textContent=option.textContent; options.classList.remove('is-open'); trigger.setAttribute('aria-expanded','false'); options.querySelectorAll('.select-option').forEach((entry)=>entry.setAttribute('aria-selected',String(entry===item))); select.dispatchEvent(new Event('change',{bubbles:true})); });
      options.appendChild(item);
      optionItems.push(item);
    });
    let activeIndex=select.selectedIndex;
    function openMenu(){options.classList.add('is-open');trigger.setAttribute('aria-expanded','true');activeIndex=select.selectedIndex;trigger.setAttribute('aria-activedescendant',optionItems[activeIndex].id=`${select.id}-option-${activeIndex}`);}
    function closeMenu(){options.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');}
    trigger.addEventListener('click',()=>{options.classList.contains('is-open')?closeMenu():openMenu();});
    trigger.addEventListener('keydown',(event)=>{
      if(event.key==='Escape'){closeMenu();return;}
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();openMenu();activeIndex=(activeIndex+(event.key==='ArrowDown'?1:-1)+optionItems.length)%optionItems.length;trigger.setAttribute('aria-activedescendant',optionItems[activeIndex].id);optionItems.forEach((item,index)=>item.setAttribute('data-active',String(index===activeIndex)));return;}
      if((event.key==='Enter'||event.key===' ')&&options.classList.contains('is-open')){event.preventDefault();optionItems[activeIndex].click();}
    });
    document.addEventListener('click',(event)=>{if(!wrapper.contains(event.target)){options.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');}});
  });
}

// Token estimator: intentionally a heuristic, not a provider-specific tokenizer.
function initTokenTool(){
  const input=$('tokenInput'), out=$('tokenResult'), detail=$('tokenDetail'), mode=$('tokenMode');
  if(!input) return;
  function calc(){
    const text=input.value; const chars=text.length; const words=text.trim()?text.trim().split(/\s+/).length:0;
    const divisor=Number(mode.value)||4; const tokens=Math.ceil(chars/divisor);
    out.textContent=fmt(tokens,0); detail.textContent=`${fmt(words,0)} words · ${fmt(chars,0)} characters · heuristic ≈ 1 token per ${divisor} characters`;
  }
  input.addEventListener('input',calc); mode.addEventListener('change',calc); calc();
}

function initCostTool(){
  if(!$('inputTokens')) return;
  const ids=['inputTokens','outputTokens','inputRate','outputRate','requests'];
  ids.forEach(id=>$(id).addEventListener('input',calc));
  function calc(){
    const values=readNumbers(ids); if(!values) return;
    const [ti,to,ri,ro,req]=values;
    const per=((ti/1e6)*ri)+((to/1e6)*ro), month=per*req;
    $('costPerRequest').textContent='$'+per.toFixed(4);
    $('monthlyCost').textContent='$'+month.toFixed(2);
    $('costDetail').textContent=`${fmt(req,0)} requests/month · ${fmt((ti+to)*req/1e6,2)}M total tokens/month`;
  }
  calc();
}

function initMetrics(){
  if(!$('tp')) return;
  ['tp','fp','fn','tn'].forEach(id=>$(id).addEventListener('input',calc));
  function safe(a,b){return b===0?0:a/b}
  function calc(){
    const values=readNumbers(['tp','fp','fn','tn']); if(!values) return;
    const [tp,fp,fn,tn]=values;
    const precision=safe(tp,tp+fp), recall=safe(tp,tp+fn), f1=safe(2*precision*recall,precision+recall), acc=safe(tp+tn,tp+fp+fn+tn);
    $('precision').textContent=(precision*100).toFixed(2)+'%'; $('recall').textContent=(recall*100).toFixed(2)+'%';
    $('f1').textContent=(f1*100).toFixed(2)+'%'; $('accuracy').textContent=(acc*100).toFixed(2)+'%';
  }
  calc();
}

function initVram(){
  if(!$('params')) return;
  ['params','bits','overhead'].forEach(id=>$(id).addEventListener('input',calc));
  function calc(){
    const values=readNumbers(['params','bits','overhead']); if(!values) return;
    const [p,b,o]=values;
    const gb=(p*1e9*(b/8)*o)/(1024**3);
    $('vram').textContent=fmt(gb,2)+' GB'; $('vramDetail').textContent=`Weights-only estimate · ${b}-bit · ${fmt(o,2)}× overhead factor`;
  }
  calc();
}
initTheme(); initCustomSelects(); initNumericValidation(); initTokenTool(); initCostTool(); initMetrics(); initVram(); highlightFormulas();
