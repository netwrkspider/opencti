import {
  escapeString,
  queryAttributeValues,
  queryAttributeValueById,
  deleteAttributeById,
  takeWriteTx,
  commitWriteTx,
  closeWriteTx,
  getAttributes,
  takeReadTx,
  closeReadTx
} from '../database/grakn';
import { logger } from '../config/conf';

export const findById = attributeId => queryAttributeValueById(attributeId);

export const findAll = args => queryAttributeValues(args.type);

export const addAttribute = async attribute => {
  const wTx = await takeWriteTx();
  try {
    const query = `insert $attribute isa ${
      attribute.type
    }; $attribute "${escapeString(attribute.value)}";`;
    logger.debug(`[GRAKN - infer: false] addAttribute > ${query}`);
    const attributeIterator = await wTx.tx.query(query);
    const createdAttribute = await attributeIterator.next();
    const createdAttributeId = await createdAttribute.map().get('attribute').id;
    await commitWriteTx(wTx);
    return {
      id: createdAttributeId,
      type: attribute.type,
      value: attribute.value
    };
  } catch (err) {
    logger.error(err);
    await closeWriteTx(wTx);
    return {};
  }
};

export const attributeDelete = async id => {
  return deleteAttributeById(id);
};

export const attributeUpdate = async (id, input) => {
  // Add the new attribute
  const newAttribute = await addAttribute({
    type: input.type,
    value: input.newValue
  });

  // region Link new attribute to every entities
  const wTx = await takeWriteTx();
  try {
    const writeQuery = `match $e isa entity, has ${escape(
      input.type
    )} $a; $a "${escapeString(input.value)}"; insert $e has ${escape(
      input.type
    )} $attribute; $attribute "${escapeString(input.newValue)}";`;
    logger.debug(`[GRAKN - infer: false] attributeUpdate > ${writeQuery}`);
    await wTx.tx.query(writeQuery);
    await commitWriteTx(wTx);
  } catch (err) {
    logger.error(err);
    await closeWriteTx(wTx);
  }
  // endregion

  // Delete old attribute
  await deleteAttributeById(id);

  // region Reindex all entities using this attribute
  const rTx = await takeReadTx();
  try {
    const readQuery = `match $x isa entity, has ${escape(
      input.type
    )} $a; get $x;`;
    const iterator = await rTx.tx.query(readQuery);
    const answers = await iterator.collect();
    await Promise.all(
      answers.map(answer => {
        const entity = answer.map().get('x');
        return getAttributes(entity, true);
      })
    );
    await closeReadTx(rTx);
  } catch (err) {
    logger.error(err);
    await closeReadTx(wTx);
  }
  // endregion

  // Return the new attribute
  return newAttribute;
};
