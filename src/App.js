import React, { useState } from 'react';

import { Route } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import Lista from './paginas/Lista';
import Novo from './paginas/Novo';

const App = () => {
	const [items, setItems] = useState(new Map());

	function adicionarItem(item) {
		const novoItems = new Map(items);
		novoItems.set(novoItems.size + 1, { id: novoItems.size + 1, ...item });

		setItems(novoItems);
	}

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<React.Fragment>
				<CssBaseline />

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
			</React.Fragment>
		</MuiPickersUtilsProvider>
	);
};

export default App;
