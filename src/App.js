import React, { useState, useEffect } from 'react';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { Route, Switch, Redirect } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import Lista from './paginas/Lista';
import Novo from './paginas/Novo';
import Visualizar from './paginas/Visualizar';

const config = {
	apiKey: 'AIzaSyBRYebCm20oXGiGoU9Njl9PtAADQ8OC468',
	authDomain: 'fazer-dev-4cd5b.firebaseapp.com',
	databaseURL: 'https://fazer-dev-4cd5b.firebaseio.com',
	projectId: 'fazer-dev-4cd5b',
	storageBucket: 'fazer-dev-4cd5b.appspot.com',
	messagingSenderId: '406109751094'
};
firebase.initializeApp(config);

const App = () => {
	const [usuario, setUsuario] = useState();

	useEffect(() => {
		return firebase.auth().onAuthStateChanged(user => setUsuario(user));
	}, []);

	useEffect(() => {
		if (usuario === null) {
			firebase.auth().signInAnonymously();
		}
	}, [usuario]);

	const [items, setItems] = useState(new Map());

	useEffect(() => {
		if (usuario) {
			return firebase
				.firestore()
				.collection('items')
				.onSnapshot(snapshot => {
					const items = new Map();

					snapshot.forEach(doc => {
						items.set(doc.id, doc.data());
					});

					setItems(items);
				});
		}
	}, [usuario]);

	function adicionarItem(item) {
		const itemDoc = firebase
			.firestore()
			.collection('items')
			.doc();

		return itemDoc.set({ ...item, id: itemDoc.id });
	}

	function editarItem(item) {
		if (item.id && items.has(item.id)) {
			const itemDoc = firebase
				.firestore()
				.collection('items')
				.doc(item.id);

			return itemDoc.set({ ...item, id: itemDoc.id }, { merge: true });
		}
	}

	function deletarItem(id) {
		if (id && items.has(id)) {
			const itemDoc = firebase
				.firestore()
				.collection('items')
				.doc(id);

			return itemDoc.delete();
		}
	}

	function alterarFeito(id, status) {
		const item = items.get(id);

		if (item) {
			editarItem({
				...item,
				feito: status === undefined ? item.feito : status
			});
		}
	}

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<React.Fragment>
				<CssBaseline />

				<Switch>
					<Route
						exact
						path="/"
						render={routeProps => (
							<Lista
								{...routeProps}
								items={items}
								alterarFeito={alterarFeito}
							/>
						)}
					/>

					<Route
						exact
						path="/novo"
						render={routeProps => (
							<Novo {...routeProps} adicionarItem={adicionarItem} />
						)}
					/>

					<Route
						exact
						path="/:id"
						render={routeProps => {
							const {
								match: {
									params: { id }
								}
							} = routeProps;

							if (id && items.get(id)) {
								return (
									<Visualizar
										{...routeProps}
										inicial={items.get(id)}
										editarItem={editarItem}
										deletarItem={() => {
											deletarItem(id);
										}}
										alterarFeito={alterarFeito}
									/>
								);
							} else {
								return <Redirect to="/" />;
							}
						}}
					/>

					<Route render={() => <Redirect to="/" />} />
				</Switch>
			</React.Fragment>
		</MuiPickersUtilsProvider>
	);
};

export default App;
