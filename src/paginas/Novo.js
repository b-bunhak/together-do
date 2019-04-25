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
				novo
				editar
				submit={v => {
					return Promise.resolve(adicionarItem(v)).then(() =>
						history.replace('/')
					);
				}}
				cancelar={() => history.replace('/')}
			/>
		</div>
	);
};

export default withStyles(styles)(Novo);
