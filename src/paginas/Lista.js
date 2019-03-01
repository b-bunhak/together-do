import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

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

const Lista = ({ classes }) => {
	return (
		<div className={classes.pagina}>
			<Link to="/novo">
				<Fab color="primary" aria-label="Add" className={classes.fab}>
					<AddIcon />
				</Fab>
			</Link>
		</div>
	);
};

export default withStyles(styles)(Lista);
