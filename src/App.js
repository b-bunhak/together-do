import React from 'react';

import { Route } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';

import DateFnsUtils from '@date-io/date-fns';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import Lista from './paginas/Lista';
import Novo from './paginas/Novo';

const App = () => {
	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils}>
			<React.Fragment>
				<CssBaseline />

				<Route exact path="/" component={Lista} />

				<Route exact path="/novo" component={Novo} />
			</React.Fragment>
		</MuiPickersUtilsProvider>
	);
};

export default App;
