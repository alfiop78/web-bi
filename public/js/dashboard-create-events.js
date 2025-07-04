console.info('dashboard-create-events');

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded');
	btn__create_url.addEventListener('click', openGenerateUrl);

	btn__url_generate.addEventListener('click', urlGenerate);
	// opzioni
	// checkbox "Visualizza tasto di aggiornamento"
	checkbox__refresh_button.addEventListener('click', handleOptionRefresh);

	dlg__chartSection.addEventListener('close', () => {
		ul__workbooks.querySelectorAll('li').forEach(item => item.remove());
		ul__sheets.querySelectorAll('li').forEach(item => item.remove());

	});
}); // end DOMContentLoaded

console.info('END dashboard-create-events');
