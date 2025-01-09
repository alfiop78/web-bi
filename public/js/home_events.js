document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  document.querySelectorAll("#ul-connections>li").forEach(li => li.addEventListener('click', selectConnection));

  btn__newConnection.onclick = (e) => {
    e.preventDefault();
    dialog__newConnection.showModal();
  }

  btn__removeConnection.addEventListener('click', removeConnection);

  btn__editConnection.addEventListener('click', editConnection);

  form.addEventListener('submit', createConnection);

  /* tasto cancel nelle dialog*/
  document.querySelectorAll("button[name='cancel']").forEach(btn => {
    btn.onclick = () => document.querySelector('dialog[open]').close();
  });

}); // end DOMContentLoaded

