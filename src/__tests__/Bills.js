/**
 * @jest-environment jsdom
 */

// Importe les fonctions screen et waitFor depuis le DOM Testing Library.
import { screen, waitFor } from '@testing-library/dom';
// Importe les composants BillsUI et Bills.
import BillsUI from '../views/BillsUI.js';
import Bills from '../containers/Bills.js';
// Importe les données des factures (bills).
import { bills } from '../fixtures/bills.js';
// Importe le chemin des routes (ROUTES_PATH).
import { ROUTES_PATH } from '../constants/routes.js';
// Importe l'objet localStorageMock pour intercepter localStorage.
import { localStorageMock } from '../__mocks__/localStorage.js';
// Importe le mock du store (mockStore).
import mockStore from '../__mocks__/store';
// Importe le router.
import router from '../app/Router.js';
// Importe la bibliothèque d'événements utilisateur (userEvent).
import userEvent from '@testing-library/user-event';

// Mock du store.
jest.mock('../app/store', () => mockStore);

// Test : Vérifie si je suis connecté en tant qu'employé et sur la page des factures (Bills Page), alors l'icône de facture dans la mise en page verticale devrait être mise en surbrillance.
test('Given I am connected as an employee and on Bills Page, then bill icon in vertical layout should be highlighted', async () => {
	// Intercepte localStorage.
	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
	});
	// Configure les informations de l'utilisateur.
	window.localStorage.setItem(
		'user',
		JSON.stringify({
			type: 'Employee',
		}),
	);
	// Crée un élément racine (root) dans le DOM et l'ajoute au body.
	const root = document.createElement('div');
	root.setAttribute('id', 'root');
	document.body.append(root);
	// Appelle la fonction de routage.
	router();
	// Navigue vers le chemin 'Bills'.
	window.onNavigate(ROUTES_PATH.Bills);

	// Attend que l'icône soit présente.
	await waitFor(() => screen.getByTestId('icon-window'));
	const windowIcon = screen.getByTestId('icon-window');
	// Vérifie que la classe de l'icône de fenêtre est 'active-icon'.
	expect(windowIcon.classList.contains('active-icon')).toBe(true);
});

// Test : Si des données de factures sont fournies, les factures doivent être triées du plus ancien au plus récent.
test('Given bills data, bills should be ordered from earliest to latest', () => {
	// Rendu de BillsUI en HTML.
	document.body.innerHTML = BillsUI({ data: bills });
	// Trouve tous les éléments correspondant à un motif spécifique et les transforme en tableau.
	const dates = screen
		.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
		.map((a) => a.innerHTML);
	// Fonction pour trier les dates dans l'ordre décroissant.
	const antiChrono = (a, b) => (a < b ? 1 : -1);
	const datesSorted = [...dates].sort(antiChrono);
	// Vérifie que les dates triées correspondent à l'ordre attendu.
	expect(dates).toEqual(datesSorted);
});

// Test : Lorsqu'un employé clique sur le bouton 'œil', le modal doit s'afficher.
test('When employee clicks on eye Button, modal should be displayed', () => {
	// Définit la navigation avec la fonction pathname.
	const onNavigate = (pathname) => {
		document.body.innerHTML = ROUTES({ pathname });
	};

	// Intercepte localStorage.
	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
	});
	// Configure les informations de l'utilisateur.
	window.localStorage.setItem(
		'user',
		JSON.stringify({
			type: 'Employee',
		}),
	);

	// Crée une instance de Bills.
	const billsDashboard = new Bills({
		document,
		onNavigate,
		store: null,
		bills: bills,
		localStorage: window.localStorage,
	});

	// Mock de la fonction jQuery.
	$.fn.modal = jest.fn();

	// Rendu de BillsUI en HTML.
	document.body.innerHTML = BillsUI({ data: { bills } });

	// Récupère l'icône 'œil'.
	const iconEye = screen.getAllByTestId('btn-new-bill')[0];
	// Ajoute un gestionnaire d'événement pour le clic sur l'icône 'œil' et déclenche l'événement.
	const handleClickIconEye = jest.fn(billsDashboard.handleClickIconEye(iconEye));

	iconEye.addEventListener('click', handleClickIconEye);
	userEvent.click(iconEye);

	// Vérifie le clic sur l'icône 'œil' et l'affichage du modal.
	expect(handleClickIconEye).toHaveBeenCalled();
	expect($.fn.modal).toHaveBeenCalled();
	expect(screen.getByTestId('modal')).toBeTruthy();
	expect(screen.getByTestId('modal-title')).toBeTruthy();
});

