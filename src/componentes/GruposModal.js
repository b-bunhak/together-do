import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Dialog from '@material-ui/core/Dialog';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import PeolpleIcon from '@material-ui/icons/People';

import Fade from '@material-ui/core/Fade';

import {
	DialogContent,
	DialogActions,
	TextField,
	Divider
} from '@material-ui/core';

import Box from '@material-ui/core/Box';

import { Formik, Form, Field } from 'formik';

import * as yup from 'yup';
import Membros from './Membros';

const schema = yup.object().shape({
	nome: yup.string().required()
});

const useStyles = makeStyles(theme => ({
	espacoDialog: { margin: theme.spacing(2) }
}));

const GruposModal = ({
	usuarioId,
	grupoAtual,
	grupos,
	gruposInfo,
	membrosInfo,
	criarGrupo,
	alterarGrupoNome,
	open,
	onClose,
	novoMembro,
	removerMembro,
	fazerAdmin,
	removerAdmin,
	convites,
	deletarConvite,
	sairGrupo,
	...props
}) => {
	const [formInicial, setFormInicial] = useState({ nome: '' });

	const [formVisivel, setFormVisivel] = useState(false);

	const [membrosTelaAberta, setMembrosTelaAberta] = useState(false);

	const classes = useStyles();

	function openCriarForm() {
		setFormVisivel(true);
	}

	function openUpdateForm() {
		setFormInicial({ nome: gruposInfo[grupoAtual].nome });
		setFormVisivel(true);
	}

	function fecharForm() {
		setFormVisivel(false);
		setFormInicial({ nome: '' });
	}

	return (
		<Dialog
			fullScreen
			fullWidth
			scroll="paper"
			//PaperProps={{ className: classes.espacoDialog }}
			open={open}
			onClose={onClose}
			{...props}
		>
			<Formik
				enableReinitialize
				initialValues={formInicial}
				validationSchema={schema}
				onSubmit={(values, { resetForm }) => {
					const submit = Boolean(formInicial.nome)
						? alterarGrupoNome
						: criarGrupo;

					return submit(values.nome).then(() => {
						fecharForm();
						resetForm();
					});
				}}
			>
				{() => (
					<Dialog
						fullWidth
						PaperProps={{ className: classes.espacoDialog }}
						open={formVisivel}
						onClose={fecharForm}
					>
						<Form>
							<DialogContent>
								<Field name="nome">
									{({ field, form: { touched, errors } }) => (
										<TextField
											{...field}
											type="text"
											fullWidth
											margin="normal"
											label="Nome"
											variant="outlined"
											error={!!errors[field.name] && !!touched[field.name]}
											helperText={touched[field.name] && errors[field.name]}
										/>
									)}
								</Field>
							</DialogContent>
							<DialogActions>
								<Button color="primary" type="reset" onClick={fecharForm}>
									Cancelar
								</Button>
								<Button color="primary" type="submit">
									{Boolean(formInicial.nome) ? 'Salvar' : 'Criar'}
								</Button>
							</DialogActions>
						</Form>
					</Dialog>
				)}
			</Formik>

			<Box px={2} pt={1} pb={0} display="flex" alignItems="center">
				<Typography variant="h5" component="div">
					Grupos
				</Typography>

				<Box clone ml={1}>
					<Button variant="outlined" size="small" onClick={openCriarForm}>
						Criar
					</Button>
				</Box>

				<Box clone ml="auto">
					<IconButton aria-label="fechar" onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>
			</Box>

			<Divider />

			<Box px={3} py={2}>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					mb={0.5}
				>
					<Typography variant="h6" component="div" gutterBottom>
						{gruposInfo[grupoAtual] && gruposInfo[grupoAtual].nome}
					</Typography>
					<Fade
						in={
							gruposInfo[grupoAtual] &&
							gruposInfo[grupoAtual].membros &&
							gruposInfo[grupoAtual].admins.includes(usuarioId)
						}
					>
						<IconButton aria-label="editar" onClick={openUpdateForm}>
							<EditIcon />
						</IconButton>
					</Fade>
				</Box>

				{gruposInfo[grupoAtual] && gruposInfo[grupoAtual].membros && (
					<Button
						size="small"
						variant="outlined"
						onClick={() => setMembrosTelaAberta(!membrosTelaAberta)}
					>
						{gruposInfo[grupoAtual].membros.length} Membro
						{gruposInfo[grupoAtual].membros.length > 1 && 's'}
						<Box clone ml={1}>
							<PeolpleIcon />
						</Box>
					</Button>
				)}
			</Box>

			<Divider variant="middle" />

			{membrosTelaAberta ? (
				<Membros
					usuarioId={usuarioId}
					grupoInfo={gruposInfo[grupoAtual]}
					membrosInfo={membrosInfo}
					novoMembro={novoMembro}
					removerMembro={removerMembro}
					fazerAdmin={fazerAdmin}
					removerAdmin={removerAdmin}
					convites={convites[grupoAtual]}
					deletarConvite={deletarConvite}
					sairGrupo={sairGrupo}
				/>
			) : (
				<Box clone px={2} css={{ overflowY: 'scroll' }}>
					<List>
						{grupoAtual !== usuarioId && (
							<ListItem button component={Link} to="/eu" onClick={onClose}>
								<ListItemText primary={gruposInfo[usuarioId].nome} />
							</ListItem>
						)}
						{grupos.map(id =>
							id === grupoAtual || id === usuarioId ? null : (
								<ListItem
									key={id}
									button
									component={Link}
									to={gruposInfo[id].nome === 'Eu' ? '/eu' : `${id}`}
									onClick={onClose}
								>
									<ListItemText primary={gruposInfo[id].nome} />
								</ListItem>
							)
						)}
					</List>
				</Box>
			)}
		</Dialog>
	);
};

export default GruposModal;
