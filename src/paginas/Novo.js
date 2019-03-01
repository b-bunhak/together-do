import React from 'react';

import { withStyles } from '@material-ui/core/styles';

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

const Novo = ({ classes, history, adicionarItem }) => {
	return (
		<div className={classes.pagina}>
			<Formulario
				submit={v => {
					adicionarItem(v);
				}}
				cancelar={() => history.replace('/')}
			/>
		</div>
	);
};

export default withStyles(styles)(Novo);
