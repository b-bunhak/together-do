import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Snackbar from '@material-ui/core/Snackbar';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DialogTitle from '@material-ui/core/DialogTitle';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import TextField from '@material-ui/core/TextField';

import CircularProgress from '@material-ui/core/CircularProgress';

import Box from '@material-ui/core/Box';

import QRCode from 'qrcode.react';

const useStyles = makeStyles(theme => ({
	conviteDialogPaper: { margin: theme.spacing(2), width: '100%' }
}));

const Membros = ({
	usuarioId,
	grupoInfo: { membros = [], admins = [] },
	membrosInfo,
	novoMembro,
	convites = null,
	deletarConvite,
	removerMembro,
	fazerAdmin,
	removerAdmin,
	sairGrupo,
	...props
}) => {
	const classes = useStyles();

	const [criandoConvite, setCriandoConvite] = useState(false);

	const [snackbarAberto, setSnackbarAberto] = useState(false);

	const [conviteId, setConviteId] = useState(null);

	const [menuId, setMenuId] = useState(null);

	const [anchorEl, setAnchorEl] = useState(null);

	const [saindoGrupo, setSaindoGrupo] = useState(false);

	function handleClick(id, event) {
		setMenuId(id);
		setAnchorEl(event.currentTarget);
	}

	function handleClose() {
		setAnchorEl(null);
		setMenuId(null);
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
				PaperProps={{ className: classes.conviteDialogPaper }}
				open={Boolean(
					conviteId &&
						Array.isArray(convites) &&
						convites.find(convite => convite.id === conviteId)
				)}
				onClose={() => setConviteId(null)}
			>
				<Snackbar
					open={snackbarAberto}
					onClose={() => setSnackbarAberto(false)}
					autoHideDuration={2000}
					message="Link Copiado"
				/>

				<DialogTitle>Comparthlhe esse link:</DialogTitle>

				<Box clone display="flex" flexDirection="column" alignItems="center">
					<DialogContent>
						<QRCode
							value={`${window.location.origin}/convite/${conviteId}`}
							renderAs={'svg'}
						/>
						<Box clone mt={1}>
							<TextField
								fullWidth
								variant="outlined"
								type="text"
								value={
									conviteId
										? `${window.location.origin}/convite/${conviteId}`
										: ''
								}
								inputProps={{
									readOnly: true
								}}
								onClick={inputClick}
							/>
						</Box>
					</DialogContent>
				</Box>

				<DialogActions>
					<Box clone mr="auto">
						<Button color="secondary" onClick={() => deletarConvite(conviteId)}>
							Deletar
						</Button>
					</Box>
					<Button onClick={() => setConviteId(null)}>Fechar</Button>
				</DialogActions>
			</Dialog>

			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
				{admins.includes(menuId) ? (
					<MenuItem
						onClick={() => {
							removerAdmin(menuId);
							handleClose();
						}}
					>
						Remover Admin
					</MenuItem>
				) : (
					<MenuItem
						onClick={() => {
							fazerAdmin(menuId);
							handleClose();
						}}
					>
						Fazer Admin
					</MenuItem>
				)}
				<MenuItem
					onClick={() => {
						removerMembro(menuId);
						handleClose();
					}}
				>
					Remover Membro
				</MenuItem>
			</Menu>

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
									{id !== usuarioId && admins.includes(usuarioId) && 'Admin' && (
										<ListItemSecondaryAction>
											<IconButton
												aria-label="Mais"
												onClick={e => handleClick(id, e)}
											>
												<MoreVertIcon />
											</IconButton>
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
										onClick={() => setConviteId(convite.id)}
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
						disabled={criandoConvite || saindoGrupo}
						onClick={() => {
							setCriandoConvite(true);
							novoMembro().then(conviteId => {
								setConviteId(conviteId);
								setCriandoConvite(false);
							});
						}}
					>
						Novo Membro
					</Button>
				</Box>
			)}

			<Box position="relative" my={1}>
				<Button
					fullWidth
					color="secondary"
					variant="outlined"
					onClick={() => {
						setSaindoGrupo(true);
						sairGrupo();
					}}
					disabled={saindoGrupo}
				>
					Sair do Grupo
				</Button>
				{saindoGrupo && (
					<Box
						clone
						color="secondary.main"
						position="absolute"
						css={{ top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
					>
						<CircularProgress size={24} />
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default Membros;
