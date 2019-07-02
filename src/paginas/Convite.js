import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import * as firebase from 'firebase/app';

import { Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import { Typography, Box } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	'@global': {
		html: {
			height: '100%'
		},
		body: { height: '100%' },
		'#root': { height: '100%' }
	},
	pagina: {
		height: '100%',
		padding: theme.spacing(2),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	}
}));

const Convite = ({
	aceitarConvite,
	match: {
		params: { id }
	}
}) => {
	const classes = useStyles();

	const [conviteLodaing, setConviteLoading] = useState(true);
	const [convite, setConvite] = useState(null);
	const [grupo, setGrupo] = useState(null);
	const [conviteAceito, setConviteAceito] = useState(false);

	useEffect(() => {
		setConviteLoading(true);

		return firebase
			.firestore()
			.collection('convites')
			.doc(id)
			.onSnapshot(
				snapshot => {
					firebase
						.firestore()
						.collection('gruposPublico')
						.doc(snapshot.get('grupo'))
						.get()
						.then(snap => {
							if (!conviteAceito) {
								ReactDOM.unstable_batchedUpdates(() => {
									setConvite(snapshot.data());
									setGrupo(snap.data());
									setConviteLoading(false);
								});
							}
						});
				},
				() => {
					ReactDOM.unstable_batchedUpdates(() => {
						setConvite(null);
						setConviteLoading(false);
					});
				}
			);
	}, [id, conviteAceito]);

	return (
		!conviteLodaing &&
		(convite ? (
			<div className={classes.pagina}>
				<Box m="auto" textAlign="center">
					<Box clone mb={1}>
						<Typography variant="h6" component="div">
							Convite do grupo:
						</Typography>
					</Box>
					<Typography variant="h4" component="div">
						{grupo.nome}
					</Typography>
				</Box>

				<Box mb="auto">
					<Box clone my={2}>
						<Button
							fullWidth
							variant="contained"
							color="primary"
							onClick={() => {
								setConviteAceito(true);
								aceitarConvite(convite);
							}}
						>
							Aceitar Convite
						</Button>
					</Box>
					<Button
						fullWidth
						variant="contained"
						onClick={() => setConvite(null)}
					>
						Voltar
					</Button>
				</Box>
			</div>
		) : (
			<Redirect to="/" />
		))
	);
};

export default Convite;
