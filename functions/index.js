const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.aceitarConvite = functions.firestore
	.document('convites/{conviteId}')
	.onUpdate(change => {
		const before = change.before.data();

		const { valido, usuarioAceito, dataAceito, grupo } = change.after.data();

		if (before.valido && !valido && usuarioAceito && !dataAceito) {
			const db = admin.firestore();

			const grupoRef = db.collection('grupos').doc(grupo);

			return db.runTransaction(transaction => {
				return transaction.get(grupoRef).then(snapshot => {
					const membros = snapshot.get('membros') || [];

					if (!membros.includes(usuarioAceito)) {
						transaction.set(
							grupoRef,
							{ membros: [...membros, usuarioAceito] },
							{ merge: true }
						);

						transaction.set(
							change.after.ref,
							{
								dataAceito: admin.firestore.FieldValue.serverTimestamp()
							},
							{ merge: true }
						);
					}
				});
			});
		}

		return null;
	});
