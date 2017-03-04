
const create = (name, correlationId, userId, timeOfDay) => {
  let cmd = {
      properties: {
          commandName: name,
          correlationId: correlationId,
          createdBy: userId,
          created: timeOfDay,
          validFrom: timeOfDay,
          validTo: new Date('31 dec 9999')
      }
  };

  return cmd;
};

module.exports = {
    create: create
};