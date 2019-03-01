import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

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

const Lista = ({ classes, items }) => {
	return (
		<div className={classes.pagina}>
			<List>
				{[...items.values()].map(item => (
					<ListItem key={item.id} divider button>
						<ListItemText primary={item.item} />
					</ListItem>
				))}
			</List>

			<Link to="/novo">
				<Fab color="primary" aria-label="Add" className={classes.fab}>
					<AddIcon />
				</Fab>
			</Link>
		</div>
	);
};

export default withStyles(styles)(Lista);
