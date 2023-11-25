export {clear,print,printf,input,Button}


////////////////////////////////
// Ma Première Boîte à Outils //
////////////////////////////////
                              
function Button(label, onClickFunction) {
    let button = document.createElement('button');
    button.style.border = '2px solid #20FF20';
    button.style.borderRadius = '20px';
    button.style.backgroundColor = '#001000';
    button.style.color = '#20FF20';
    button.textContent = label;
    button.onclick = onClickFunction;
    document.body.appendChild(button);
}

function input(text,fct) {
  const id=Date.now().toString()
  printf(text+ '<input id="'+id+'"placeholder="Enter some text" name="name" />')
  const e = document.getElementById(id)
  e.addEventListener('change',(event)=>{
    fct(event.target.value)
  })
}

function getUI() {
  const ui = document.getElementById('ui')
 
  if (!ui) {
    const div = document.createElement('div')
    div.id = 'ui'
    document.body.appendChild(div)
 //   _initUI(div)
  }
  return document.getElementById('ui')
} 

/*
function _initUI(ui) {
  ui.innerHTML = ''
  ui.innerHTML = '<style> #' + ui.id +'::-webkit-scrollbar{display:none;} center{position:fixed; left:50%; top:50%; transform:translate(-50%,-50%)} red{color:red} white{color:white} blue{color:blue} green{color:green} yellow{color:yellow} orange{color:orange} purple{color:purple}</style>'
  ui.style.fontFamily = 'monospace'
  ui.style.fontSize = '20px'
  ui.style.position = 'fixed'
  ui.style.top = '0px'
  ui.style.left = '0px'
  ui.style.color = '#20FF20';
  ui.style.backgroundColor = 'rgba(0,0,0,0.5)'
  ui.style.width = '100%'
  ui.style.height = '100%'
  ui.style.overflow = 'scroll'
  ui.style.whiteSpace = 'normal'
  ui.style.overflowWrap = 'break-word'
  ui.style.wordWrap = 'break-word'
  ui.style.textAlign = 'center'
  //ui.style.borderRadius = '25px'
  ui.style.margin = '0px'
  ui.style.padding = '0px'
  return ui
}
*/


function clear() {
  const ui = getUI('ui')
  ui.innerHTML = ''
  ui.innerHTML = '<style> #' + ui.id +'::-webkit-scrollbar{display:none;} center{position:absolute; left:50%; top:50%; transform:translate(-50%,-50%)} red{color:red} white{color:white} blue{color:blue} green{color:green} yellow{color:yellow} orange{color:orange} purple{color:purple}</style>'
}
  
function print(...args) {
  let html = args.join(''); // Concatène tous les arguments en les séparant par un espace
  const ui = getUI('ui')
  ui.insertAdjacentHTML('beforeend', html);
}

function printf(...args) {
  let html = args.join(''); // Concatène tous les arguments en les séparant par un espace
  const ui = getUI('ui')
  ui.insertAdjacentHTML('beforeend', html+"<br>");
}
