'use strict';

const getTime = () => {
    return new Date();
};

const applyCommonFields = (decoratee, source) => {
    decoratee.created = exports.getTime();
    decoratee.createdBy = source.userId;
    decoratee.validFrom = decoratee.created;
    decoratee.validTo = new Date('31 dec 9999');
};

module.exports = exports = {
    getTime: getTime,
    applyCommonFields: applyCommonFields
};
