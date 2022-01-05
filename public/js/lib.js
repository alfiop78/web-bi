window.onload = function() {
  console.log('onload');

  // se le input non hanno contenuto non evidenzio le label come :invalid, aggiungendo una class=has-content sulle label
  var inputs = document.querySelectorAll("input:not([type='checkbox']):not([type='radio'])");
  inputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      (e.target.value.length > 0) ?
        e.target.parentElement.querySelector('label').classList.add('has-content') :
        e.target.parentElement.querySelector('label').classList.remove('has-content');
    }, true);

    input.onfocus = function(e) {this.select();}});

  /* tasto cancel nelle dialog*/
  document.querySelectorAll("button[name='cancel']").forEach((btn) => {
    btn.onclick = function() {document.querySelector('dialog[open]').close();}
  });
};
