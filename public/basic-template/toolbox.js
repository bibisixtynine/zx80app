export {clear,print,printf,input,Button,addDiv}


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
  const id = Date.now().toString()
  printf(text+ '<input id="'+id+'"placeholder="Enter some text" name="name" />')
  const e = document.getElementById(id)
  e.addEventListener('change',(event)=>{
    fct(event.target.value)
  })
}

function clear() {
  const ui = document.getElementById('ui-toolbox')

  ui.innerHTML = ''
}
  
function print(...args) {
  const ui = document.getElementById('ui-toolbox')

  let html = args.join(''); // Concatène tous les arguments en les séparant par un espace
  ui.insertAdjacentHTML('beforeend', html);
}

function printf(...args) {
  const ui = document.getElementById('ui-toolbox')

  let html = args.join(''); // Concatène tous les arguments en les séparant par un espace
  ui.insertAdjacentHTML('beforeend', html+"<br>");
}

function addDiv(...args) {
  let html = args.join(''); // Concatène tous les arguments en les séparant par un espace
  document.getElementById('ui').insertAdjacentHTML('beforeend', html);
}