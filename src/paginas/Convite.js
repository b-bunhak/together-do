import React from 'react';

const Convite = ({
	match: {
		params: { id }
	}
}) => {
	return <div>hi --- {console.log(id)}</div>;
};

export default Convite;
