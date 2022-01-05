/*
timelineId = elemento id della class='timelineContent'
*/

class Steps {

  constructor(stepTranslate) {
    // definisco il div che deve effettuare la translate
    // console.log(stepTranslate);
    this._translateRef = document.getElementById(stepTranslate);
    this._translateX = 0;
    this.page = document.querySelector('.step[selected]');
    this._step = document.getElementById('step'); // elemento con [data-step]
    this._stepActive = 1;
    // console.log(this._page);
    // console.log(this._page.offsetWidth);
    this._pageWidth = this._page.offsetWidth; // width della pagina da translare
    //this._pageWidth = this._page.offsetWidth + 32; // width della pagina da translare
    console.log(this._pageWidth);

  }

  set page(pageRef) {
    // imposto la pagina corrente
    this._page = pageRef;
  }

  get page() {return this._page;}

  set translate(value) {
    this._translateRef.setAttribute('translate-x', value);
    this._translateX = value;
  }

  get translate() {return this._translateX;}

  previous() {
    // this._pageWidth = this._page.offsetWidth + 32;
    //this._translateRef.style.transform = "translateX("+(this._pageWidth-this._pageWidth)+"px)";

    this._move = this._pageWidth + (this._translateX);
    // this._pageWidth = this._page.offsetWidth + 32;
    //this._translateRef.style.transform = "translateX(-"+this._pageWidth+"px)";
    this._translateRef.style.transform = "translateX("+this._move+"px)";
    this.translate = this._move;
    this._step.setAttribute('data-step', --this._stepActive);
    // rimuovo [selected] dalla pagina corrente
    this._page.removeAttribute('selected');
    // imposto [selected] sul nuovo step
    this._page.previousElementSibling.setAttribute('selected', true);
    // imposto la nuova pagina corrente
    this.page = this._page.previousElementSibling;
  }

  next() {
    this._move = this._pageWidth - (this._translateX);
    // this._pageWidth = this._page.offsetWidth + 32;
    //this._translateRef.style.transform = "translateX(-"+this._pageWidth+"px)";
    this._translateRef.style.transform = "translateX(-"+this._move+"px)";
    this.translate = -this._move;
    this._step.setAttribute('data-step', ++this._stepActive);
    // rimuovo [selected] dalla pagina corrente
    this._page.removeAttribute('selected');
    // imposto [selected] sul nuovo step
    this._page.nextElementSibling.setAttribute('selected', true);
    // imposto la nuova pagina corrente
    this.page = this._page.nextElementSibling;
  }

  goStep(e) {
    
  }

}
