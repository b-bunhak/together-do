import React, { useRef, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CopyIcon from '@material-ui/icons/FileCopy';

import Snackbar from '@material-ui/core/Snackbar';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';

import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	conviteDialogPaper: { margin: theme.spacing(2) }
}));

const Membros = ({
	usuarioId,
	grupoInfo: { membros = [], admins = [] },
	membrosInfo,
	novoMembro,
	convites = null,
	...props
}) => {
	const classes = useStyles();

	const [criandoConvite, setCriandoConvite] = useState(false);

	const [snackbarAberto, setSnackbarAberto] = useState(false);

	const [conviteUrl, setConviteUrl] = useState('');

	const [anchorEl, setAnchorEl] = useState(null);

	function handleClick(event) {
		setAnchorEl(event.currentTarget);
	}

	function handleClose() {
		setAnchorEl(null);
	}

	function inputClick(event) {
		if (event.target) {
			event.target.setSelectionRange(0, 9999);

			document.execCommand('copy');

			setSnackbarAberto(true);
		}
	}

	return (
		<Box px={2} display="flex" flexDirection="column" {...props}>
			<Dialog
				fullWidth
				PaperProps={{ className: classes.conviteDialogPaper }}
				open={Boolean(conviteUrl)}
				onClose={() => setConviteUrl('')}
			>
				<Snackbar
					open={snackbarAberto}
					onClose={() => setSnackbarAberto(false)}
					autoHideDuration={2000}
					message="Link Copiado"
				/>

				<DialogTitle>Comparthlhe esse link:</DialogTitle>

				<DialogContent>
					<TextField
						fullWidth
						variant="outlined"
						type="text"
						value={conviteUrl}
						inputProps={{
							readOnly: true
						}}
						// InputProps={{
						// 	endAdornment: (
						// 		<InputAdornment position="end">
						// 			<CopyIcon />
						// 		</InputAdornment>
						// 	)
						// }}
						onClick={inputClick}
					/>
				</DialogContent>

				<DialogActions>
					<Box clone mr="auto">
						<Button color="secondary">Deletar</Button>
					</Box>
					<Button onClick={() => setConviteUrl('')}>Fechar</Button>
				</DialogActions>
			</Dialog>
			<Box
				clone
				bgcolor="background.paper"
				flex={1}
				p={0}
				css={{ overflowY: 'scroll' }}
			>
				<List>
					{membros.map(
						id =>
							membrosInfo[id] && (
								<ListItem key={id}>
									<ListItemText
										primary={membrosInfo[id].nome}
										secondary={admins.includes(id) && 'Admin'}
									/>
									{id !== usuarioId && (
										<ListItemSecondaryAction>
											<IconButton aria-label="Mais" onClick={handleClick}>
												<MoreVertIcon />
											</IconButton>
											<Menu
												id="simple-menu"
												anchorEl={anchorEl}
												open={Boolean(anchorEl)}
												onClose={handleClose}
											>
												<MenuItem onClick={handleClose}>Remover Admin</MenuItem>
												<MenuItem onClick={handleClose}>
													Remover Membro
												</MenuItem>
											</Menu>
										</ListItemSecondaryAction>
									)}
								</ListItem>
							)
					)}

					{Array.isArray(convites) && convites.length > 0 && (
						<Box component="li" bgcolor="inherit">
							<Box component="ul" bgcolor="inherit" p={0}>
								<ListSubheader>Convites Abertos</ListSubheader>

								{convites.map((convite, index) => (
									<ListItem
										key={convite.id}
										onClick={() =>
											setConviteUrl(
												window.location.hostname + '/convite/' + convite.id
											)
										}
									>
										<ListItemText primary={`Convite ${index + 1}`} />
									</ListItem>
								))}
							</Box>
						</Box>
					)}
				</List>
			</Box>

			{admins.includes(usuarioId) && (
				<Box clone mt={1}>
					<Button
						fullWidth
						variant="outlined"
						color="primary"
						disabled={criandoConvite}
						onClick={() => {
							setCriandoConvite(true);
							novoMembro().then(conviteId => {
								setConviteUrl(`${window.location.hostname}/${conviteId}`);
								setCriandoConvite(false);
							});
						}}
					>
						Novo Membro
					</Button>
				</Box>
			)}

			<Box clone my={1}>
				<Button fullWidth color="secondary" variant="outlined">
					Sair do Grupo
				</Button>
			</Box>
		</Box>
	);
};

export default Membros;
