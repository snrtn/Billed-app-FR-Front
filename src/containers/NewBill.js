import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document;
		this.onNavigate = onNavigate;
		this.store = store;
		const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
		formNewBill.addEventListener('submit', this.handleSubmit);
		const file = this.document.querySelector(`input[data-testid="file"]`);
		file.addEventListener('change', this.handleChangeFile);
		this.fileUrl = null;
		this.fileName = null;
		this.billId = null;
		new Logout({ document, localStorage, onNavigate });
	}
	// Définition du gestionnaire d'événements de sélection de fichier
	handleChangeFile = (e) => {
		// Empêcher le comportement par défaut
		e.preventDefault();

		// Obtenir le fichier sélectionné dans le champ de fichier
		const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
		const fileName = file.name;

		// Nouvelles variables nécessaires pour vérifier le format de l'image
		const fileInput = this.document.querySelector(`input[data-testid="file"]`);
		const fileAcceptedFormats = ['jpg', 'jpeg', 'png'];
		const fileNameParts = fileName.split('.');
		const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
		this.isImgFormatValid = false;

		// Si le nom de fichier a au moins deux parties, poursuivre la vérification
		if (fileNameParts.length > 1) {
			// Vérifier si le format de l'image est .jpg, .jpeg ou .png - si vrai, définir isImgFormatValid sur vrai, sinon sur faux
			fileAcceptedFormats.indexOf(fileExtension) !== -1
				? (this.isImgFormatValid = true)
				: (this.isImgFormatValid = false);
		}

		// Si le format de l'image n'est pas valide
		if (!this.isImgFormatValid) {
			// Vider la valeur du champ de fichier, ajouter la classe is-invalid pour indiquer à l'utilisateur que l'entrée n'est pas valide, supprimer la classe blue-border

			// Vider la valeur du champ de fichier
			fileInput.value = '';

			// Ajouter la classe is-invalid
			fileInput.classList.add('is-invalid');

			// Supprimer la classe blue-border
			fileInput.classList.remove('blue-border');

			// Message d'erreur pour l'utilisateur
			alert(
				"Le format de votre fichier n'est pas pris en charge." + '\n' + 'Seuls les .jpg, .jpeg, .png sont acceptés.',
			);
		} else {
			// Si le format de l'image est valide
			// Supprimer la classe is-invalid, ajouter la classe blue-border, créer une instance FormData, obtenir l'e-mail de l'utilisateur depuis le stockage local, ajouter le fichier et l'e-mail à FormData
			// Supprimer la classe is-invalid
			fileInput.classList.remove('is-invalid');

			// Ajouter la classe blue-border
			fileInput.classList.add('blue-border');

			// Créer une instance FormData
			const formData = new FormData();

			// Obtenir l'e-mail de l'utilisateur depuis le stockage local
			const email = JSON.parse(localStorage.getItem('user')).email;

			// Ajouter le fichier à FormData
			formData.append('file', file);

			// Ajouter l'e-mail à FormData
			formData.append('email', email);

			// Affecter formData à la variable formData pour une utilisation ultérieure dans d'autres méthodes
			this.formData = formData;

			// Affecter le nom du fichier à la variable fileName
			this.fileName = fileName;
		}
	};

	handleSubmit = (e) => {
		e.preventDefault();
		console.log(
			'e.target.querySelector(`input[data-testid="datepicker"]`).value',
			e.target.querySelector(`input[data-testid="datepicker"]`).value,
		);
		const email = JSON.parse(localStorage.getItem('user')).email;
		const bill = {
			email,
			type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
			name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
			amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
			date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
			vat: e.target.querySelector(`input[data-testid="vat"]`).value,
			pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
			commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
			fileUrl: this.fileUrl,
			fileName: this.fileName,
			status: 'pending',
		};
		this.updateBill(bill);
		this.onNavigate(ROUTES_PATH['Bills']);
	};

	// not need to cover this function by tests
	updateBill = (bill) => {
		if (this.store) {
			this.store
				.bills()
				.update({ data: JSON.stringify(bill), selector: this.billId })
				.then(() => {
					this.onNavigate(ROUTES_PATH['Bills']);
				})
				.catch((error) => console.error(error));
		}
	};
}
