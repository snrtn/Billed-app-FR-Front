// @jest-environment jsdom

// Configuration de l'environnement Jest et importation des modules et fonctions nécessaires.
import '@testing-library/jest-dom';
import { screen, fireEvent, waitFor } from '@testing-library/dom';

// Importation des faux modules store et NewBill.
import mockStore from '../__mocks__/store.js';
import NewBill from '../containers/NewBill.js';

// Importation du routeur et des constantes.
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';

// Mock du module Store.
jest.mock('../app/Store', () => mockStore);

// Code d'initialisation exécuté avant chaque test.
beforeEach(() => {
	// Définition du localStorage et création de l'élément racine.
	Object.defineProperty(window, 'localStorage', { value: localStorageMock });
	window.localStorage.setItem(
		'user',
		JSON.stringify({
			type: 'Employee',
		}),
	);
	const root = document.createElement('div');
	root.setAttribute('id', 'root');
	document.body.append(root);
	// Initialisation du routeur.
	router();
});

// Test vérifiant que, sur la page NewBill, l'icône de courrier dans le layout vertical est mise en surbrillance.
test("Lorsque je suis sur la page NewBill, l'icône de courrier dans le verticallayout devrait être mise en surbrillance", async () => {
	// Navigation vers la page NewBill et attente de l'apparition de l'icône de courrier.
	window.onNavigate(ROUTES_PATH.NewBill);
	await waitFor(() => screen.getByTestId('icon-mail'));
	const Icon = screen.getByTestId('icon-mail');
	// Vérification que l'icône a la classe 'active-icon'.
	expect(Icon).toHaveClass('active-icon');
});

// Test vérifiant que, sur le formulaire NewBill, je peux ajouter un fichier.
test('Lorsque je suis sur le formulaire NewBill, je peux ajouter un fichier', async () => {
	// Création d'une instance de NewBill.
	const dashboard = new NewBill({
		document,
		onNavigate,
		store: mockStore,
		localStorage: localStorageMock,
	});

	// Mock de la fonction handleChangeFile.
	const handleChangeFile = jest.fn(dashboard.handleChangeFile);
	const inputFile = screen.getByTestId('file');
	inputFile.addEventListener('change', handleChangeFile);
	// Simulation de l'événement de changement de fichier.
	fireEvent.change(inputFile, {
		target: {
			files: [
				new File(['document.jpg'], 'document.jpg', {
					type: 'document/jpg',
				}),
			],
		},
	});

	// Vérification de l'appel de handleChangeFile.
	expect(handleChangeFile).toHaveBeenCalled();
	expect(handleChangeFile).toBeCalled();
	// Vérification que le texte 'Envoyer une note de frais' est présent.
	expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
});

// Test vérifiant que, sur la page NewBill et lors de la soumission du formulaire, l'API est mise à jour.
test("Lorsque je suis sur la page NewBill et que je soumets le formulaire, appel à l'API pour mettre à jour les notes de frais", async () => {
	// Espionnage de la méthode 'bills' du store.
	jest.spyOn(mockStore, 'bills');
	// Définition du localStorage et création de l'élément racine.
	Object.defineProperty(window, 'localStorage', { value: localStorageMock });
	window.localStorage.setItem(
		'user',
		JSON.stringify({
			type: 'Employee',
			email: 'a@a',
		}),
	);
	const root = document.createElement('div');
	root.setAttribute('id', 'root');
	document.body.appendChild(root);
	// Initialisation du routeur.
	router();

	// Création d'une instance de NewBill.
	const newBill = new NewBill({
		document,
		onNavigate,
		store: mockStore,
		localeStorage: localStorageMock,
	});

	// Mock de la fonction handleSubmit.
	const handleSubmit = jest.fn(newBill.handleSubmit);
	const form = screen.getByTestId('form-new-bill');
	form.addEventListener('submit', handleSubmit);
	// Simulation de l'événement de soumission du formulaire.
	fireEvent.submit(form);

	// Vérification de l'appel à la méthode 'bills'.
	expect(mockStore.bills).toHaveBeenCalled();
});
