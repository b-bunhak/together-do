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
			['2', { id: '2', item: 'Item 2', feito: false }]
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
						render={routeProps => <Lista {...routeProps} items={items} />}
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
