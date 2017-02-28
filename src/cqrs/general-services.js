'use strict';

const getTime = () => {
    return new Date();
};

const applyCommonFields = (decoratee, source) => {
    if (decoratee.properties === undefined) {
        decoratee.properties = {};
    }

    decoratee.properties.created = exports.getTime();
    decoratee.properties.createdBy = source !== undefined ? source.userId : 'unknown';
    decoratee.properties.validFrom = decoratee.properties.created;
    decoratee.properties.validTo = new Date('31 dec 9999');
};

module.exports = exports = {
    getTime: getTime,
    applyCommonFields: applyCommonFields
};