// Test : Lorsqu'un employé clique sur 'nouvelle facture', le formulaire doit s'afficher.
test('When employee clicks on new bill, form should be displayed', () => {
	// Définit la navigation avec la fonction pathname.
	const onNavigate = (pathname) => {
		document.body.innerHTML = ROUTES({ pathname });
	};

	// Intercepte localStorage.
	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
	});
	// Configure les informations de l'utilisateur.
	window.localStorage.setItem(
		'user',
		JSON.stringify({
			type: 'Employee',
		}),
	);

	// Crée une instance de Bills.
	const billsDashboard = new Bills({
		document,
		onNavigate,
		store: null,
		bills: bills,
		localStorage: window.localStorage,
	});

	// Récupère le bouton 'nouvelle facture'.
	const newBillBtn = screen.getByTestId('btn-new-bill');
	// Ajoute un gestionnaire d'événement pour le clic sur 'nouvelle facture' et déclenche l'événement.
	const handleClickNewBill = jest.fn(billsDashboard.handleClickNewBill);

	newBillBtn.addEventListener('click', handleClickNewBill);
	userEvent.click(newBillBtn);

	// Vérifie le clic sur l'icône 'œil' et l'affichage du modal.

	// Vérifie si la fonction 'handleClickIconEye' a été appelée par l'événement de clic.
	expect(handleClickIconEye).toHaveBeenCalled();

	// Vérifie si la fonction 'modal' de jQuery a été appelée.
	expect($.fn.modal).toHaveBeenCalled();

	// Vérifie si un élément avec un 'data-testid' spécifique existe à l'écran.
	expect(screen.getByTestId('modal')).toBeTruthy();

	// Vérifie si un élément avec un 'data-testid' spécifique, représentant le titre du modal, existe à l'écran.
	expect(screen.getByTestId('modal-title')).toBeTruthy();
});

/* API Get Bills */

// Réinitialise les paramètres avant chaque test.
// Définition de la fonction beforeEach pour configurer avant chaque cas de test
beforeEach(() => {
	// Espionner la méthode 'bills' de l'objet 'mockStore'
	jest.spyOn(mockStore, 'bills');

	// Simuler l'objet 'localStorage' et définir sa valeur sur 'localStorageMock'
	Object.defineProperty(window, 'localStorage', {
		value: localStorageMock,
	});

	// Définir des données 'user' spécifiques sous forme de chaîne JSON dans 'localStorage'
	window.localStorage.setItem(
		'user',
		JSON.stringify({
			type: 'Employee',
			email: 'a@a',
		}),
	);

	// Créer un nouvel élément 'div' nommé 'root'
	const root = document.createElement('div');
	// Définir l'attribut 'id' de 'root' sur 'root'
	root.setAttribute('id', 'root');
	// Ajouter cet élément 'root' au corps du document
	document.body.appendChild(root);

	// Initialiser le routeur
	router();
});

// Récupère les factures depuis une API et échoue avec un message d'erreur 404.
test('Fetches bills from an API and fails with 404 message error', async () => {
	// Mock de la fonction list de bills depuis le store pour renvoyer une erreur 404.
	mockStore.bills.mockImplementationOnce(() => {
		return {
			list: () => {
				return Promise.reject(new Error('Erreur 404'));
			},
		};
	});
	// Navigue vers le chemin 'Bills'.
	window.onNavigate(ROUTES_PATH.Bills);
	await new Promise(process.nextTick);
	// Vérifie le message d'erreur 404.
	const message = await screen.getByText(/Erreur 404/);
	expect(message).toBeTruthy();
});

// Récupère les factures depuis une API et échoue avec un message d'erreur 500.
test('Fetches messages from an API and fails with 500 message error', async () => {
	// Mock de la fonction list de bills depuis le store pour renvoyer une erreur 500.
	mockStore.bills.mockImplementationOnce(() => {
		return {
			list: () => {
				return Promise.reject(new Error('Erreur 500'));
			},
		};
	});

	// Navigue vers le chemin 'Bills'.
	window.onNavigate(ROUTES_PATH.Bills);
	await new Promise(process.nextTick);
	// Vérifie le message d'erreur 500.
	const message = await screen.getByText(/Erreur 500/);
	expect(message).toBeTruthy();
});

// Récupère les factures depuis une API avec succès.
test('Fetches bills from an API', async () => {
	// Récupère les factures depuis le store.
	const fetchedBills = await mockStore.bills().list();
	// Vérifie que le nombre de factures récupérées est de 4.
	expect(fetchedBills.length).toBe(4);
});
