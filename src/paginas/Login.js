import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import * as firebase from 'firebase/app';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Box } from '@material-ui/core';

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
		flexDirection: 'column',
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

	signInOptions: [
		firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		firebase.auth.FacebookAuthProvider.PROVIDER_ID
	]
};

const Login = ({ classes }) => (
	<div className={classes.pagina}>
		<Box clone my="auto">
			<Typography variant="h3" component="div">
				Together-Do
			</Typography>
		</Box>

		<Box clone mb="auto">
			<StyledFirebaseAuth
				uiConfig={uiConfig}
				firebaseAuth={firebase.auth()}
				className={classes.authContainer}
			/>
		</Box>
	</div>
);

export default withStyles(styles)(Login);
