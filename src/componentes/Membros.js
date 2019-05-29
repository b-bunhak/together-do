import React from 'react';

import Button from '@material-ui/core/Button';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Box from '@material-ui/core/Box';

const Membros = ({
	usuarioId,
	grupoInfo: { membros = [], admins = [] },
	membrosInfo,
	...props
}) => {
	const [anchorEl, setAnchorEl] = React.useState(null);

	function handleClick(event) {
		setAnchorEl(event.currentTarget);
	}

	function handleClose() {
		setAnchorEl(null);
	}

	return (
		<Box px={2} {...props}>
			{admins.includes(usuarioId) && (
				<ListItem button>
					<ListItemText primary="Novo Membro" />
				</ListItem>
			)}

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
										<IconButton
											edge="end"
											aria-label="Mais"
											onClick={handleClick}
										>
											<MoreVertIcon />
										</IconButton>
										<Menu
											id="simple-menu"
											anchorEl={anchorEl}
											open={Boolean(anchorEl)}
											onClose={handleClose}
										>
											<MenuItem onClick={handleClose}>Remover Admin</MenuItem>
											<MenuItem onClick={handleClose}>Remover Membro</MenuItem>
										</Menu>
									</ListItemSecondaryAction>
								)}
							</ListItem>
						)
				)}
			</List>
			<Button fullWidth color="secondary" variant="contained">
				Sair do Grupo
			</Button>
		</Box>
	);
};

export default Membros;
