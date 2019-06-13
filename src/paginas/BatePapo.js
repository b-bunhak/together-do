import React, { useState, useRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';

import Box from '@material-ui/core/Box';

import { format } from 'date-fns';

import FlipMove from 'react-flip-move';

const useStyles = makeStyles(theme => ({
	'@global': {
		html: {
			height: '100%'
		},
		body: { height: '100%' },
		'#root': { height: '100%', display: 'flex', flexDirection: 'column' }
	},

	pagina: {
		flex: 1,
		padding: 0,
		paddingTop: 0,
		paddingBottom: 0,
		display: 'flex',
		flexDirection: 'column'
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
			...props
		},
		ref
	) => (
		<Box
			bgcolor={enviada ? 'primary.dark' : 'primary.light'}
			color="primary.contrastText"
			borderRadius="borderRadius"
			alignSelf={enviada ? 'flex-end' : 'flex-start'}
			mt={anteriorMesmoAutor ? 0.15 : 1}
			mb={proximoMesmoAutor ? 0.15 : 1}
			p={1.25}
			fontSize="body1.fontSize"
			{...props}
			ref={ref}
		>
			{autor && (
				<Box
					fontSize="subtitle2.fontSize"
					fontWeight="subtitle2.fontWeight"
					mb={1}
				>
					{autor}
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
	)
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

	const [scroll, setScroll] = useState(true);

	function scrollToBottom() {
		if (
			listaRef.current.scrollTop !==
			listaRef.current.scrollHeight - listaRef.current.clientHeight
		) {
			listaRef.current.scroll({
				top: listaRef.current.scrollHeight - listaRef.current.clientHeight,
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
				css={{ overflowY: 'scroll' }}
				ref={ref => {
					if (ref) {
						listaRef.current = ref;

						if (firstRender.current) {
							ref.scrollTop = ref.scrollHeight - ref.clientHeight;
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
						e.target.scrollTop !== e.target.scrollHeight - e.target.clientHeight
					) {
						setScroll(false);
					}

					if (
						mensagensCount.current !== mensagens.length &&
						e.target.scrollTop === e.target.scrollHeight - e.target.clientHeight
					) {
						mensagensCount.current = mensagens.length;
					}

					if (
						!firstRender.current &&
						!scroll &&
						mensagensCount.current === mensagens.length &&
						e.target.scrollTop === e.target.scrollHeight - e.target.clientHeight
					) {
						setScroll(true);
					}
				}}
			>
				<FlipMove typeName={null}>
					{mensagens.map((mensagen, index, mensagens) => {
						const anterior = mensagens[index - 1];
						const proximo = mensagens[index + 1];

						return (
							<Mensagem
								key={mensagen.id}
								enviada={mensagen.autor === usuarioId}
								anteriorMesmoAutor={
									anterior && anterior.autor === mensagen.autor
								}
								proximoMesmoAutor={proximo && proximo.autor === mensagen.autor}
								autor={
									anterior && anterior.autor === mensagen.autor
										? undefined
										: membrosInfo[mensagen.autor].nome
								}
								horario={format(mensagen.data, 'HH:mm')}
								mensagem={mensagen.mensagen}
							/>
						);
					})}
				</FlipMove>
			</Box>

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
										enviarMensagem(input);
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
						scrollToBottom();
					}}
				/>
			</Box>
		</div>
	);
};

export default BatePapo;
