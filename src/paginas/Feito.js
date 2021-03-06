import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';

import IconButton from '@material-ui/core/IconButton';
import BackIcon from '@material-ui/icons/ArrowBack';
import UndoIcon from '@material-ui/icons/Undo';

import Box from '@material-ui/core/Box';

import FlipMove from 'react-flip-move';

const styles = theme => ({
	'@global': {
		html: {
			height: '100%'
		},
		body: { height: '100%' },
		'#root': { height: '100%', display: 'flex', flexDirection: 'column' }
	},

	pagina: {
		flex: 1,
		padding: theme.spacing(2),
		paddingBottom: 0,
		display: 'flex',
		flexDirection: 'column'
	},

	lista: {
		flex: '1',
		paddingBottom: theme.spacing(10),
		overflowY: 'scroll',
		'-webkit-overflow-scrolling': 'touch'
	},

	itemLink: {
		flex: '1',
		fontSize: theme.typography.body1.fontSize,
		textDecoration: 'none',
		color: 'inherit',
		padding: theme.spacing(1.5)
	}
});

const Feito = ({
	classes,
	items,
	grupo: { feito = [] } = {},
	alterarFeito,
	match
}) => {
	return (
		<div className={classes.pagina}>
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Typography variant="h3" gutterBottom component="div">
					Feito
				</Typography>

				<IconButton
					component={Link}
					to={match.url.substring(0, match.url.lastIndexOf('/'))}
				>
					<BackIcon />
				</IconButton>
			</Box>

			<List>
				<FlipMove>
					{feito.map(itemId => {
						const item = items.get(itemId);

						return (
							<Box
								key={item.id}
								borderBottom={1}
								borderColor="divider"
								display="flex"
								component="li"
								alignItems="center"
								bgcolor="background.default"
							>
								<Typography
									noWrap
									component={Link}
									to={`./feito/${item.id}`}
									className={classes.itemLink}
								>
									{item.item}
								</Typography>

								<IconButton
									color="primary"
									onClick={() => alterarFeito(item.id, false)}
								>
									<UndoIcon />
								</IconButton>
							</Box>
						);
					})}
				</FlipMove>
			</List>
		</div>
	);
};

export default withStyles(styles)(Feito);
