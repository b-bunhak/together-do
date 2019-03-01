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

const Visualizar = ({ classes, history, inicial, editarItem, deletarItem }) => {
	return (
		<div className={classes.pagina}>
			<Formulario
				inicial={inicial}
				submit={v => {
					editarItem(v);
				}}
				cancelar={() => history.replace('/')}
				deletar={deletarItem}
			/>
		</div>
	);
};

export default withStyles(styles)(Visualizar);
