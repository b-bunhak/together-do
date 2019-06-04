import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import * as firebase from 'firebase/app';

import { Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

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
		justifyContent: 'center',
		alignItems: 'center'
	}
}));

function aceitarConvite(id) {
	firebase
		.firestore()
		.collection('convites')
		.doc(id)
		.set(
			{ valido: false, usuarioAceito: firebase.auth().currentUser.uid },
			{ merge: true }
		);
}

const Convite = ({
	match: {
		params: { id }
	}
}) => {
	const classes = useStyles();

	const [conviteLodaing, setConviteLoading] = useState(true);
	const [convite, setConvite] = useState(null);

	useEffect(() => {
		setConviteLoading(true);

		return firebase
			.firestore()
			.collection('convites')
			.doc(id)
			.onSnapshot(
				snapshot => {
					ReactDOM.unstable_batchedUpdates(() => {
						setConvite(snapshot.data());
						setConviteLoading(false);
					});
				},
				() => {
					ReactDOM.unstable_batchedUpdates(() => {
						setConvite(null);
						setConviteLoading(false);
					});
				}
			);
	}, [id]);

	return (
		!conviteLodaing &&
		(convite ? (
			<div className={classes.pagina}>
				<Button
					fullWidth
					variant="contained"
					color="primary"
					onClick={() => aceitarConvite(id)}
				>
					Aceitar Convite
				</Button>
			</div>
		) : (
			<Redirect to="/" />
		))
	);
};

export default Convite;
