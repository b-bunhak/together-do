import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Button from '@material-ui/core/Button';

import Checkbox from '@material-ui/core/Checkbox';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import FlipMove from 'react-flip-move';

import Box from '@material-ui/core/Box';

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
		minWidth: 0,
		flex: '1',
		fontSize: theme.typography.body1.fontSize,
		textDecoration: 'none',
		color: 'inherit',
		padding: theme.spacing(1.5)
	},

	fab: {
		position: 'fixed',
		bottom: theme.spacing(2),
		right: theme.spacing(2)
	}
});

const Lista = ({
	classes,
	items,
	grupo: { naoFeito = [], ordemEntrega = [] },
	grupoOrdem,
	alterarFeito,
	alterarOrdem,
	ordemTipo,
	setOrdemTipo,
	match
}) => {
	const [labelWidth, setLabelWidth] = useState(0);

	let listaOrdem = naoFeito;
	if (ordemTipo === 'prioridade') {
		listaOrdem = grupoOrdem.ordem || [];
	}
	if (ordemTipo === 'entrega') {
		listaOrdem = ordemEntrega;
	}

	return (
		<>
			<div className={classes.pagina}>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Typography variant="h3" gutterBottom component="div">
						A Fazer
					</Typography>

					<Button
						component={Link}
						to={`${match.url}/feito`}
						variant="outlined"
						className={classes.button}
					>
						Feito
					</Button>
				</Box>

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
						<MenuItem value="data">Data de Criação</MenuItem>
						<MenuItem value="entrega">Data de Entrega</MenuItem>
						<MenuItem value="prioridade">Prioridade</MenuItem>
					</Select>
				</FormControl>

				<DragDropContext
					onDragEnd={result => {
						if (result.destination) {
							grupoOrdem.ordem.splice(
								result.destination.index,
								0,
								grupoOrdem.ordem.splice(result.source.index, 1)[0]
							);

							alterarOrdem(grupoOrdem.ordem);
						}
					}}
				>
					<Droppable droppableId="droppable">
						{(provided, snapshot) => (
							<List
								{...provided.droppableProps}
								innerRef={provided.innerRef}
								className={classes.lista}
							>
								<FlipMove>
									{listaOrdem.map((itemId, index) => {
										const item = items.get(itemId);

										return (
											<Draggable
												key={item.id}
												draggableId={item.id}
												index={index}
												isDragDisabled={ordemTipo !== 'prioridade'}
											>
												{provided => (
													<Box
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														borderBottom={1}
														borderColor="divider"
														display="flex"
														component="li"
														alignItems="center"
														bgcolor="background.default"
													>
														{ordemTipo === 'prioridade' && <DragHandleIcon />}

														<Link
															to={`${match.url}/${item.id}`}
															className={classes.itemLink}
														>
															<Typography noWrap component="div">
																{item.item}
															</Typography>
															<Box
																clone
																mt={0.5}
																color={
																	item.dataEntrega &&
																	item.dataEntrega < new Date()
																		? 'error.main'
																		: 'default'
																}
															>
																<Typography variant="body2">
																	{item.dataEntrega &&
																		item.dataEntrega.toLocaleDateString(
																			'default',
																			{
																				day: '2-digit',
																				month: '2-digit',
																				year: 'numeric'
																			}
																		)}
																</Typography>
															</Box>
														</Link>

														<Checkbox
															checked={!!item.feito}
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
								</FlipMove>
							</List>
						)}
					</Droppable>
				</DragDropContext>
			</div>

			<Fab
				color="primary"
				aria-label="Add"
				className={classes.fab}
				component={Link}
				to={`${match.url}/novo`}
			>
				<AddIcon />
			</Fab>
		</>
	);
};

export default withStyles(styles)(Lista);
