import * as functions from 'firebase-functions';


function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}


const collections = ['messages', 'users'];

for (const collection of collections) {
    exports[`update${capitalize(collection)}UpdatedAtOnUpdate`] = functions.firestore.document(`/${collection}/{docId}`)
        .onUpdate((change, context) => {
            functions.logger.log(change.before, { structuredData: true })
            functions.logger.log(change.after, { structuredData: true })
            const prevTime = change.before.updateTime.seconds;
            const afterTime = change.after.updateTime.seconds;

            functions.logger.info(prevTime, afterTime, afterTime - prevTime, { structuredData: true });
            const shouldUpdate = afterTime - prevTime > 60;
            if (!shouldUpdate) {
                functions.logger.info("Too new to Update new");
                return null;
            }

            functions.logger.info(`Collection: ${collection}, Updating Document ID:${context.params.docId}`);
            const updatedAt = change.after.updateTime.toDate().toUTCString();
            return change.after.ref.update({ updated_at: updatedAt });
        });
}