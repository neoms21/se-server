'use strict';

const getTime = () => {
    return new Date();
};

const applyCommonFields = (decoratee, source) => {
    if (!decoratee.properties)
        decoratee.properties = {};

    if (!decoratee.properties.created) {
        decoratee.properties.createdBy = source && source.properties ? source.properties.createdBy : 'unknown';
        decoratee.properties.created = exports.getTime();
        decoratee.properties.validFrom = decoratee.properties.created;
        decoratee.properties.validTo = new Date('31 dec 9999');
    } else {
        decoratee.properties.modified = exports.getTime();
    }
};

module.exports = exports = {
    getTime: getTime,
    applyCommonFields: applyCommonFields
};
