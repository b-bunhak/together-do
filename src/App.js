import React, { useState } from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import Lista from './paginas/Lista';
import Novo from './paginas/Novo';
import Visualizar from './paginas/Visualizar';

const App = () => {
	const [items, setItems] = useState(
		new Map([
			['1', { id: '1', item: 'Item', feito: false }],
			['2', { id: '2', item: 'Item 2', feito: false }],
			['3', { id: '3', item: 'Item 2', feito: false }],
			['4', { id: '4', item: 'Item 2', feito: false }],
			['5', { id: '5', item: 'Item 2', feito: false }],
			['6', { id: '6', item: 'Item 2', feito: false }],
			['7', { id: '7', item: 'Item 2', feito: false }],
			['8', { id: '8', item: 'Item 2', feito: false }],
			['9', { id: '9', item: 'Item 2', feito: false }],
			['10', { id: '10', item: 'Item 2', feito: false }],
			['11', { id: '11', item: 'Item 2', feito: false }],
			['12', { id: '12', item: 'Item 2', feito: false }],
			['13', { id: '13', item: 'Item 2', feito: false }],
			['14', { id: '14', item: 'Item 2', feito: false }]
		])
	);

	function adicionarItem(item) {
		const novoItems = new Map(items);

		const itemId = (novoItems.size + 1).toString();

		novoItems.set(itemId, { id: itemId, ...item });
		setItems(novoItems);
	}

	function editarItem(item) {
		const novoItems = new Map(items);

		if (item.id && novoItems.has(item.id)) {
			novoItems.set(item.id, { ...item });
			setItems(novoItems);
		}
	}

	function deletarItem(id) {
		const novoItems = new Map(items);

		if (id && novoItems.has(id)) {
			novoItems.delete(id);
			setItems(novoItems);
		}
	}

	function alterarFeito(id, status) {
		const item = items.get(id);

		if (item) {
			editarItem({
				...item,
				feito: status === undefined ? item.feito : status
			});
		}
	}

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<React.Fragment>
				<CssBaseline />

				<Switch>
					<Route
						exact
						path="/"
						render={routeProps => (
							<Lista
								{...routeProps}
								items={items}
								alterarFeito={alterarFeito}
							/>
						)}
					/>

					<Route
						exact
						path="/novo"
						render={routeProps => (
							<Novo {...routeProps} adicionarItem={adicionarItem} />
						)}
					/>

					<Route
						exact
						path="/:id"
						render={routeProps => {
							const {
								match: {
									params: { id }
								}
							} = routeProps;

							if (id && items.get(id)) {
								return (
									<Visualizar
										{...routeProps}
										inicial={items.get(id)}
										editarItem={editarItem}
										deletarItem={() => {
											deletarItem(id);
										}}
										alterarFeito={alterarFeito}
									/>
								);
							} else {
								return <Redirect to="/" />;
							}
						}}
					/>

					<Route render={() => <Redirect to="/" />} />
				</Switch>
			</React.Fragment>
		</MuiPickersUtilsProvider>
	);
};

export default App;
