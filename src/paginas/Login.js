import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import * as firebase from 'firebase/app';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
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
	},
	authContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center'
	}
});

const uiConfig = {
	signInFlow: 'redirect',

	signInSuccessUrl: '/',

	signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
};

const Login = ({ classes }) => (
	<div className={classes.pagina}>
		<StyledFirebaseAuth
			uiConfig={uiConfig}
			firebaseAuth={firebase.auth()}
			className={classes.authContainer}
		/>
	</div>
);

export default withStyles(styles)(Login);
