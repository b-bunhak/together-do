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
	match,
	inicial,
	editarItem,
	deletarItem,
	alterarFeito
}) => {
	const params = new URLSearchParams(location.search);

	const editar =
		params.has('editar') && params.get('editar').toLowerCase() === 'true';

	const voltarUrl = match.url.substring(0, match.url.lastIndexOf('/'));

	return (
		<div className={classes.pagina}>
			<Formulario
				editar={editar}
				inicial={inicial}
				submit={v => {
					return Promise.resolve(editarItem(v)).then(() =>
						history.replace(voltarUrl)
					);
				}}
				cancelar={() => history.replace(match.url)}
				deletar={deletarItem}
				alterarFeito={alterarFeito}
				voltarLink={voltarUrl}
			/>
		</div>
	);
};

export default withStyles(styles)(Visualizar);
