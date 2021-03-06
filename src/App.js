import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import { Route, Switch, Redirect, Link, withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import { partition, isEqual, sortBy, compact, uniq } from 'lodash';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import ChatIcon from '@material-ui/icons/Chat';
import ListIcon from '@material-ui/icons/ListAlt';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import Box from '@material-ui/core/Box';

import GruposModal from './componentes/GruposModal';
import Login from './paginas/Login';
import Lista from './paginas/Lista';
import Feito from './paginas/Feito';
import Novo from './paginas/Novo';
import Visualizar from './paginas/Visualizar';
import Convite from './paginas/Convite';
import BatePapo from './paginas/BatePapo';

import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

const config = {
	apiKey: process.env.REACT_APP_FB_APIKEY,
	authDomain: process.env.REACT_APP_FB_AUTHDOMAIN,
	projectId: process.env.REACT_APP_FB_PROJECTID,
	storageBucket: process.env.REACT_APP_FB_STORAGEBUCKET,
	messagingSenderId: process.env.REACT_APP_FB_MESSAGINGSENDERID,
	appId: process.env.REACT_APP_FB_APPID,
};
firebase.initializeApp(config);
firebase.functions();

const styles = theme => ({
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

const App = ({ classes, location }) => {
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

	// Usuario Info
	//const [usuarioInfoLoading, setUsuarioInfoLoading] = useState(true);
	//const [usuarioInfo, setUsuarioInfo] = useState();

	useEffect(() => {
		if (usuario) {
			//setUsuarioInfoLoading(true);

			return firebase
				.firestore()
				.collection('usuarios')
				.doc(usuario.uid)
				.onSnapshot(snapshot => {
					if (snapshot.get('nome') !== usuario.displayName) {
						snapshot.ref.set({ nome: usuario.displayName }, { merge: true });
					}

					// ReactDOM.unstable_batchedUpdates(() => {
					// 	setUsuarioInfoLoading(false);
					// 	setUsuarioInfo(snapshot.data());
					// });
				});
		}
	}, [usuario]);

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
							nome: 'Eu'
						}
					};

					snapshot.forEach(doc => {
						gruposInfo[doc.id] = doc.data();
					});

					const gruposIds = sortBy(gruposInfo, grupo =>
						grupo.nome.toLowerCase()
					).map(grupo => grupo.id);

					ReactDOM.unstable_batchedUpdates(() => {
						setGruposInfo(gruposInfo);

						setGrupos(grupos =>
							!isEqual(grupos, gruposIds) ? gruposIds : grupos
						);

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

	// Grupo Membros

	const [grupoMembrosInfo, setGrupoMembrosInfo] = useState({});

	useEffect(() => {
		if (usuario) {
			const usuarioIds = uniq(
				compact(
					grupos.flatMap(grupoId =>
						grupoId === usuario.uid ? grupoId : gruposInfo[grupoId].membros
					)
				)
			);

			const unsubs = usuarioIds.map(usuarioId => {
				return firebase
					.firestore()
					.collection('usuarios')
					.doc(usuarioId)
					.onSnapshot(snapshot => {
						if (
							usuarioId === usuario.uid &&
							snapshot.get('nome') !== usuario.displayName
						) {
							snapshot.ref.set({ nome: usuario.displayName }, { merge: true });
						}

						setGrupoMembrosInfo(grupoMembrosInfo => ({
							...grupoMembrosInfo,
							[usuarioId]: snapshot.data()
						}));
					});
			});

			return () => unsubs.forEach(unsub => unsub());
		}
	}, [usuario, grupos, gruposInfo]);

	// Convites

	const [convites, setConvites] = useState({});

	useEffect(() => {
		if (usuario) {
			const gruposAdmin = grupos.reduce((gruposArray, grupoId) => {
				if (
					grupoId !== usuario.uid &&
					gruposInfo[grupoId].admins.includes(usuario.uid)
				) {
					gruposArray.push(grupoId);
				} else {
					setConvites(convites => ({
						...convites,
						[grupoId]: undefined
					}));
				}

				return gruposArray;
			}, []);

			const unSubs = gruposAdmin.map(grupoId => {
				return firebase
					.firestore()
					.collection('convites')
					.where('grupo', '==', grupoId)
					.where('valido', '==', true)
					.onSnapshot(snapshot => {
						setConvites(convites => ({
							...convites,
							[grupoId]: snapshot.docs.map(doc => doc.data())
						}));
					});
			});

			return () => unSubs.forEach(unSub => unSub());
		}
	}, [usuario, grupos, gruposInfo]);

	// Chat
	const [chats, setChat] = useState({});

	useEffect(() => {
		if (usuario) {
			const unsubs = grupos
				.filter(id => id !== usuario.uid)
				.map(grupoId => {
					return firebase
						.firestore()
						.collection('chats')
						.where('grupo', '==', grupoId)
						.orderBy('data')
						.onSnapshot(snapshot => {
							setChat(chat => ({
								...chat,
								[grupoId]: snapshot.docs.map(doc => ({
									...doc.data(),
									data: doc
										.get('data', { serverTimestamps: 'estimate' })
										.toDate()
								}))
							}));
						});
				});

			return () => unsubs.forEach(unsub => unsub());
		}
	}, [usuario, grupos]);

	const [redirectGrupo, setRedirectGrupo] = useState(null);

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
		const batch = firebase.firestore().batch();

		const gruposRef = firebase
			.firestore()
			.collection('grupos')
			.doc();

		batch.set(gruposRef, {
			id: gruposRef.id,
			nome,
			membros: [usuario.uid],
			admins: [usuario.uid]
		});

		const gruposPublicoRef = firebase
			.firestore()
			.collection('gruposPublico')
			.doc(gruposRef.id);

		batch.set(gruposPublicoRef, {
			id: gruposRef.id,
			nome
		});

		setRedirectGrupo(gruposRef.id);

		return batch.commit();
	}

	function alterarGrupoNome(grupoId, nome) {
		const batch = firebase.firestore().batch();

		const gruposRef = firebase
			.firestore()
			.collection('grupos')
			.doc(grupoId);

		batch.set(
			gruposRef,
			{
				nome
			},
			{ merge: true }
		);

		const gruposPublicoRef = firebase
			.firestore()
			.collection('gruposPublico')
			.doc(grupoId);

		batch.set(
			gruposPublicoRef,
			{
				nome
			},
			{ merge: true }
		);

		return batch.commit();
	}

	function novoMembro(grupo) {
		const conviteRef = firebase
			.firestore()
			.collection('convites')
			.doc();

		const convite = {
			id: conviteRef.id,
			grupo,
			valido: true
		};

		return conviteRef.set(convite).then(() => convite.id);
	}

	function removerMembro(grupoId, membroId) {
		const db = firebase.firestore();

		const grupoRef = db.collection('grupos').doc(grupoId);

		return db.runTransaction(transaction =>
			transaction.get(grupoRef).then(grupoDoc => {
				const admins = grupoDoc.get('admins');
				const membros = grupoDoc.get('membros');

				return transaction.set(
					grupoRef,
					{
						admins: admins.filter(id => id !== membroId),
						membros: membros.filter(id => id !== membroId)
					},
					{ merge: true }
				);
			})
		);
	}

	function fazerAdmin(grupoId, membroId) {
		const db = firebase.firestore();

		const grupoRef = db.collection('grupos').doc(grupoId);

		return db.runTransaction(transaction =>
			transaction.get(grupoRef).then(grupoDoc => {
				const admins = grupoDoc.get('admins');
				const membros = grupoDoc.get('membros');

				return transaction.set(
					grupoRef,
					{
						admins: uniq([...admins, membroId]),
						membros: uniq([...membros, membroId])
					},
					{ merge: true }
				);
			})
		);
	}

	function removerAdmin(grupoId, membroId) {
		const db = firebase.firestore();

		const grupoRef = db.collection('grupos').doc(grupoId);

		return db.runTransaction(transaction =>
			transaction.get(grupoRef).then(grupoDoc => {
				const admins = grupoDoc.get('admins');

				return transaction.set(
					grupoRef,
					{
						admins: admins.filter(id => id !== membroId)
					},
					{ merge: true }
				);
			})
		);
	}

	function deletarConvite(conviteId) {
		const conviteRef = firebase
			.firestore()
			.collection('convites')
			.doc(conviteId);

		return conviteRef.delete();
	}

	function aceitarConvite(convite) {
		firebase
			.firestore()
			.collection('convites')
			.doc(convite.id)
			.set({ valido: false, usuarioAceito: usuario.uid }, { merge: true });

		setRedirectGrupo(convite.grupo);
	}

	function sairGrupo(grupoId) {
		return firebase
			.functions()
			.httpsCallable('sairGrupo')({ grupo: grupoId })
			.then(() => setGrupos(grupos.filter(id => id !== grupoId)));
	}

	function enviarMensagem(grupoId, mensagen) {
		const mensagenRef = firebase
			.firestore()
			.collection('chats')
			.doc();

		mensagenRef.set({
			id: mensagenRef.id,
			autor: usuario.uid,
			data: firebase.firestore.FieldValue.serverTimestamp(),
			mensagen: mensagen,
			grupo: grupoId
		});
	}

	useEffect(() => {
		if (redirectGrupo && location.pathname === `/${redirectGrupo}`) {
			setRedirectGrupo(null);
		}
	}, [redirectGrupo, location.pathname]);

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
				) : redirectGrupo &&
				  gruposInfo[redirectGrupo] &&
				  location.pathname !== `/${redirectGrupo}` ? (
					<Redirect to={`/${redirectGrupo}`} />
				) : (
					<Switch>
						<Route
							exact
							path="/"
							render={() => {
								return <Redirect to="/eu" />;
							}}
						/>

						<Route
							exact
							path="/convite/:id"
							render={routeProps => (
								<Convite aceitarConvite={aceitarConvite} {...routeProps} />
							)}
						/>

						<Route path="/:id">
							{({
								match: {
									params: { id },
									url
								}
							}) => {
								let grupoId = null;

								if (id) {
									grupoId = id === 'eu' ? usuario.uid : id;
								}

								return grupoId && grupos.includes(grupoId) ? (
									<>
										<GruposModal
											usuarioId={usuario.uid}
											grupoAtual={grupoId}
											grupos={grupos}
											gruposInfo={gruposInfo}
											membrosInfo={grupoMembrosInfo}
											criarGrupo={criarGrupo}
											alterarGrupoNome={nome => alterarGrupoNome(grupoId, nome)}
											open={gruposModalVisivel}
											onClose={() => setGruposModalVisivel(false)}
											novoMembro={() => novoMembro(grupoId)}
											removerMembro={membro => removerMembro(grupoId, membro)}
											fazerAdmin={membro => fazerAdmin(grupoId, membro)}
											removerAdmin={membro => removerAdmin(grupoId, membro)}
											convites={convites}
											deletarConvite={deletarConvite}
											sairGrupo={() => sairGrupo(grupoId)}
										/>

										<AppBar position="static">
											<Toolbar>
												{id !== 'eu' &&
													(window.location.pathname === `/${grupoId}/chat` ? (
														<Box clone mr={1.5}>
															<Link
																component={IconButton}
																to={`/${grupoId}`}
																color="primary"
															>
																<Box clone color="primary.contrastText">
																	<ListIcon />
																</Box>
															</Link>
														</Box>
													) : (
														<Box clone mr={1.5}>
															<Badge
																variant="dot"
																color="secondary"
																invisible={true}
															>
																<Link
																	component={IconButton}
																	to={`/${grupoId}/chat`}
																	color="primary"
																>
																	<Box clone color="primary.contrastText">
																		<ChatIcon />
																	</Box>
																</Link>
															</Badge>
														</Box>
													))}
												<Box
													flex={1}
													color="inherit"
													position="relative"
													onClick={() => setGruposModalVisivel(true)}
													border={1}
													borderRadius="borderRadius"
													py={0.75}
													px={1}
													my={1}
													display="flex"
													alignItems="center"
													css={{ minWidth: 0 }}
												>
													<Box
														clone
														position="absolute"
														bgcolor="primary.main"
														px={0.5}
														css={{ top: '-25%' }}
													>
														<Typography variant="caption" component="div">
															Grupo
														</Typography>
													</Box>
													<Typography noWrap variant="h6" component="div">
														{grupoId && gruposInfo[grupoId].nome}
													</Typography>
													<Box clone ml="auto">
														<ArrowDropDownIcon />
													</Box>
												</Box>

												<Box clone ml={1.5}>
													<Button
														color="inherit"
														onClick={() => firebase.auth().signOut()}
													>
														Sair
													</Button>
												</Box>
											</Toolbar>
										</AppBar>

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
												path={`${url}/chat`}
												render={routeProps => (
													<BatePapo
														{...routeProps}
														mensagens={chats[grupoId]}
														enviarMensagem={mensagen =>
															enviarMensagem(grupoId, mensagen)
														}
														usuarioId={usuario.uid}
														membrosInfo={grupoMembrosInfo}
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
												path={[`${url}/:id`, `${url}/feito/:id`]}
												render={routeProps => {
													const {
														match: {
															url,
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
														return (
															<Redirect
																to={url.substring(0, url.lastIndexOf('/'))}
															/>
														);
													}
												}}
											/>
										</Switch>
									</>
								) : (
									<Redirect to="/" />
								);
							}}
						</Route>
					</Switch>
				)}
			</React.Fragment>
		</MuiPickersUtilsProvider>
	);
};

export default withRouter(withStyles(styles)(App));
