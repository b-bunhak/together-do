import React, { useState, useEffect, useMemo } from 'react';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { Route, Switch, Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

//import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import { partition } from 'lodash';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import ArrowRightIcon from '@material-ui/icons/MoreVert';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import Box from '@material-ui/core/Box';

import Login from './paginas/Login';
import Lista from './paginas/Lista';
import Feito from './paginas/Feito';
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
	// Usuario
	const [usuarioLoading, setUsuarioLoading] = useState(true);
	const [usuario, setUsuario] = useState();

	useEffect(() => {
		firebase.auth().onAuthStateChanged(user => {
			setUsuario(user);
			setUsuarioLoading(false);
		});
	}, []);

	// Usuario Info
	const [gruposLoading, setGruposLoading] = useState(true);
	const [grupos, setGrupos] = useState([]);
	const [grupoSelecionado, setGrupoSelecionado] = useState(null);

	useEffect(() => {
		if (usuario) {
			setGruposLoading(true);

			return firebase
				.firestore()
				.collection('infoUsuario')
				.doc(usuario.uid)
				.onSnapshot(snapshot => {
					const grupoIds = snapshot.get('grupos') || [];

					setGrupos(grupoIds);
					setGruposLoading(false);
				});
		}
	}, [usuario]);

	// Items
	const [items, setItems] = useState({});

	useEffect(() => {
		if (usuario) {
			const unsubs = grupos.map(id => {
				setItems({
					...items,
					[id]: { ...items[id], loading: true }
				});

				return firebase
					.firestore()
					.collection('items')
					.where('dono', '==', id)
					.orderBy('criadoData')
					.onSnapshot(snapshot => {
						const items = new Map();

						snapshot.forEach(doc => {
							items.set(doc.id, {
								...doc.data(),
								criadoData:
									doc.get('criadoData') && doc.get('criadoData').toDate(),
								dataEntrega:
									doc.get('dataEntrega') && doc.get('dataEntrega').toDate(),
								feito: doc.get('feito') && doc.get('feito').toDate()
							});
						});

						const [naoFeito, feito] = partition(
							[...items.values()]
								.sort((item1, item2) => item2.dataCriado - item1.dataCriado)
								.map(item => item.id),
							itemId => !items.get(itemId).feito
						);

						feito.sort(
							(item1, item2) => items.get(item2).feito - items.get(item1).feito
						);

						const ordemEntrega = [...naoFeito].sort((a, b) => {
							const dataA = items.get(a).dataEntrega;
							const dataB = items.get(b).dataEntrega;

							if (!dataA && !!dataB) {
								return 1;
							}

							if (!!dataA && !dataB) {
								return -1;
							}

							return dataA - dataB;
						});

						setItems({
							...items,
							[id]: { loading: false, items, naoFeito, feito, ordemEntrega }
						});
					});
			});

			return () => unsubs.forEach(unSub => unSub());
		}
	}, [usuario, grupos]);

	// Ordem
	const [ordem, setOrdem] = useState({});

	useEffect(() => {
		if (usuario) {
			const ids = [usuario.uid, ...grupos];

			const unSubs = ids.map(id => {
				setOrdem({
					...ordem,
					[id]: { ...ordem[id], loading: true }
				});

				return firebase
					.firestore()
					.collection('ordem')
					.doc(id)
					.onSnapshot(snapshot => {
						setOrdem({
							...ordem,
							[id]: { loading: false, ordem: snapshot.get('ordem') }
						});
					});
			});

			return () => unSubs.forEach(unSub => unSub());
		}
	}, [usuario, grupos]);

	// Ordem Tipo
	// switch to local session storage

	const [ordemTipo, setOrdemTipo] = useState('data');
	useEffect(() => {
		if (usuario) {
			return firebase
				.firestore()
				.collection('ordemTipo')
				.doc(usuario.uid)
				.onSnapshot(snapshot => {
					setOrdemTipo(snapshot.get('ordemTipo'));
				});
		}
	}, [usuario]);

	//

	function adicionarItem(item, grupo = usuario.uid) {
		const db = firebase.firestore();

		const ordemRef = db.collection('ordem').doc(grupo);

		return db.runTransaction(transaction =>
			transaction.get(ordemRef).then(ordemDoc => {
				const itemRef = db.collection('items').doc();

				transaction.set(itemRef, {
					...item,
					id: itemRef.id,
					criadoData: firebase.firestore.FieldValue.serverTimestamp(),
					dono: grupo
				});

				let ordem;
				if (!ordemDoc.exists || !Array.isArray(ordemDoc.get('ordem'))) {
					ordem = [...items[grupo].itemsFeito];
				} else {
					ordem = ordemDoc.get('ordem');
				}

				ordem = [...ordem, itemRef.id];

				transaction.set(ordemRef, { ordem });
			})
		);
	}

	// function editarItem(item) {
	// 	if (item.id && items.has(item.id)) {
	// 		const itemDoc = firebase
	// 			.firestore()
	// 			.collection('items')
	// 			.doc(item.id);

	// 		return itemDoc.set({ ...item, id: itemDoc.id }, { merge: true });
	// 	}
	// }

	// function deletarItem(id) {
	// 	if (id && items.has(id)) {
	// 		const db = firebase.firestore();

	// 		const ordemRef = db.collection('ordem').doc(usuario.uid);

	// 		return db.runTransaction(transaction =>
	// 			transaction.get(ordemRef).then(ordemDoc => {
	// 				const itemRef = db.collection('items').doc(id);

	// 				transaction.delete(itemRef);

	// 				let ordem;
	// 				if (!ordemDoc.exists || !Array.isArray(ordemDoc.get('ordem'))) {
	// 					ordem = [...itemsFeito].filter(item => item !== id);
	// 				} else {
	// 					ordem = ordemDoc.get('ordem');
	// 				}

	// 				ordem = ordem.filter(ordemId => ordemId !== id);

	// 				transaction.set(ordemRef, { ordem });
	// 			})
	// 		);
	// 	}
	// }

	function alterarFeito(id, status) {
		const item = items.get(id);

		if (item) {
			const batch = firebase.firestore().batch();

			if (item.id && items.has(item.id)) {
				const itemRef = firebase
					.firestore()
					.collection('items')
					.doc(item.id);

				const ordemRef = firebase
					.firestore()
					.collection('ordem')
					.doc(usuario.uid);

				const feito =
					status === undefined
						? item.feito
						: status === true
						? new Date()
						: null;

				batch.set(
					itemRef,
					{
						...item,
						feito,
						id: itemRef.id
					},
					{ merge: true }
				);

				batch.set(ordemRef, {
					ordem: feito
						? ordem.filter(itemId => itemId !== itemRef.id)
						: [...ordem, itemRef.id]
				});

				return batch.commit();
			}
		}
	}

	function alterarOrdem(ordem) {
		const ordemRef = firebase
			.firestore()
			.collection('ordem')
			.doc(usuario.uid);

		return ordemRef.set({ ordem });
	}

	function alterarOrdemTipo(ordemTipo) {
		const ordemTipoRef = firebase
			.firestore()
			.collection('ordemTipo')
			.doc(usuario.uid);

		return ordemTipoRef.set({ ordemTipo });
	}

	console.log(items);
	console.log(ordem);

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<React.Fragment>
				<CssBaseline />

				{usuarioLoading || (usuario && gruposLoading) ? (
					<div className={classes.spinnerContainer}>
						<CircularProgress />
					</div>
				) : !usuario ? (
					<Login />
				) : (
					<>
						<Dialog
							open={false}
							//onClose={handleClose}
						>
							<DialogTitle id="simple-dialog-title">Espacos</DialogTitle>
							<DialogContent>
								<List>
									{grupos.map(id => (
										<ListItem button key={id}>
											<ListItemText primary={id} />
										</ListItem>
									))}

									<ListItem button>
										<ListItemText primary="add account" />
									</ListItem>
								</List>
							</DialogContent>
						</Dialog>
						<AppBar position="static">
							<Toolbar>
								<Box
									clone
									pr={1}
									m={1}
									borderRadius="borderRadius"
									border={1}
									borderRight={0}
									borderColor="inherit"
								>
									<ButtonBase
										color="inherit"
										style={{
											borderTopRightRadius: 0,
											borderBottomRightRadius: 0
										}}
									>
										<ArrowRightIcon />

										<Typography variant="h6" component="div">
											Meu
										</Typography>
									</ButtonBase>
								</Box>

								<Button
									color="inherit"
									className={classes.sairBotao}
									onClick={() => firebase.auth().signOut()}
								>
									Sair
								</Button>
							</Toolbar>
						</AppBar>

						<Switch>
							<Route
								exact
								path="/"
								render={({ match }) => {
									return <Redirect to="/meu" />;
								}}
							/>

							<Route
								path="/:grupoId"
								render={({ match }) => {
									console.log(match.params.grupoId);
									console.log(
										match.params.grupoId &&
											grupos.includes(match.params.grupoId)
									);

									console.log(usuario.uid);

									return (
										<Switch>
											<Route
												exact
												path={match.url}
												render={routeProps => (
													<Lista
														{...routeProps}
														items={items[usuario.uid]}
														ordem={ordem}
														alterarFeito={alterarFeito}
														alterarOrdem={alterarOrdem}
														ordemTipo={ordemTipo}
														setOrdemTipo={alterarOrdemTipo}
													/>
												)}
											/>

											<Route
												exact
												path={`${match.url}/feito`}
												render={routeProps => (
													<Feito
														{...routeProps}
														items={items}
														alterarFeito={alterarFeito}
													/>
												)}
											/>

											<Route
												exact
												path={`${match.url}/novo`}
												render={routeProps => (
													<Novo {...routeProps} adicionarItem={adicionarItem} />
												)}
											/>

											<Route
												exact
												path={`${match.url}/:id`}
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
																//editarItem={editarItem}
																// deletarItem={() => {
																// 	deletarItem(id);
																// }}
																alterarFeito={alterarFeito}
															/>
														);
													} else {
														return <Redirect to="/" />;
													}
												}}
											/>
										</Switch>
									);
								}}
							/>
						</Switch>
					</>
				)}
			</React.Fragment>
		</MuiPickersUtilsProvider>
	);
};

export default withStyles(styles)(App);
