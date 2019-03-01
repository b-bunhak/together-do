import React from 'react';

import { Formik, Form, Field } from 'formik';

import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';

import Button from '@material-ui/core/Button';

import red from '@material-ui/core/colors/red';

import { Redirect } from 'react-router-dom';

import * as yup from 'yup';

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
		justifyContent: 'flex-end',
		marginTop: theme.spacing(1),
		'& > *': {
			marginLeft: theme.spacing(1)
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
	item: yup.string().required()
});

const inicialPadrao = { item: '' };

const Formulario = ({ classes, inicial, submit, cancelar, deletar }) => {
	return (
		<Formik
			initialStatus={{ submitted: false }}
			initialValues={inicial || inicialPadrao}
			validationSchema={schema}
			onSubmit={(values, { setStatus }) => {
				Promise.resolve(submit(values)).then(() => {
					setStatus({ submitted: true });
				});
			}}
		>
			{({ values, status, errors }) =>
				status.submitted && Object.keys(errors).length < 1 ? (
					<Redirect to="/" />
				) : (
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
								/>
							)}
						</Field>
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
					</Form>
				)
			}
		</Formik>
	);
};

export default withStyles(styles)(Formulario);
