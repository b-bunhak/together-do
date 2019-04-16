import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import List from '@material-ui/core/List';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import Checkbox from '@material-ui/core/Checkbox';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Box from '@material-ui/core/Box';

const styles = theme => ({
	pagina: {
		padding: theme.spacing(2),
		paddingBottom: theme.spacing(10)
	},

	fab: {
		position: 'fixed',
		bottom: theme.spacing(2),
		right: theme.spacing(2)
	},
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

const Lista = ({
	classes,
	items = [],
	ordem = [],
	alterarFeito,
	alterarOrdem
}) => {
	const [labelWidth, setLabelWidth] = useState(0);

	const [ordemTipo, setOrdemTipo] = useState();

	const listaOrdem =
		ordemTipo === 'prioridade'
			? ordem
			: [...items.values()]
					.sort((item1, item2) => item2.dataCriado - item1.dataCriado)
					.map(item => item.id);

	return (
		<div className={classes.pagina}>
			<FormControl variant="outlined" fullWidth>
				<InputLabel
					ref={ref => {
						if (ref && ref.offsetWidth !== labelWidth) {
							setLabelWidth(ref.offsetWidth);
						}
					}}
					htmlFor="outlined-age-simple"
				>
					Ordernar Por:
				</InputLabel>
				<Select
					value={ordemTipo || 'data'}
					onChange={event => setOrdemTipo(event.target.value)}
					input={
						<OutlinedInput
							labelWidth={labelWidth}
							name="age"
							id="outlined-age-simple"
						/>
					}
				>
					<MenuItem value="data">Data</MenuItem>
					<MenuItem value="prioridade">Prioridade</MenuItem>
				</Select>
			</FormControl>

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
							{listaOrdem.map((itemId, index) => {
								const item = items.get(itemId);

								return (
									<Draggable
										key={item.id}
										draggableId={item.id}
										index={index}
										isDragDisabled={ordemTipo !== 'prioridade'}
									>
										{(provided, snapshot) => (
											<Box
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												borderBottom={1}
												borderColor="divider"
												display="flex"
												component="li"
											>
												<Link to={`/${item.id}`} className={classes.itemLink}>
													{item.item}
												</Link>

												<Checkbox
													checked={item.feito}
													onChange={e =>
														alterarFeito(item.id, e.target.checked)
													}
												/>
											</Box>
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
