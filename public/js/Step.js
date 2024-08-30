/*
timelineId = elemento id della class='timelineContent'
*/

class Steps {
  #pageWidth;
  #move;
  #translateX = 0;
  #stepActive = 1;
  constructor(stepTranslate) {
    // definisco il div che deve effettuare la translate
    this._translateRef = document.getElementById(stepTranslate);
    this._step = document.querySelector('.steps[data-step]'); // elemento con [data-step]
    this.btnNext = this._step.querySelector('#next');
    this.btnSave = this._step.querySelector('#save');
    this.btnPrevious = this._step.querySelector('#prev');
    // numero degli step presenti, con questo posso controllare il enabled/disabled dei tasti prev-next
    this.stepCount = this._translateRef.childElementCount;
    this.page = document.querySelector('.step[selected]');
  }

  set page(value) {
    // imposto la pagina corrente
    this._page = value;
    this.btnPrevious.disabled = (this.#stepActive === 1) ? true : false;
    this.btnNext.disabled = (this.#stepActive === this.stepCount) ? true : false;
  }

  get page() { return this._page; }

  set translate(value) {
    this._translateRef.setAttribute('translate-x', value);
    this.#translateX = value;
  }

  get translate() { return this.#translateX; }

  previous() {
    this.#pageWidth = this._page.offsetWidth; // width della pagina da translare
    console.log(this.#pageWidth);
    this.#move = this.#pageWidth + (this.#translateX);
    console.log(this.#move);
    if (this._page.previousElementSibling) {
      this._translateRef.style.transform = "translateX(" + this.#move + "px)";
      this.translate = this.#move;
      this._step.setAttribute('data-step', --this.#stepActive);
      // rimuovo [selected] dalla pagina corrente
      this._page.removeAttribute('selected');
      // imposto [selected] sul nuovo step
      this._page.previousElementSibling.setAttribute('selected', true);
      // imposto la nuova pagina corrente
      this.page = this._page.previousElementSibling;
    }
  }

  next() {
    this.#pageWidth = this._page.offsetWidth; // width della pagina da translare
    console.log(this.#pageWidth);
    this.#move = this.#pageWidth - (this.#translateX);
    console.log(this.#move);
    if (this._page.nextElementSibling) {
      this._translateRef.style.transform = "translateX(-" + this.#move + "px)";
      this.translate = -this.#move;
      this._step.setAttribute('data-step', ++this.#stepActive);
      // rimuovo [selected] dalla pagina corrente
      this._page.removeAttribute('selected');
      // imposto [selected] sul nuovo step
      this._page.nextElementSibling.setAttribute('selected', true);
      // imposto la nuova pagina corrente
      this.page = this._page.nextElementSibling;
    }
  }

goStep(e) {

}

}
