import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

const styles = theme => ({
	itemLink: {
		flex: '1',
		display: 'flex',
		alignItems: 'center',
		fontSize: theme.typography.body1.fontSize,
		textDecoration: 'none',
		color: 'inherit',
		padding: theme.spacing(1.5)
	}
});

const ItemLink = ({ classes, ...props }) => (
	<Link className={classes.itemLink} {...props} />
);

export default withStyles(styles)(ItemLink);
