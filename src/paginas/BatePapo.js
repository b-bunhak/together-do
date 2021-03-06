import React, { useState, useRef } from 'react';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import ArrowDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import Slide from '@material-ui/core/Slide';

import { Typography } from '@material-ui/core';

import Box from '@material-ui/core/Box';

import indigo from '@material-ui/core/colors/indigo';

import { format, isSameDay } from 'date-fns';

import FlipMove from 'react-flip-move';

import randomColor from 'randomcolor';

const useStyles = makeStyles(theme => ({
	'@global': {
		html: {
			height: '100%',
			margin: 0,
			padding: 0
		},
		body: { height: '100%', margin: 0, padding: 0 },
		'#root': {
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			margin: 0,
			padding: 0
		}
	},

	pagina: {
		flex: 1,
		padding: 0,
		paddingTop: 0,
		paddingBottom: 0,
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden'
	}
}));

const Mensagem = React.forwardRef(
	(
		{
			autor,
			mensagem,
			horario,
			enviada = false,
			anteriorMesmoAutor = false,
			proximoMesmoAutor = false,
			hideAutor,
			...props
		},
		ref
	) => {
		const theme = useTheme();

		return (
			<Box
				//bgcolor={enviada ? indigo[600] : indigo['A200']}
				bgcolor={
					enviada
						? indigo[400]
						: randomColor({ seed: autor.id, luminosity: 'light' })
				}
				//color="primary.contrastText"
				color={
					enviada
						? 'primary.contrastText'
						: theme.palette.getContrastText(
								randomColor({ seed: autor.id, luminosity: 'light' })
						  )
				}
				borderRadius="borderRadius"
				alignSelf={enviada ? 'flex-end' : 'flex-start'}
				mt={anteriorMesmoAutor ? 0.15 : 1}
				mb={proximoMesmoAutor ? 0.15 : 1}
				p={1.25}
				fontSize="body1.fontSize"
				{...props}
				ref={ref}
			>
				{!hideAutor && (
					<Box
						fontSize="subtitle2.fontSize"
						fontWeight="subtitle2.fontWeight"
						mb={1}
						//color={randomColor({ seed: autor.id, luminosity: 'light' })}
					>
						{autor.nome}
					</Box>
				)}
				{mensagem}

				<Box
					fontSize="overline.fontSize"
					fontWeight="overline.fontWeight"
					display="inline-block"
					mt={1.5}
					mb={-1}
					ml={2.5}
					css={{ float: 'right', verticalAlign: 'bottom' }}
				>
					{horario}
				</Box>
			</Box>
		);
	}
);

const BatePapo = ({
	mensagens = [],
	enviarMensagem,
	usuarioId,
	membrosInfo
}) => {
	const classes = useStyles();

	const [input, setInput] = useState('');

	const firstRender = useRef(true);

	const listaRef = useRef();

	const mensagensCount = useRef(0);

	const inputContainerRef = useRef();

	const [scroll, setScroll] = useState(true);

	function scrollToBottom() {
		if (
			listaRef.current &&
			listaRef.current.scrollTop !==
				listaRef.current.scrollHeight - listaRef.current.offsetHeight
		) {
			listaRef.current.scroll({
				top: listaRef.current.scrollHeight - listaRef.current.offsetHeight,
				behavior: 'smooth'
			});
		}
	}

	return (
		<div className={classes.pagina}>
			<Box
				display="flex"
				flex={1}
				p={1}
				px={2}
				flexDirection="column"
				alignItems="flex-start"
				position="relative"
				css={{ overflowY: 'scroll', '-webkit-overflow-scrolling': 'touch' }}
				ref={ref => {
					if (ref) {
						listaRef.current = ref;

						if (firstRender.current) {
							ref.scrollTop = ref.scrollHeight - ref.offsetHeight;
							firstRender.current = false;
						}

						if (scroll) {
							scrollToBottom();
						}
					}
				}}
				onScroll={e => {
					if (
						!firstRender.current &&
						scroll &&
						mensagensCount.current === mensagens.length &&
						e.target.scrollTop <=
							e.target.scrollHeight -
								e.target.offsetHeight -
								inputContainerRef.current.offsetHeight * 2
					) {
						setScroll(false);
					}

					if (
						mensagensCount.current !== mensagens.length &&
						e.target.scrollTop === e.target.scrollHeight - e.target.offsetHeight
					) {
						mensagensCount.current = mensagens.length;
					}

					if (
						!firstRender.current &&
						!scroll &&
						mensagensCount.current === mensagens.length &&
						e.target.scrollTop === e.target.scrollHeight - e.target.offsetHeight
					) {
						setScroll(true);
					}
				}}
			>
				<FlipMove typeName={null}>
					{mensagens.map((mensagen, index, mensagens) => {
						const anterior = mensagens[index - 1];
						const proximo = mensagens[index + 1];

						const hoje = isSameDay(mensagen.data, new Date());

						const mostrarData =
							(!anterior && !hoje) ||
							(anterior && !isSameDay(mensagen.data, anterior.data));

						return (
							<React.Fragment key={mensagen.id}>
								{mostrarData && (
									<Box clone alignSelf="center" my={1}>
										<Typography
											variant="subtitle1"
											align="center"
											component="div"
										>
											{hoje
												? 'Hoje'
												: mensagen.data.toLocaleDateString(undefined, {
														weekday: 'short',
														day: '2-digit',
														month: 'long'
												  })}
										</Typography>
									</Box>
								)}
								<Mensagem
									enviada={mensagen.autor === usuarioId}
									anteriorMesmoAutor={
										!anterior || anterior.autor === mensagen.autor
									}
									proximoMesmoAutor={
										proximo && proximo.autor === mensagen.autor
									}
									hideAutor={
										anterior &&
										anterior.autor === mensagen.autor &&
										isSameDay(anterior.data, mensagen.data)
									}
									autor={{
										id: mensagen.autor,
										nome: membrosInfo[mensagen.autor].nome
									}}
									horario={format(mensagen.data, 'HH:mm')}
									mensagem={mensagen.mensagen}
								/>
							</React.Fragment>
						);
					})}
				</FlipMove>
			</Box>

			<Box position="relative" ref={inputContainerRef}>
				<Slide direction="left" in={!scroll}>
					<Box
						component={Card}
						position="absolute"
						mb={2}
						pr={2.5}
						css={{
							bottom: '100%',
							right: 0,
							borderTopRightRadius: 0,
							borderBottomRightRadius: 0
						}}
					>
						<IconButton edge="end" onClick={scrollToBottom}>
							<ArrowDownCircleIcon />
						</IconButton>
					</Box>
				</Slide>

				<Box component="form" mt="auto" mb={1} mx={1.5}>
					<TextField
						fullWidth
						multiline
						rowsMax="4"
						variant="outlined"
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										edge="end"
										color="primary"
										type="submit"
										onClick={e => {
											e.preventDefault();
											if (input.trim()) {
												enviarMensagem(input);
											}
											setScroll(true);
											setInput('');
										}}
									>
										<SendIcon />
									</IconButton>
								</InputAdornment>
							)
						}}
						value={input}
						onChange={e => {
							setInput(e.target.value);
						}}
					/>
				</Box>
			</Box>
		</div>
	);
};

export default BatePapo;
