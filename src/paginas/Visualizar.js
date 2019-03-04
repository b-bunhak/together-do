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

const Visualizar = ({
	classes,
	history,
	location,
	inicial,
	editarItem,
	deletarItem,
	alterarFeito
}) => {
	const params = new URLSearchParams(location.search);

	const editar =
		params.has('editar') && params.get('editar').toLowerCase() === 'true';

	return (
		<div className={classes.pagina}>
			<Formulario
				editar={editar}
				inicial={inicial}
				submit={v => {
					return Promise.resolve(editarItem(v)).then(() =>
						history.replace(location.pathname)
					);
				}}
				cancelar={() => history.replace(location.pathname)}
				deletar={deletarItem}
				alterarFeito={alterarFeito}
			/>
		</div>
	);
};

export default withStyles(styles)(Visualizar);
