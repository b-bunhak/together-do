import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { withRouter } from 'react-router-dom';

import Formulario from '../componentes/Formulario';

const styles = theme => ({
	pagina: {
		padding: theme.spacing(2)
	},
	fab: {
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2)
	}
});

const Lista = ({ classes, history }) => {
	return (
		<div className={classes.pagina}>
			<Formulario
				submit={v => console.log(v)}
				cancelar={() => history.replace('/')}
			/>
		</div>
	);
};

export default withRouter(withStyles(styles)(Lista));
