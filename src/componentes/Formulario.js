import React from 'react';

import { Formik, Form, Field } from 'formik';

import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';

import Button from '@material-ui/core/Button';

import red from '@material-ui/core/colors/red';

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';

import Divider from '@material-ui/core/Divider';

import { Link } from 'react-router-dom';

import * as yup from 'yup';

import IconButton from '@material-ui/core/IconButton';
import BackIcon from '@material-ui/icons/ArrowBack';

const styles = theme => ({
	pagina: {
		padding: theme.spacing(2)
	},
	botaoDeletar: {
		color: theme.palette.getContrastText(red[500]),
		backgroundColor: red[500]
	},
	botaoDiv: {
		display: 'flex',
		justifyContent: 'space-between',
		marginTop: theme.spacing(1)
	},
	feitoContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		'& > span': {
			display: 'flex',
			alignItems: 'center',
			alignText: 'middle',
			padding: theme.spacing(2)
		}
	}
});

yup.setLocale({
	mixed: {
		default: 'Não é válido',
		required: 'Campo obrigatorio'
	}
});

const schema = yup.object().shape({
	item: yup.string().required(),
	feito: yup.date().nullable()
});

const inicialPadrao = { item: '', feito: null };

const Formulario = ({
	classes,
	inicial,
	submit,
	cancelar,
	deletar,
	editar = false,
	alterarFeito,
	novo = false
}) => {
	return (
		<Formik
			enableReinitialize
			initialStatus={{ submitted: false }}
			initialValues={inicial || inicialPadrao}
			validationSchema={schema}
			onSubmit={values => {
				return Promise.resolve(submit(values));
			}}
		>
			{() => (
				<>
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<IconButton component={Link} to="." replace>
							<BackIcon />
						</IconButton>

						{!editar && (
							<Button component={Link} to="?editar=true">
								Editar
							</Button>
						)}
					</div>

					<Divider />

					<Form>
						<Field name="item">
							{({ field, form: { touched, errors } }) => (
								<TextField
									{...field}
									fullWidth
									margin="normal"
									label="Item"
									variant="outlined"
									error={!!errors[field.name] && !!touched[field.name]}
									helperText={touched[field.name] && errors[field.name]}
									inputProps={{ readOnly: !editar }}
								/>
							)}
						</Field>

						{!novo && (
							<Field name="feito">
								{({ field: { value, onChange, ...field } }) => (
									<FormControl fullWidth>
										<FormLabel className={classes.feitoContainer}>
											<span>Feito</span>
											<Checkbox
												{...field}
												checked={!!value}
												onChange={
													inicial && alterarFeito
														? e => {
																alterarFeito(inicial.id, e.target.checked);
														  }
														: onChange
												}
											/>
										</FormLabel>
									</FormControl>
								)}
							</Field>
						)}

						{editar && (
							<div className={classes.botaoDiv}>
								{typeof deletar === 'function' && (
									<Button
										variant="contained"
										type="button"
										className={classes.botaoDeletar}
										onClick={deletar}
									>
										Deletar
									</Button>
								)}

								{typeof cancelar === 'function' && (
									<Button variant="contained" type="button" onClick={cancelar}>
										Cancelar
									</Button>
								)}

								<Button variant="contained" type="submit" color="primary">
									Salvar
								</Button>
							</div>
						)}
					</Form>
				</>
			)}
		</Formik>
	);
};

export default withStyles(styles)(Formulario);
