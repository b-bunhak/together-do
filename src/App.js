import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { Route, Switch, Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

//import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import { partition, isEqual } from 'lodash';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import ArrowRightIcon from '@material-ui/icons/MoreVert';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';

import Box from '@material-ui/core/Box';

import GruposModal from './componentes/GruposModal';
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

const styles = theme => ({
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
	},
	espacoDialog: {
		margin: theme.spacing(2)
	}
});

const App = ({ classes }) => {
	// Usuario
	const [usuarioLoading, setUsuarioLoading] = useState(true);
	const [usuario, setUsuario] = useState();

	useEffect(() => {
		firebase.auth().onAuthStateChanged(user => {
			ReactDOM.unstable_batchedUpdates(() => {
				setUsuario(user);
				setUsuarioLoading(false);
			});
		});
	}, []);

	// Grupos
	const [gruposLoading, setGruposLoading] = useState(true);
	const [grupos, setGrupos] = useState([]);
	const [gruposInfo, setGruposInfo] = useState({});

	useEffect(() => {
		if (usuario) {
			setGruposLoading(true);

			return firebase
				.firestore()
				.collection('grupos')
				.where('membros', 'array-contains', usuario.uid)
				.onSnapshot(snapshot => {
					const gruposInfo = {
						[usuario.uid]: {
							id: usuario.uid,
							nome: 'Meu'
						}
					};
					const gruposIds = [usuario.uid];

					snapshot.forEach(doc => {
						gruposInfo[doc.id] = doc.data();

						gruposIds.push(doc.id);
					});

					gruposIds.sort();

					ReactDOM.unstable_batchedUpdates(() => {
						setGruposInfo(gruposInfo);

						if (!isEqual(grupos, gruposIds)) {
							setGrupos(gruposIds);
						}

						setGruposLoading(false);
					});
				});
		}
	}, [usuario]);

	// Items
	const [{ items, itemsGrupos }, setItems] = useState({
		items: new Map(),
		itemsGrupos: {}
	});

	useEffect(() => {
		if (usuario) {
			let unsubs = [];

			// Timeout por causa de um bug com firebase
			// Acontece quando faz um sub muito rapido depois de um unSub
			const timeout = setTimeout(() => {
				unsubs = grupos.map(id => {
					setItems(({ itemsGrupos, ...items }) => ({
						...items,
						itemsGrupos: {
							...itemsGrupos,
							[id]: { ...itemsGrupos[id], loading: true }
						}
					}));

					return firebase
						.firestore()
						.collection('items')
						.where('dono', '==', id)
						.orderBy('criadoData')
						.onSnapshot(snapshot => {
							setItems(({ items, itemsGrupos }) => {
								const novoItems = new Map(items);

								snapshot.docChanges().forEach(({ type, doc }) => {
									if (type === 'removed') {
										novoItems.delete(doc.id);
									} else {
										novoItems.set(doc.id, {
											...doc.data(),
											criadoData:
												doc.get('criadoData') && doc.get('criadoData').toDate(),
											dataEntrega:
												doc.get('dataEntrega') &&
												doc.get('dataEntrega').toDate(),
											feito: doc.get('feito') && doc.get('feito').toDate()
										});
									}
								});

								const grupoItemIds = snapshot.docs.map(doc => doc.id);

								const [naoFeito, feito] = partition(
									grupoItemIds
										.map(id => novoItems.get(id))
										.sort((item1, item2) => item2.dataCriado - item1.dataCriado)
										.map(item => item.id),
									itemId => !novoItems.get(itemId).feito
								);

								feito.sort(
									(item1, item2) =>
										novoItems.get(item2).feito - novoItems.get(item1).feito
								);

								const ordemEntrega = [...naoFeito].sort((a, b) => {
									const dataA = novoItems.get(a).dataEntrega;
									const dataB = novoItems.get(b).dataEntrega;

									if (!dataA && !!dataB) {
										return 1;
									}

									if (!!dataA && !dataB) {
										return -1;
									}

									return dataA - dataB;
								});

								return {
									items: novoItems,
									itemsGrupos: {
										...itemsGrupos,
										[id]: {
											loading: false,
											ids: grupoItemIds,
											naoFeito,
											feito,
											ordemEntrega
										}
									}
								};
							});
						});
				});
			}, 250);

			return () => {
				clearTimeout(timeout);
				unsubs.forEach(unSub => unSub());
			};
		}
	}, [usuario, grupos]);

	// Ordem
	const [grupoOrdem, setGrupoOrdem] = useState({});

	useEffect(() => {
		if (usuario) {
			let unSubs = [];

			// Timeout por causa de um bug com firebase
			// Acontece quando faz um sub muito rapido depois de um unSub
			const timeout = setTimeout(() => {
				unSubs = grupos.map(id => {
					setGrupoOrdem(grupoOrdem => ({
						...grupoOrdem,
						[id]: { ...grupoOrdem[id], loading: true }
					}));

					return firebase
						.firestore()
						.collection('ordem')
						.doc(id)
						.onSnapshot(snapshot => {
							setGrupoOrdem(grupoOrdem => ({
								...grupoOrdem,
								[id]: { loading: false, ordem: snapshot.get('ordem') }
							}));
						});
				});
			}, 250);

			return () => {
				clearImmediate(timeout);
				unSubs.forEach(unSub => unSub());
			};
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

	// Grupos Modal
	const [gruposModalVisivel, setGruposModalVisivel] = useState(false);

	/////////////

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
					ordem = [...itemsGrupos[grupo].feito];
				} else {
					ordem = ordemDoc.get('ordem');
				}

				ordem = [...ordem, itemRef.id];

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
			const db = firebase.firestore();

			const ordemRef = db.collection('ordem').doc(usuario.uid);

			return db.runTransaction(transaction =>
				transaction.get(ordemRef).then(ordemDoc => {
					const itemRef = db.collection('items').doc(id);

					transaction.delete(itemRef);

					let ordem;
					if (!ordemDoc.exists || !Array.isArray(ordemDoc.get('ordem'))) {
						ordem = [...items[items.get(id).dono].itemsFeito].filter(
							item => item !== id
						);
					} else {
						ordem = ordemDoc.get('ordem');
					}

					ordem = ordem.filter(ordemId => ordemId !== id);

					transaction.set(ordemRef, { ordem });
				})
			);
		}
	}

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
					.doc(item.dono);

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
						? grupoOrdem[item.dono].ordem.filter(
								itemId => itemId !== itemRef.id
						  )
						: [...grupoOrdem[item.dono].ordem, itemRef.id]
				});

				return batch.commit();
			}
		}
	}

	function alterarOrdem(ordem, grupo = usuario.uid) {
		const ordemRef = firebase
			.firestore()
			.collection('ordem')
			.doc(grupo);

		return ordemRef.set({ ordem });
	}

	function alterarOrdemTipo(ordemTipo) {
		const ordemTipoRef = firebase
			.firestore()
			.collection('ordemTipo')
			.doc(usuario.uid);

		return ordemTipoRef.set({ ordemTipo });
	}

	function criarGrupo(nome) {
		const gruposRef = firebase
			.firestore()
			.collection('grupos')
			.doc();

		return gruposRef.set({
			id: gruposRef.id,
			nome,
			membros: [usuario.uid],
			admins: [usuario.uid]
		});
	}

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
						<Route path="/:id">
							{({ match }) => {
								let grupoId = null;

								if (match) {
									const {
										params: { id }
									} = match;

									grupoId = id === 'meu' ? usuario.uid : id;
								}

								return (
									<>
										<GruposModal
											grupos={grupos}
											gruposInfo={gruposInfo}
											criarGrupo={criarGrupo}
											open={gruposModalVisivel}
											onClose={() => setGruposModalVisivel(false)}
										/>

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
														onClick={() => setGruposModalVisivel(true)}
													>
														<ArrowRightIcon />

														<Typography variant="h6" component="div">
															{grupoId && gruposInfo[grupoId].nome}
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
									</>
								);
							}}
						</Route>

						<Switch>
							<Route
								exact
								path="/"
								render={() => {
									return <Redirect to="/meu" />;
								}}
							/>

							<Route
								path="/:id"
								render={({
									match: {
										url,
										params: { id }
									}
								}) => {
									const grupoId = id === 'meu' ? usuario.uid : id;

									return grupoId && grupos.includes(grupoId) ? (
										<Switch>
											<Route
												exact
												path={url}
												render={routeProps => (
													<Lista
														{...routeProps}
														items={items}
														grupo={itemsGrupos[grupoId]}
														grupoOrdem={grupoOrdem[grupoId]}
														alterarFeito={alterarFeito}
														alterarOrdem={ordem => alterarOrdem(ordem, grupoId)}
														ordemTipo={ordemTipo}
														setOrdemTipo={alterarOrdemTipo}
													/>
												)}
											/>

											<Route
												exact
												path={`${url}/feito`}
												render={routeProps => (
													<Feito
														{...routeProps}
														items={items}
														grupo={itemsGrupos[grupoId]}
														alterarFeito={alterarFeito}
													/>
												)}
											/>

											<Route
												exact
												path={`${url}/novo`}
												render={routeProps => (
													<Novo
														{...routeProps}
														adicionarItem={item => adicionarItem(item, grupoId)}
													/>
												)}
											/>

											<Route
												exact
												path={`${url}/:id`}
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
										</Switch>
									) : (
										<Redirect to="/" />
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
