import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import Checkbox from '@material-ui/core/Checkbox';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const styles = theme => ({
	pagina: {
		padding: theme.spacing(2),
		paddingBottom: theme.spacing(10)
	},

	fab: {
		position: 'fixed',
		bottom: theme.spacing(2),
		right: theme.spacing(2)
	}
});

const Lista = ({ classes, items, ordem = [], alterarFeito, alterarOrdem }) => {
	return (
		<div className={classes.pagina}>
			<DragDropContext
				onDragEnd={result => {
					if (result.destination) {
						ordem.splice(
							result.destination.index,
							0,
							ordem.splice(result.source.index, 1)[0]
						);

						alterarOrdem(ordem);
					}
				}}
			>
				<Droppable droppableId="droppable">
					{(provided, snapshot) => (
						<List {...provided.droppableProps} innerRef={provided.innerRef}>
							{ordem.map((itemId, index) => {
								const item = items.get(itemId);

								return (
									<Draggable key={item.id} draggableId={item.id} index={index}>
										{(provided, snapshot) => (
											<ListItem
												innerRef={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												divider
												component={Link}
												to={`/${item.id}`}
											>
												<ListItemText primary={item.item} />

												<ListItemSecondaryAction>
													<Checkbox
														checked={item.feito}
														onChange={e =>
															alterarFeito(item.id, e.target.checked)
														}
													/>
												</ListItemSecondaryAction>
											</ListItem>
										)}
									</Draggable>
								);
							})}

							{provided.placeholder}
						</List>
					)}
				</Droppable>
			</DragDropContext>

			<Link to="/novo">
				<Fab color="primary" aria-label="Add" className={classes.fab}>
					<AddIcon />
				</Fab>
			</Link>
		</div>
	);
};

export default withStyles(styles)(Lista);
