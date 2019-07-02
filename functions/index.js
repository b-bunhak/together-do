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

exports.sairGrupo = functions.https.onCall((data, context) => {
	const usuario = context.auth.uid;
	const grupoId = data.grupo;

	const db = admin.firestore();

	const grupoRef = db.collection('grupos').doc(grupoId);

	return db.runTransaction(transaction =>
		transaction.get(grupoRef).then(grupoDoc => {
			const admins = grupoDoc.get('admins');
			const membros = grupoDoc.get('membros');

			const novoAdmins = admins.filter(id => id !== usuario);
			const novoMembros = membros.filter(id => id !== usuario);

			if (novoAdmins.length === 0 && novoMembros.length > 0) {
				novoAdmins.push(novoMembros[0]);
			}

			return transaction.set(
				grupoRef,
				{
					admins: novoAdmins,
					membros: novoMembros
				},
				{ merge: true }
			);
		})
	);
});
