import React, { useState, useEffect } from 'react';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { Route, Switch, Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

import Login from './paginas/Login';
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

const styles = {
	sairBotao: {
		marginLeft: 'auto'
	},
	spinnerContainer: {
		position: 'fixed',
		height: '100%',
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	}
};

const App = ({ classes }) => {
	const [usuarioLoading, setUsuarioLoading] = useState(true);
	const [usuario, setUsuario] = useState();

	useEffect(() => {
		firebase.auth().onAuthStateChanged(user => {
			setUsuario(user);
			setUsuarioLoading(false);
		});
	}, []);

	const [items, setItems] = useState(new Map());

	useEffect(() => {
		if (usuario) {
			return firebase
				.firestore()
				.collection('items')
				.where('usuario', '==', usuario.uid)
				.orderBy('criadoData')
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
		const db = firebase.firestore();

		const ordemRef = db.collection('ordem').doc(usuario.uid);

		return db.runTransaction(transaction =>
			transaction.get(ordemRef).then(ordemDoc => {
				const itemDoc = db.collection('items').doc();

				transaction.set(itemDoc, {
					...item,
					id: itemDoc.id,
					criadoData: firebase.firestore.FieldValue.serverTimestamp(),
					usuario: usuario.uid
				});

				let ordem;
				if (!ordemDoc.exists || !Array.isArray(ordemDoc.get('ordem'))) {
					ordem = [...items.values()].map(item => item.id);
				} else {
					ordem = ordemDoc.get('ordem');
				}

				ordem = [...ordem, itemDoc.id];

				transaction.set(ordemRef, { ordem });
			})
		);
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

	function AuthRoute({ component: Component, login = false, ...rest }) {
		if (login) {
			return (
				<Route
					{...rest}
					render={props =>
						usuario ? (
							<Redirect
								to={{
									pathname: '/'
								}}
							/>
						) : (
							<Component {...props} />
						)
					}
				/>
			);
		} else {
			return (
				<Route
					{...rest}
					render={props =>
						usuario ? (
							<>
								<AppBar position="static">
									<Toolbar>
										<Button
											color="inherit"
											className={classes.sairBotao}
											onClick={() => firebase.auth().signOut()}
										>
											Sair
										</Button>
									</Toolbar>
								</AppBar>

								<Component {...props} />
							</>
						) : (
							<Redirect
								to={{
									pathname: '/login',
									state: { from: props.location }
								}}
							/>
						)
					}
				/>
			);
		}
	}

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<React.Fragment>
				<CssBaseline />

				{usuarioLoading ? (
					<div className={classes.spinnerContainer}>
						<CircularProgress />
					</div>
				) : (
					<Switch>
						<AuthRoute exact path="/login" component={Login} login />

						<AuthRoute
							exact
							path="/"
							component={routeProps => (
								<Lista
									{...routeProps}
									items={items}
									alterarFeito={alterarFeito}
								/>
							)}
						/>

						<AuthRoute
							exact
							path="/novo"
							component={routeProps => (
								<Novo {...routeProps} adicionarItem={adicionarItem} />
							)}
						/>

						<AuthRoute
							exact
							path="/:id"
							component={routeProps => {
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

						<AuthRoute component={() => <Redirect to="/" />} />
					</Switch>
				)}
			</React.Fragment>
		</MuiPickersUtilsProvider>
	);
};

export default withStyles(styles)(App);
