const globalObjectResolvers = {
  GlobalObject: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType(obj) {
      if (obj.observable_value) {
        return 'StixObservable';
      }
      if (obj.entity_type) {
        return obj.entity_type.replace(/(?:^|-)(\w)/g, (matches, letter) =>
          letter.toUpperCase()
        );
      }
      return 'Unknown';
    }
  }
};

export default globalObjectResolvers;
