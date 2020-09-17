const methodCallUtil = {
  getMethodCallConfigFromPropMap(map = new Map(), requestedKeys?: Array<string>) {
    let desiredKeys = Array.from(map.keys());

    if (requestedKeys != null) {
      desiredKeys = desiredKeys.filter((key) => requestedKeys.includes(key));
    }

    return desiredKeys.reduce(
      (accumulator, key) => {
        const {methodCall, transformValue} = map.get(key);

        accumulator.methodCalls.push(methodCall);
        accumulator.propLabels.push(key);

        if (transformValue == null) {
          accumulator.valueTransformations.push((value: unknown) => value);
        } else {
          accumulator.valueTransformations.push(transformValue);
        }

        return accumulator;
      },
      {
        methodCalls: [],
        propLabels: [],
        valueTransformations: [],
      },
    );
  },
};

export default methodCallUtil;
