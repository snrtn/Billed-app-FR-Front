import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate, formatStatus } from '../app/format.js';
import Logout from './Logout.js';

export default class Bills {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document;
		this.onNavigate = onNavigate;
		this.store = store;
		const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
		if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill);
		const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
		if (iconEye)
			iconEye.forEach((icon) => {
				icon.addEventListener('click', () => this.handleClickIconEye(icon));
			});
		new Logout({ document, localStorage, onNavigate });
	}

	handleClickNewBill = () => {
		this.onNavigate(ROUTES_PATH['NewBill']);
	};

	handleClickIconEye = (icon) => {
		const billUrl = icon.getAttribute('data-bill-url');
		const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
		$('#modaleFile')
			.find('.modal-body')
			.html(`<div style='text-align: center;' class="bill-proof-container"><img src=${billUrl} alt="Bill" /></div>`);
		$('#modaleFile').modal('show');
	};

	getBills = () => {
		if (this.store) {
			return this.store
				.bills()
				.list()
				.then((snapshot) => {
					/* Fixe le bug Issue 1 */
					/* console.log(snapshot)
        snapshot.sort((a, b) => (new Date(b.date)-new Date(a.date)))
        console.log(snapshot) */

					/* Fix aussi le bug Issue 1 */
					/* snapshot.sort((a, b) => (a.date < b.date ? 1 : -1)); */

					const bills = snapshot.map((doc) => {
						try {
							return {
								...doc,
								date: formatDate(doc.date),
								status: formatStatus(doc.status),
							};
						} catch (e) {
							// Si pour une raison quelconque, des données corrompues ont été introduites, nous gérons ici l'échec de la fonction formatDate
							// Enregistrez l'erreur et retournez la date non formatée dans ce cas-là
							console.log(e, 'for', doc);
							return {
								...doc,
								date: doc.date,
								status: formatStatus(doc.status),
							};
						}
					});
					console.log('length', bills.length);
					return bills;
				});
		}
	};
}
